// app/api/auth/logout/route.js
// Clears the encrypted session cookie.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session.js';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
