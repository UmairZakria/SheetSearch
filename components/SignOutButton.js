'use client';

import { LogOut } from 'lucide-react';
// components/SignOutButton.js
import { useState } from 'react';

export default function SignOutButton({ onSignedOut }) {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onSignedOut?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="rounded-md flex gap-[0.4vw] items-center hover:cursor-pointer hover:shadow-xl justify-center px-[1.4vw] py-[0.8vw] text-base font-poppins font-medium text-black ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
    >

      {busy ? 'Signing out…' : 'Sign out'}
      <LogOut  className='size-[0.85vw]' />
    </button>
  );
}
