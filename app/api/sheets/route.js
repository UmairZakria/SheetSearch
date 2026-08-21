// app/api/sheets/route.js
// GET /api/sheets — list Google Sheets the user has access to via Drive API.
// Returns a trimmed payload (id, name, modifiedTime, webViewLink) — never returns tokens.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';
import { listUserSheets } from '@/lib/google.js';
import { authRequiredError, errorResponse } from '@/lib/errors.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.tokens?.access_token) {
    const { error, status } = errorResponse(authRequiredError());
    return NextResponse.json(error, { status });
  }

  try {
    const { files, nextPageToken } = await listUserSheets(session.tokens);
    const sheets = files.map((f) => ({
      id: f.id,
      name: f.name,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink,
      owner:
        f.owners && f.owners.length
          ? {
              name: f.owners[0].displayName,
              email: f.owners[0].emailAddress,
            }
          : null,
    }));
    return NextResponse.json({ sheets, nextPageToken });
  } catch (err) {
    // If the access token is dead and refresh failed, wipe the session so the UI can re-prompt.
    if (err?.response?.status === 401) {
      session.tokens = null;
      session.user = null;
      await session.save();
    }
    const { error, status } = errorResponse(err);
    return NextResponse.json(error, { status });
  }
}
