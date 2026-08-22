'use client';

// components/SearchDashboard.js
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import SignOutButton from '@/components/SignOutButton.js';
import SheetPicker from '@/components/SheetPicker.js';
import ResultsList from '@/components/ResultsList.js';
import Footer from '@/components/Footer.js';
import {
  Loader2,
  FileSpreadsheet,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Activity,
} from 'lucide-react';

const DEBOUNCE_MS = 400;

export default function SearchDashboard({ initialUser, onSignedOut }) {
  const [user, setUser] = useState(initialUser || null);
  const [sheets, setSheets] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [sheetsError, setSheetsError] = useState(null);

  const [keyword, setKeyword] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchErrors, setSearchErrors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Live Inspection Logs & Timer
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [elapsedMs, setElapsedMs] = useState(0);

  const abortControllerRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const logsContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // -------- Sheets list --------
  const loadSheets = useCallback(async () => {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      const res = await fetch('/api/sheets');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load spreadsheets.');
      const list = data.sheets || [];
      setSheets(list);
      setSelectedIds((prev) => {
        if (prev.size > 0) return prev;
        return new Set(list.slice(0, 25).map((s) => s.id));
      });
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

  // -------- Stream Search --------
  const executeSearch = useCallback(
    async (queryTerm, targetIds, matchCase) => {
      const trimmed = queryTerm.trim();
      if (!trimmed) {
        setResults(null);
        setHasSearched(false);
        setLogs([]);
        setProgress({ current: 0, total: 0 });
        return;
      }

      if (targetIds.size === 0) {
        setSearchError('Please select at least one spreadsheet below to search.');
        return;
      }

      // Abort previous in-flight search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Reset logs, timer and results
      setSearching(true);
      setSearchError(null);
      setSearchErrors([]);
      setResults([]);
      setHasSearched(false);
      setLogs([]);
      setProgress({ current: 0, total: targetIds.size });

      startTimeRef.current = Date.now();
      setElapsedMs(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 100);

      const formatTime = (ms) => {
        const totalSeconds = (ms / 1000).toFixed(1);
        return `${totalSeconds}s`;
      };

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: trimmed,
            spreadsheetIds: Array.from(targetIds),
            options: { caseSensitive: matchCase },
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.message || `Search failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        const accumulatedResults = [];
        const accumulatedErrors = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep partial line

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            try {
              const event = JSON.parse(trimmedLine);
              const timestamp = formatTime(Date.now() - startTimeRef.current);

              if (event.type === 'start') {
                setProgress({ current: 0, total: event.total });
                setLogs((prev) => [
                  ...prev,
                  {
                    id: Math.random(),
                    type: 'info',
                    time: timestamp,
                    text: `Starting search across ${event.total} spreadsheets for "${event.keyword}"`,
                  },
                ]);
              } else if (event.type === 'checking') {
                setProgress((prev) => ({ ...prev, current: event.index, total: event.total }));
                setLogs((prev) => [
                  ...prev,
                  {
                    id: Math.random(),
                    type: 'checking',
                    time: timestamp,
                    sheetName: event.spreadsheetName,
                    text: `[${event.index}/${event.total}] Checking spreadsheet "${event.spreadsheetName}"...`,
                  },
                ]);
              } else if (event.type === 'found') {
                setProgress((prev) => ({ ...prev, current: event.index, total: event.total }));
                accumulatedResults.push({
                  spreadsheetId: event.spreadsheetId,
                  spreadsheetName: event.spreadsheetName,
                  spreadsheetUrl: event.spreadsheetUrl,
                  matchCount: event.matchCount,
                  matches: event.matches,
                });
                setResults([...accumulatedResults]);

                setLogs((prev) => [
                  ...prev,
                  {
                    id: Math.random(),
                    type: 'found',
                    time: timestamp,
                    sheetName: event.spreadsheetName,
                    matchCount: event.matchCount,
                    text: `FOUND: ${event.matchCount} match${event.matchCount === 1 ? '' : 'es'} in "${event.spreadsheetName}"`,
                  },
                ]);
              } else if (event.type === 'not_found') {
                setProgress((prev) => ({ ...prev, current: event.index, total: event.total }));
                setLogs((prev) => [
                  ...prev,
                  {
                    id: Math.random(),
                    type: 'not_found',
                    time: timestamp,
                    sheetName: event.spreadsheetName,
                    text: `NOT FOUND: 0 matches in "${event.spreadsheetName}"`,
                  },
                ]);
              } else if (event.type === 'error') {
                accumulatedErrors.push({
                  spreadsheetId: event.spreadsheetId,
                  message: event.message,
                });
                setSearchErrors([...accumulatedErrors]);
                setLogs((prev) => [
                  ...prev,
                  {
                    id: Math.random(),
                    type: 'error',
                    time: timestamp,
                    text: `ERROR: ${event.message}`,
                  },
                ]);
              } else if (event.type === 'done') {
                setLogs((prev) => [
                  ...prev,
                  {
                    id: Math.random(),
                    type: 'done',
                    time: formatTime(event.durationMs || Date.now() - startTimeRef.current),
                    text: `Search complete! Total matches: ${event.totalMatches}`,
                  },
                ]);
              }
            } catch {
              // Ignore partial JSON parse errors
            }
          }
        }

        setHasSearched(true);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setSearchError(err.message || 'Search failed.');
        setHasSearched(true);
      } finally {
        setSearching(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      }
    },
    []
  );

  // -------- Debounced Search Trigger --------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      if (keyword.trim().length > 0 && selectedIds.size > 0) {
        executeSearch(keyword, selectedIds, caseSensitive);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [keyword, selectedIds, caseSensitive, executeSearch]);

  function handleManualSearch(e) {
    e.preventDefault();
    if (keyword.trim()) {
      executeSearch(keyword, selectedIds, caseSensitive);
    }
  }

  function handleSelectAllSheets() {
    setSelectedIds(new Set(sheets.slice(0, 25).map((s) => s.id)));
  }

  function handleSignOut() {
    if (onSignedOut) {
      onSignedOut();
    } else {
      window.location.reload();
    }
  }

  const elapsedSecondsFormatted = (elapsedMs / 1000).toFixed(1);

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

          {/* Search input form */}
          <form
            onSubmit={handleManualSearch}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <label
              htmlFor="keyword"
              className="block text-sm font-medium text-slate-700"
            >
              Search keyword
            </label>
            <div className="relative mt-2 flex gap-2">
              <div className="relative flex-1">
                <input
                  id="keyword"
                  type="search"
                  autoFocus
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. invoice number, customer name, SKU, transaction ID…"
                  className="block w-full rounded-xl border-0 px-4 py-3.5 pr-10 text-base text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500"
                />
                {searching && (
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={searching || !keyword.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
              >
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching…</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Match case
              </label>

              <div className="flex items-center gap-2 text-slate-500">
                <span>
                  {selectedIds.size} of {sheets.length} spreadsheet{sheets.length === 1 ? '' : 's'} selected
                </span>
                {selectedIds.size === 0 && sheets.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllSheets}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    (Select all)
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Real-time Second-by-Second Inspection Log */}
          {(searching || logs.length > 0) && (
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  {searching ? (
                    <span className="flex items-center gap-2 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Checking Spreadsheets...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Inspection Complete
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-brand-400" />
                    <span>Time: <strong className="text-white">{elapsedSecondsFormatted}s</strong></span>
                  </div>

                  {progress.total > 0 && (
                    <div className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">
                      Progress: <strong className="text-white">{progress.current} / {progress.total}</strong> sheets
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {progress.total > 0 && (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%`,
                    }}
                  />
                </div>
              )}

              {/* Log Feed */}
              <div
                ref={logsContainerRef}
                className="mt-3 max-h-48 space-y-1.5 overflow-y-auto font-mono text-xs pr-1 scrollbar-thin scrollbar-thumb-slate-700"
              >
                {logs.map((log) => {
                  if (log.type === 'found') {
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/80 px-3 py-1.5 text-emerald-200"
                      >
                        <span className="text-emerald-400 font-bold">[{log.time}]</span>
                        <span className="rounded bg-emerald-500 px-1.5 py-0.2 text-[10px] font-black text-slate-950 uppercase">
                          FOUND ({log.matchCount})
                        </span>
                        <span className="flex-1 font-semibold text-emerald-100">{log.text}</span>
                      </div>
                    );
                  }

                  if (log.type === 'not_found') {
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-950/70 px-3 py-1.5 text-rose-200"
                      >
                        <span className="text-rose-400 font-bold">[{log.time}]</span>
                        <span className="rounded bg-rose-500 px-1.5 py-0.2 text-[10px] font-black text-white uppercase">
                          NOT FOUND
                        </span>
                        <span className="flex-1 text-rose-200">{log.text}</span>
                      </div>
                    );
                  }

                  if (log.type === 'checking') {
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 rounded-lg bg-slate-800/80 px-3 py-1 text-slate-300"
                      >
                        <span className="text-slate-400">[{log.time}]</span>
                        <Loader2 className="h-3 w-3 animate-spin text-brand-400 mt-0.5" />
                        <span className="flex-1 text-slate-300">{log.text}</span>
                      </div>
                    );
                  }

                  if (log.type === 'error') {
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 rounded-lg bg-rose-900/60 px-3 py-1 text-rose-300 border border-rose-500/30"
                      >
                        <span className="text-rose-400">[{log.time}]</span>
                        <XCircle className="h-3.5 w-3.5 text-rose-400 mt-0.5" />
                        <span className="flex-1">{log.text}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-2 px-3 py-0.5 text-slate-400"
                    >
                      <span>[{log.time}]</span>
                      <span>{log.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No sheets selected alert */}
          {selectedIds.size === 0 && !sheetsLoading && sheets.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 text-xs text-amber-800 ring-1 ring-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Please select at least one spreadsheet below to start searching.</span>
              </div>
              <button
                type="button"
                onClick={handleSelectAllSheets}
                className="rounded-lg bg-amber-200/80 px-3 py-1 font-semibold text-amber-900 transition hover:bg-amber-300"
              >
                Select All Spreadsheets
              </button>
            </div>
          )}

          {/* Spreadsheets Picker Section */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-700">Spreadsheets to Search</h2>
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

          {/* Results Section */}
          {searchError && (
            <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-800 shadow-sm">
              {searchError}
            </div>
          )}

          {searchErrors.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
              <p className="font-bold">Some spreadsheets couldn&apos;t be read:</p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {searchErrors.map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Found Matches List */}
          {results && results.length > 0 && (
            <ResultsList
              results={results}
              keyword={debouncedKeyword || keyword}
              caseSensitive={caseSensitive}
            />
          )}

          {/* Bold Not Found Banner */}
          {hasSearched && results && results.length === 0 && !searchError && (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-8 text-center shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-rose-900">
                NOT FOUND: No matches for &ldquo;{debouncedKeyword || keyword}&rdquo;
              </h3>
              <p className="mt-1 text-xs font-medium text-rose-700">
                Checked across {selectedIds.size} spreadsheet{selectedIds.size === 1 ? '' : 's'} in {elapsedSecondsFormatted}s.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
