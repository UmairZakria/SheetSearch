'use client';

// components/SearchDashboard.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import SignOutButton from '@/components/SignOutButton.js';
import SheetPicker from '@/components/SheetPicker.js';
import ResultsList from '@/components/ResultsList.js';
import Footer from '@/components/Footer.js';
import { Loader2, FileSpreadsheet } from 'lucide-react';

const DEBOUNCE_MS = 350;

export default function SearchDashboard({ initialUser, onSignedOut }) {
  const [user, setUser] = useState(initialUser || null);
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
  const [searchErrors, setSearchErrors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

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
      if (err.code === 'google_auth_expired' || err.code === 'not_authenticated') {
        onSignedOut ? onSignedOut() : window.location.reload();
      }
    } finally {
      setSheetsLoading(false);
    }
  }, [onSignedOut]);

  useEffect(() => {
    loadSheets();
  }, [loadSheets]);

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
    if (!canSearch) return;

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
  }, [debouncedKeyword, selectedIds, caseSensitive, canSearch]);

  function handleSignOut() {
    if (onSignedOut) {
      onSignedOut();
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                <FileSpreadsheet className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SheetSearch</h1>
                {user?.email && (
                  <p className="text-xs text-slate-500">Signed in as {user.email}</p>
                )}
              </div>
            </div>
            <SignOutButton onSignedOut={handleSignOut} />
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
                  <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
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
      </main>
      <Footer />
    </div>
  );
}
