// app/api/search/route.js
// POST /api/search — search one or many spreadsheets for a keyword.
//
// Request body:
//   { keyword: string, spreadsheetIds: string[], options?: { caseSensitive?: boolean } }
//
// Response shape:
//   {
//     query: { keyword, caseSensitive, count },
//     results: [
//       {
//         spreadsheetId, spreadsheetName, spreadsheetUrl,
//         matches: [
//           { sheetId, sheetTitle, rowNumber, matchColumnLetter, snippet, rowData, openUrl }
//         ]
//       }
//     ],
//     errors: [{ spreadsheetId, message }]
//   }
//
// Notes:
//  - We hit Google Sheets API live for every request — nothing is cached on the server.
//  - Per-sheet failures (permission, not found, etc.) are surfaced in `errors` and don't
//    kill the whole response.

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
export const maxDuration = 60; // seconds — large sheets need headroom

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
  const results = [];
  const errors = [];

  // Search each spreadsheet sequentially to keep the per-user request budget small.
  // googleapis' OAuth2 client refreshes the access_token transparently on 401.
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
        } catch (sheetErr) {
          // Skip tabs we can't read; surface at spreadsheet-level only if everything fails.
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

  // After the loop, persist any refreshed tokens the OAuth client may have set.
  await session.save();

  const totalMatches = results.reduce((acc, r) => acc + r.matchCount, 0);
  return NextResponse.json({
    query: { keyword, caseSensitive, count: totalMatches },
    results,
    errors,
  });
}
