// lib/session.js
// Encrypted, HTTP-only cookie sessions powered by iron-session.
// Token secrets are NEVER exposed to the client.

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

const PASSWORD =
  process.env.SESSION_PASSWORD ||
  'dev-only-insecure-password-please-set-SESSION_PASSWORD-in-env-32chars';

if (
  process.env.NODE_ENV === 'production' &&
  PASSWORD.startsWith('dev-only')
) {
  // eslint-disable-next-line no-console
  console.error(
    'SESSION_PASSWORD is not set. Refusing to run in production with a weak secret.'
  );
  throw new Error('SESSION_PASSWORD must be set in production');
}

export const sessionOptions = {
  cookieName: 'sheet_search_session',
  password: PASSWORD,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getSession() {
  return getIronSession(cookies(), sessionOptions);
}

// Build the OAuth state payload stored in the encrypted session.
// state lets us carry a one-time CSRF token and the "selected sheet IDs" through the round-trip.
export function buildAuthState({ csrf, returnTo }) {
  return { csrf, returnTo: returnTo || '/' };
}
