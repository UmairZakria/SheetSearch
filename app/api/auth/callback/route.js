// app/api/auth/callback/route.js
// Step 2 of the OAuth flow: exchange the code for tokens, persist them in the session,
// then redirect back to the app.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';
import { exchangeCodeForTokens, fetchUserProfile } from '@/lib/google.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(errorParam)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?auth_error=missing_code', request.url)
    );
  }

  const session = await getSession();
  const state = session.oauthState;
  if (!state?.csrf) {
    return NextResponse.redirect(
      new URL('/?auth_error=missing_state', request.url)
    );
  }
  // Clear the one-time state so it can't be reused.
  delete session.oauthState;

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.access_token) {
      throw new Error('No access_token returned from Google.');
    }

    const profile = await fetchUserProfile(tokens.access_token);

    session.tokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || session.tokens?.refresh_token || null,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
      id_token: tokens.id_token,
    };
    session.user = profile;
    session.authenticatedAt = Date.now();

    await session.save();

    const returnTo = state.returnTo || '/';
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent('callback_failed')}`, request.url)
    );
  }
}
