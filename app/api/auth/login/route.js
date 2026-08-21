// app/api/auth/login/route.js
// Step 1 of the OAuth flow: redirect the user to Google's consent screen.
// We stash a CSRF token + returnTo in the encrypted session first.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/session.js';
import { getAuthUrl } from '@/lib/google.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const session = await getSession();
  const csrf = crypto.randomBytes(16).toString('hex');
  const returnTo = new URL(request.url).searchParams.get('returnTo') || '/';

  session.oauthState = { csrf, returnTo, createdAt: Date.now() };
  await session.save();

  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
