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
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Logo small />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                SheetSearch
              </span>
            </div>

            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
              <a href="#purpose" className="transition hover:text-brand-600">
                Purpose &amp; Features
              </a>
              <a href="#how-it-works" className="transition hover:text-brand-600">
                How It Works
              </a>
              <a href="#permissions" className="transition hover:text-brand-600">
                Google Scopes
              </a>
              <a href="#security" className="transition hover:text-brand-600">
                Security &amp; Privacy
              </a>
              <a href="#faq" className="transition hover:text-brand-600">
                FAQ
              </a>
            </nav>

            <div>
              <a
                href="/api/auth/login"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Connect Google
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 pt-12 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
              Real-Time Google Sheets Multi-Search Utility
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Search Across All Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-600 to-blue-500 bg-clip-text text-transparent">
                Google Sheets
              </span>{' '}
              Instantly
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              <strong>SheetSearch</strong> is a dedicated search productivity tool designed to help you locate any keyword, transaction, invoice number, customer record, or SKU across multiple Google Spreadsheets at once—with zero sheet data stored on our servers.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ConnectButton />
            </div>

            {authError && (
              <div className="mx-auto mt-6 max-w-md rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                We couldn&apos;t complete sign-in ({authError}). Please try again.
              </div>
            )}

            {/* Trust Highlights */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80">
                <div className="text-sm font-semibold text-slate-900">🔒 Read-Only</div>
                <div className="text-xs text-slate-500 mt-0.5">Cannot edit or alter sheets</div>
              </div>
              <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80">
                <div className="text-sm font-semibold text-slate-900">🚫 Zero Storage</div>
                <div className="text-xs text-slate-500 mt-0.5">No sheet data saved to servers</div>
              </div>
              <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80">
                <div className="text-sm font-semibold text-slate-900">⚡ Live Search</div>
                <div className="text-xs text-slate-500 mt-0.5">Real-time Sheets API queries</div>
              </div>
              <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-slate-200/80">
                <div className="text-sm font-semibold text-slate-900">🎯 Deep Linking</div>
                <div className="text-xs text-slate-500 mt-0.5">Jumps to exact matching row</div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Purpose Section */}
        <section id="purpose" className="border-t border-slate-200/70 bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Application Purpose
              </h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Why We Built SheetSearch
              </p>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Google Drive and Google Sheets natively limit your in-sheet searching to one document at a time. When managing dozens of project sheets, monthly financial reports, inventory logs, or customer lists, finding a single piece of information requires opening each file individually.
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                <strong>SheetSearch</strong> solves this problem by allowing you to select your spreadsheets and execute live, high-speed keyword queries across all of them in parallel.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Multi-Spreadsheet Search</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Select multiple spreadsheets from your Google Drive and search across all tabs simultaneously in one unified search view.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Instant Row Context</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  See the exact spreadsheet title, sheet/tab name, matching row number, and the full row data with matched cells highlighted.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">1-Click Deep Navigation</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Every search result includes a direct deep-link that opens the Google Sheet scrolled directly to the exact row and cell range.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Live, Real-Time Queries</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  No stale caches. Queries fetch live data via Google APIs so any modifications made to your Google Sheets seconds ago are reflected.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Strict Zero Data Storage</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Your spreadsheets never get saved to any database. Search data is processed ephemerally in volatile memory during your request only.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">Encrypted Client Sessions</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Authentication tokens are kept inside encrypted, HTTP-only cookie sessions. Revoke permissions anytime from your Google Account.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Step-by-Step Workflow
              </h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                How SheetSearch Works
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
                A simple 4-step workflow to search across all your spreadsheets in seconds.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 1</div>
                <h3 className="mt-2 text-base font-bold text-slate-900">Connect Google</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Click &quot;Connect with Google&quot; to securely sign in using Google OAuth with read-only permissions.
                </p>
              </div>

              <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 2</div>
                <h3 className="mt-2 text-base font-bold text-slate-900">Pick Spreadsheets</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Select which Google Sheets you want to search through your list of accessible Drive spreadsheets.
                </p>
              </div>

              <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 3</div>
                <h3 className="mt-2 text-base font-bold text-slate-900">Search Keyword</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Type any search term, customer name, date, or SKU. SheetSearch queries your selected sheets live.
                </p>
              </div>

              <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 4</div>
                <h3 className="mt-2 text-base font-bold text-slate-900">Open Exact Row</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Review matching rows with highlighted matching cells and click &quot;Open in Sheets&quot; to jump straight to that row.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Google API Scopes & Transparency Section */}
        <section id="permissions" className="border-t border-slate-200/70 bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                OAuth Consent &amp; Transparency
              </h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Google API Permissions Requested
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
                SheetSearch requests only the minimal read-only permissions needed to deliver the search functionality.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800">
                    drive.readonly
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      https://www.googleapis.com/auth/drive.readonly
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      <strong>Purpose:</strong> Used exclusively to retrieve your list of Google Sheets filenames and IDs so you can pick which spreadsheets you wish to search. SheetSearch cannot modify, create, or delete any files.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800">
                    spreadsheets.readonly
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      https://www.googleapis.com/auth/spreadsheets.readonly
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      <strong>Purpose:</strong> Used strictly during active search requests to read tab names and cell values within your chosen spreadsheets to identify matching keyword rows. Data is never stored permanently.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800">
                    openid / email / profile
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Basic Profile &amp; Email
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      <strong>Purpose:</strong> Used solely to authenticate your session and display your signed-in email address in the application interface.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border-l-4 border-brand-500 bg-brand-50/70 p-4 text-xs leading-relaxed text-slate-700">
              <strong>Google API Services User Data Policy:</strong> SheetSearch&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-700 underline hover:text-brand-800"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </div>
          </div>
        </section>

        {/* Security & FAQ Section */}
        <section id="security" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Security &amp; FAQ
              </h2>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Frequently Asked Questions
              </p>
            </div>

            <div id="faq" className="mt-10 space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Does SheetSearch save or store my spreadsheet data?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  <strong>No.</strong> SheetSearch operates with zero persistent storage. When you perform a search, spreadsheet cells are read ephemerally in volatile memory to locate matching keywords and returned immediately to your browser. No spreadsheet contents, formulas, or search terms are saved to a database.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Can SheetSearch edit or delete my spreadsheets?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  <strong>No.</strong> We only request read-only scopes (<code>drive.readonly</code> and <code>spreadsheets.readonly</code>). The application has no write, edit, or delete capabilities on your files.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  How do I disconnect my Google Account?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  You can sign out at any time via the &quot;Sign Out&quot; button, which destroys your encrypted session cookie. You can also revoke access anytime from your{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 underline"
                  >
                    Google Account Security Settings
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Bottom CTA Card */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 p-8 text-center text-white shadow-lg sm:p-10">
              <h3 className="text-2xl font-bold">Ready to Search Your Google Sheets?</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-blue-100">
                Connect your account in seconds with read-only access and find any record instantly.
              </p>
              <div className="mt-6 flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo small />
            <div>
              <h1 className="text-xl font-bold text-slate-900">SheetSearch</h1>
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
