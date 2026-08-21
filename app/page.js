'use client';

// app/page.js
// Single-page client UI. Owns the four states of the funnel:
//   not-authed → loading → select-sheets → searching → results

import { useCallback, useEffect, useMemo, useState } from 'react';
import ConnectButton from '@/components/ConnectButton.js';
import SignOutButton from '@/components/SignOutButton.js';
import SheetPicker from '@/components/SheetPicker.js';
import ResultsList from '@/components/ResultsList.js';
import Footer from '@/components/Footer.js';

const DEBOUNCE_MS = 350;

export default function Home() {
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authed' | 'guest'
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  const [sheets, setSheets] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState(null);

  const [keyword, setKeyword] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchErrors, setSearchErrors] = useState([]); // per-sheet errors
  const [hasSearched, setHasSearched] = useState(false);

  // -------- Auth --------
  useEffect(() => {
    // Parse ?auth_error from the URL if Google bounced the user back.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('auth_error');
      if (err) {
        setAuthError(err);
        params.delete('auth_error');
        const next =
          params.toString().length > 0
            ? `?${params.toString()}`
            : window.location.pathname;
        window.history.replaceState({}, '', next);
      }
    }

    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((data) => {
        setAuthState(data.authenticated ? 'authed' : 'guest');
        setUser(data.user || null);
      })
      .catch(() => setAuthState('guest'));
  }, []);

  // -------- Sheets list --------
  const loadSheets = useCallback(async () => {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      const res = await fetch('/api/sheets');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load spreadsheets.');
      setSheets(data.sheets || []);
    } catch (err) {
      setSheetsError(err.message);
      // If our session expired, bounce back to the connect screen.
      if (err.code === 'google_auth_expired' || err.code === 'not_authenticated') {
        setAuthState('guest');
        setUser(null);
      }
    } finally {
      setSheetsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState === 'authed') loadSheets();
  }, [authState, loadSheets]);

  // -------- Search (debounced, live) --------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [keyword]);

  const canSearch = useMemo(
    () =>
      debouncedKeyword.length > 0 &&
      selectedIds.size > 0 &&
      !searching,
    [debouncedKeyword, selectedIds, searching]
  );

  useEffect(() => {
    if (!canSearch) {
      // Don't clear results on a transient empty state; just stop requesting.
      return;
    }
    let cancelled = false;
    async function run() {
      setSearching(true);
      setSearchError(null);
      setSearchErrors([]);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: debouncedKeyword,
            spreadsheetIds: Array.from(selectedIds),
            options: { caseSensitive },
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw Object.assign(new Error(data?.message || 'Search failed.'), data);
        setResults(data.results || []);
        setSearchErrors(data.errors || []);
        setHasSearched(true);
      } catch (err) {
        if (cancelled) return;
        setSearchError(err.message || 'Search failed.');
        setHasSearched(true);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedKeyword, selectedIds, caseSensitive]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSignedOut() {
    setAuthState('guest');
    setUser(null);
    setSheets([]);
    setSelectedIds(new Set());
    setKeyword('');
    setResults(null);
    setHasSearched(false);
  }

  // -------- Render --------

  if (authState === 'loading') {
    return (
      <Shell>
        <Center>
          <Spinner /> <span className="text-slate-500">Loading…</span>
        </Center>
      </Shell>
    );
  }

  if (authState === 'guest') {
    return (
      <Shell>
        <Center>
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <Logo />
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Search all your Google Sheets
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Connect your Google account to find any keyword across the
              spreadsheets you choose — instantly, with read-only access.
            </p>
            <div className="mt-6 flex justify-center">
              <ConnectButton />
            </div>
            {authError && (
              <p className="mt-4 text-sm text-red-600">
                We couldn&apos;t complete sign-in ({authError}). Please try again.
              </p>
            )}
            <p className="mt-6 text-xs text-slate-400">
              Read-only access. We never store your sheet data.
            </p>
          </div>
        </Center>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo small />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Sheet Search</h1>
              {user?.email && (
                <p className="text-xs text-slate-500">Signed in as {user.email}</p>
              )}
            </div>
          </div>
          <SignOutButton onSignedOut={handleSignedOut} />
        </header>

        {/* Search input */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <label
            htmlFor="keyword"
            className="block text-sm font-medium text-slate-700"
          >
            Search keyword
          </label>
          <div className="relative mt-2">
            <input
              id="keyword"
              type="search"
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. invoice number, customer name, SKU…"
              className="block w-full rounded-xl border-0 px-4 py-3.5 text-base text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500"
            />
            {searching && (
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <Spinner small />
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Match case
            </label>
            <span className="text-xs text-slate-400">
              {selectedIds.size} spreadsheet
              {selectedIds.size === 1 ? '' : 's'} selected · searching live
            </span>
          </div>
        </div>

        {/* Sheet picker */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-700">Spreadsheets</h2>
            <button
              type="button"
              onClick={loadSheets}
              disabled={sheetsLoading}
              className="text-xs font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50"
            >
              {sheetsLoading ? 'Refreshing…' : 'Refresh list'}
            </button>
          </div>
          {sheetsError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {sheetsError}
            </p>
          )}
          {!sheetsError && (
            <SheetPicker
              sheets={sheets}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
              disabled={sheetsLoading}
            />
          )}
        </section>

        {/* Results */}
        {searchError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
            {searchError}
          </div>
        )}
        {searchErrors.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
            <p className="font-medium">Some spreadsheets couldn&apos;t be searched:</p>
            <ul className="mt-1 list-disc pl-5">
              {searchErrors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          </div>
        )}
        {results && results.length > 0 && (
          <ResultsList
            results={results}
            keyword={debouncedKeyword}
            caseSensitive={caseSensitive}
          />
        )}
        {hasSearched && results && results.length === 0 && !searchError && (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            No matches for{' '}
            <span className="font-semibold text-slate-700">
              &ldquo;{debouncedKeyword}&rdquo;
            </span>
            .
          </div>
        )}
      </div>
    </Shell>
  );
}

// -------- Layout pieces --------

function Shell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}

function Center({ children }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}

function Logo({ small = false }) {
  const size = small ? 28 : 40;
  return (
    <div
      className="grid place-items-center rounded-xl bg-brand-600 text-white shadow-sm"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 4h16v16H4z"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.4"
        />
        <path d="M4 8h16" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 16h16" stroke="currentColor" strokeWidth="1.6" />
        <rect x="6" y="6" width="3" height="2" fill="currentColor" />
        <rect x="6" y="10" width="3" height="2" fill="currentColor" />
        <rect x="6" y="14" width="3" height="2" fill="currentColor" />
      </svg>
    </div>
  );
}

function Spinner({ small = false }) {
  const dim = small ? 16 : 24;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      className="animate-spin text-brand-600"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.2"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
}
