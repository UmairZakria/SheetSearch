// app/api/auth/status/route.js
// Lightweight endpoint the frontend polls/reads on load.
// Only ever returns non-sensitive user info; tokens stay in the cookie.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  const isAuthed = Boolean(session.tokens?.access_token);
  return NextResponse.json({
    authenticated: isAuthed,
    user: isAuthed ? session.user : null,
  });
}
