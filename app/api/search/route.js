// app/api/search/route.js
// POST /api/search — live search across spreadsheets with real-time streaming updates.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';
import {
  getSpreadsheetMeta,
  getSheetValues,
  buildSheetRowLink,
} from '@/lib/google.js';
import { searchRows, defaultRangeForSheet } from '@/lib/search.js';
import { authRequiredError, badRequestError, errorResponse, toAppError } from '@/lib/errors.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds

export async function POST(request) {
  const session = await getSession();
  if (!session.tokens?.access_token) {
    const { error, status } = errorResponse(authRequiredError());
    return NextResponse.json(error, { status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    const { error, status } = errorResponse(badRequestError('Invalid JSON body.'));
    return NextResponse.json(error, { status });
  }

  const keyword = String(body?.keyword || '').trim();
  const spreadsheetIds = Array.isArray(body?.spreadsheetIds)
    ? body.spreadsheetIds.map(String).filter(Boolean)
    : [];
  const caseSensitive = Boolean(body?.options?.caseSensitive);
  const isStream = body?.stream !== false; // default to streaming for live second-by-second logs

  if (!keyword) {
    const { error, status } = errorResponse(badRequestError('Please enter a keyword.'));
    return NextResponse.json(error, { status });
  }
  if (keyword.length > 200) {
    const { error, status } = errorResponse(badRequestError('Keyword is too long (max 200 chars).'));
    return NextResponse.json(error, { status });
  }
  if (spreadsheetIds.length === 0) {
    const { error, status } = errorResponse(badRequestError('Select at least one spreadsheet to search.'));
    return NextResponse.json(error, { status });
  }
  if (spreadsheetIds.length > 25) {
    const { error, status } = errorResponse(badRequestError('Too many spreadsheets. Limit is 25 per search.'));
    return NextResponse.json(error, { status });
  }

  const tokens = session.tokens;

  if (!isStream) {
    // Non-streaming fallback
    const results = [];
    const errors = [];
    for (const spreadsheetId of spreadsheetIds) {
      try {
        const meta = await getSpreadsheetMeta(tokens, spreadsheetId);
        const spreadsheetName = meta?.properties?.title || 'Untitled spreadsheet';
        const tabs = meta?.sheets || [];
        const sheetMatches = [];

        for (const tab of tabs) {
          const sheetTitle = tab?.properties?.title;
          const sheetId = tab?.properties?.sheetId ?? 0;
          if (!sheetTitle) continue;

          const range = defaultRangeForSheet(sheetTitle);
          let rows = [];
          try {
            rows = await getSheetValues(tokens, spreadsheetId, range);
          } catch {
            continue;
          }

          const matches = searchRows(rows, keyword, { caseSensitive });
          for (const m of matches) {
            sheetMatches.push({
              sheetId,
              sheetTitle,
              rowNumber: m.rowNumber,
              matchColumnLetter: m.matchColumnLetter,
              snippet: m.snippet,
              rowData: m.rowData,
              openUrl: buildSheetRowLink({
                spreadsheetId,
                sheetId,
                rowNumber: m.rowNumber,
              }),
            });
          }
        }

        results.push({
          spreadsheetId,
          spreadsheetName,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`,
          matchCount: sheetMatches.length,
          matches: sheetMatches,
        });
      } catch (err) {
        const appErr = toAppError(err);
        errors.push({ spreadsheetId, code: appErr.code, message: appErr.message });
      }
    }

    await session.save();
    const totalMatches = results.reduce((acc, r) => acc + r.matchCount, 0);
    return NextResponse.json({
      query: { keyword, caseSensitive, count: totalMatches },
      results,
      errors,
    });
  }

  // --- Streaming Response (NDJSON) ---
  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      }

      send({
        type: 'start',
        total: spreadsheetIds.length,
        keyword,
      });

      let totalMatches = 0;
      let currentIndex = 0;

      for (const spreadsheetId of spreadsheetIds) {
        currentIndex++;
        try {
          // Fetch meta
          const meta = await getSpreadsheetMeta(tokens, spreadsheetId);
          const spreadsheetName = meta?.properties?.title || 'Untitled spreadsheet';
          const tabs = meta?.sheets || [];

          send({
            type: 'checking',
            spreadsheetId,
            spreadsheetName,
            index: currentIndex,
            total: spreadsheetIds.length,
            tabCount: tabs.length,
          });

          const sheetMatches = [];

          for (const tab of tabs) {
            const sheetTitle = tab?.properties?.title;
            const sheetId = tab?.properties?.sheetId ?? 0;
            if (!sheetTitle) continue;

            const range = defaultRangeForSheet(sheetTitle);
            let rows = [];
            try {
              rows = await getSheetValues(tokens, spreadsheetId, range);
            } catch {
              continue;
            }

            const matches = searchRows(rows, keyword, { caseSensitive });
            for (const m of matches) {
              sheetMatches.push({
                sheetId,
                sheetTitle,
                rowNumber: m.rowNumber,
                matchColumnLetter: m.matchColumnLetter,
                snippet: m.snippet,
                rowData: m.rowData,
                openUrl: buildSheetRowLink({
                  spreadsheetId,
                  sheetId,
                  rowNumber: m.rowNumber,
                }),
              });
            }
          }

          const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/edit`;
          totalMatches += sheetMatches.length;

          if (sheetMatches.length > 0) {
            send({
              type: 'found',
              spreadsheetId,
              spreadsheetName,
              spreadsheetUrl,
              matchCount: sheetMatches.length,
              matches: sheetMatches,
              index: currentIndex,
              total: spreadsheetIds.length,
            });
          } else {
            send({
              type: 'not_found',
              spreadsheetId,
              spreadsheetName,
              spreadsheetUrl,
              index: currentIndex,
              total: spreadsheetIds.length,
            });
          }
        } catch (err) {
          const appErr = toAppError(err);
          send({
            type: 'error',
            spreadsheetId,
            message: appErr.message || 'Could not search this sheet',
            index: currentIndex,
            total: spreadsheetIds.length,
          });
        }
      }

      await session.save();

      send({
        type: 'done',
        totalMatches,
        durationMs: Date.now() - startTime,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
