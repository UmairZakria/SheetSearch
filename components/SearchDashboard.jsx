"use client";

// components/SearchDashboard.jsx
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import SignOutButton from "@/components/SignOutButton.js";
import SheetPicker from "@/components/SheetPicker.js";
import ResultsList from "@/components/ResultsList.js";
import Footer from "@/components/Footer.js";
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
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

const DEBOUNCE_MS = 400;

export default function SearchDashboard({ user, onSignedOut }) {
  const [sheets, setSheets] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [sheetsError, setSheetsError] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchErrors, setSearchErrors] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Real-time second-by-second inspection states
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);
  const logsContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const loadSheets = useCallback(async () => {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      const res = await fetch("/api/sheets");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to load spreadsheets.");
      const list = data.sheets || [];
      setSheets(list);
      setSelectedIds((prev) => {
        return new Set(list.map((s) => s.id));
      });
    } catch (err) {
      setSheetsError(err.message);
      if (
        err.code === "google_auth_expired" ||
        err.code === "not_authenticated"
      ) {
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
  const executeSearch = useCallback(async (queryTerm, targetIds, matchCase) => {
    const trimmed = queryTerm.trim();
    if (!trimmed) {
      setResults(null);
      setHasSearched(false);
      setLogs([]);
      setProgress({ current: 0, total: 0 });
      return;
    }

    if (targetIds.size === 0) {
      setSearchError("Please select at least one spreadsheet below to search.");
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
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(
          errData?.message || `Search failed with status ${response.status}`,
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      const accumulatedResults = [];
      const accumulatedErrors = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep partial line

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            const event = JSON.parse(trimmedLine);
            const timestamp = formatTime(Date.now() - startTimeRef.current);

            if (event.type === "start") {
              setProgress({ current: 0, total: event.total });
              setLogs((prev) => [
                ...prev,
                {
                  id: Math.random(),
                  type: "info",
                  time: timestamp,
                  text: `Starting search across ${event.total} spreadsheets for "${event.keyword}"`,
                },
              ]);
            } else if (event.type === "checking") {
              setProgress((prev) => ({
                ...prev,
                current: event.index,
                total: event.total,
              }));
              setLogs((prev) => [
                ...prev,
                {
                  id: Math.random(),
                  type: "checking",
                  time: timestamp,
                  sheetName: event.spreadsheetName,
                  text: `[${event.index}/${event.total}] Checking spreadsheet "${event.spreadsheetName}"...`,
                },
              ]);
            } else if (event.type === "found") {
              setProgress((prev) => ({
                ...prev,
                current: event.index,
                total: event.total,
              }));
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
                  type: "found",
                  time: timestamp,
                  sheetName: event.spreadsheetName,
                  matchCount: event.matchCount,
                  text: `FOUND: ${event.matchCount} match${event.matchCount === 1 ? "" : "es"} in "${event.spreadsheetName}"`,
                },
              ]);
            } else if (event.type === "not_found") {
              setProgress((prev) => ({
                ...prev,
                current: event.index,
                total: event.total,
              }));
              setLogs((prev) => [
                ...prev,
                {
                  id: Math.random(),
                  type: "not_found",
                  time: timestamp,
                  sheetName: event.spreadsheetName,
                  text: `NOT FOUND: 0 matches in "${event.spreadsheetName}"`,
                },
              ]);
            } else if (event.type === "error") {
              accumulatedErrors.push({
                spreadsheetId: event.spreadsheetId,
                message: event.message,
              });
              setSearchErrors([...accumulatedErrors]);
              setLogs((prev) => [
                ...prev,
                {
                  id: Math.random(),
                  type: "error",
                  time: timestamp,
                  text: `ERROR: ${event.message}`,
                },
              ]);
            } else if (event.type === "done") {
              setLogs((prev) => [
                ...prev,
                {
                  id: Math.random(),
                  type: "done",
                  time: formatTime(
                    event.durationMs || Date.now() - startTimeRef.current,
                  ),
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
      if (err.name === "AbortError") return;
      setSearchError(err.message || "Search failed.");
      setHasSearched(true);
    } finally {
      setSearching(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  // -------- Debounced Search Trigger --------
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [keyword]);

  useEffect(() => {
    if (debouncedKeyword.trim()) {
      executeSearch(debouncedKeyword, selectedIds, caseSensitive);
    } else {
      setResults(null);
      setHasSearched(false);
      setSearchError(null);
      setSearchErrors([]);
      setLogs([]);
      setProgress({ current: 0, total: 0 });
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [debouncedKeyword, selectedIds, caseSensitive, executeSearch]);

  // Clean up interval and abort controller on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  function handleManualSearch(e) {
    e.preventDefault();
    executeSearch(keyword, selectedIds, caseSensitive);
  }

  function handleSelectAllSheets() {
    setSelectedIds(new Set(sheets.map((s) => s.id)));
  }

  function handleSignOut() {
    if (onSignedOut) onSignedOut();
  }

  const totalMatches = useMemo(() => {
    if (!results) return 0;
    return results.reduce((acc, r) => acc + (r.matchCount || 0), 0);
  }, [results]);

  const elapsedSecondsFormatted = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="flex min-h-screen relative flex-col font-poppins">
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#f9fafb]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.10),transparent_35%),radial-gradient(circle_at_80%_55%,rgba(14,165,233,0.1),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.1),transparent_40%)]" />
      </div>

      <main className="flex-1 relative z-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:mx-[3vw] xl:mx-[5vw] space-y-6">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-white">
                <div>
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="size-[3.5vw] min-w-8 min-h-8 brightness-110"
                  />
                </div>
                <span className="text-xl font-comfortaa font-bold text-black">
                  <span className="text-[#00ff88]">Sheet</span>
                  Search
                </span>
              </Link>
            </div>
            <SignOutButton onSignedOut={handleSignOut} />
          </header>

          {/* Equal 2-Column Responsive Layout for Desktops and Small Laptops */}
          <form
            onSubmit={handleManualSearch}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-[2vw] min-h-[580px] lg:h-[72vh] items-stretch"
          >
            {/* Left Column: Search Bar + Live Progress Log Feed */}
            <div className="flex flex-col col-span-2 gap-4 lg:gap-[1.5vw] h-full w-full min-h-0">
              {/* Search Bar */}
              <div className="relative w-full flex items-center justify-center gap-2 shrink-0">
                <div className="relative flex-1">
                  <input
                    id="keyword"
                    type="search"
                    autoFocus
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. invoice number, customer name, SKU, transaction ID…"
                    className="block w-full px-4 py-3 sm:px-[1.4vw] sm:py-[0.8vw] bg-white rounded-full focus:outline-none border-0 text-sm sm:text-base text-slate-900 shadow-lg placeholder:text-slate-400"
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
                  className="inline-flex items-center gap-2 bg-primary px-4 py-3 sm:px-[1.4vw] sm:py-[0.8vw] rounded-full text-sm sm:text-base font-medium text-white shadow-sm transition hover:opacity-80 cursor-pointer"
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

              {/* Real-time Inspection Log Feed */}
              <div className="rounded-2xl flex-1 bg-white p-4 sm:p-5 text-black shadow-xl flex flex-col min-h-0 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {searching ? (
                      <span className="flex items-center gap-2 text-black font-semibold">
                        Live Searching...
                      </span>
                    ) : hasSearched ? (
                      <span className="flex items-center gap-2 text-slate-700 font-semibold">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Search Completed
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        Live Search Log
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="size-3.5 text-primary" />
                      <span>
                        Time:{" "}
                        <strong className="text-black">
                          {elapsedSecondsFormatted}s
                        </strong>
                      </span>
                    </div>

                    {progress.total > 0 && (
                      <div className="text-slate-600">
                        Progress:{" "}
                        <strong className="text-black">
                          {progress.current} / {progress.total}
                        </strong>{" "}
                        sheets
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {progress.total > 0 && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 shrink-0">
                    <div
                      className="h-full bg-[#2C7EBA] transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%`,
                      }}
                    />
                  </div>
                )}

                {/* Log Feed Items */}
                <div
                  ref={logsContainerRef}
                  className="mt-3 flex-1 min-h-0 space-y-2 overflow-y-auto font-raleway text-xs pr-1 scrollbar-thin scrollbar-thumb-slate-200"
                >
                  {logs.length === 0 && !searching && (
                    <div className="h-full flex items-center justify-center text-center p-6">
                      <p className="text-slate-400 text-sm">
                        Type a keyword and click Search to start scanning your spreadsheets live.
                      </p>
                    </div>
                  )}

                  {logs.map((log) => {
                    if (log.type === "found") {
                      return (
                        <div
                          key={log.id}
                          className="flex items-center gap-2 rounded-lg bg-emerald-50  px-3 py-2 text-slate-900 font-poppins"
                        >
                          <span className="text-xs text-slate-500">
                            [{log.time}]
                          </span>
                          <span className=" text-sm font-medium text-black uppercase">
                            FOUND ({log.matchCount})
                          </span>
                          <span className="flex-1 font-medium text-emerald-950 truncate">
                            {log.text}
                          </span>
                        </div>
                      );
                    }

                    if (log.type === "not_found") {
                      return (
                        <div
                          key={log.id}
                          className="flex items-center gap-2 rounded-lg bg-rose-50  px-3 py-2 text-slate-900 font-poppins"
                        >
                          <span className="text-xs text-slate-500">
                            [{log.time}]
                          </span>
                          <span className="rounded  px-1.5 py-0.5 text-sm font-medium text-black ">
                            NOT FOUND
                          </span>
                          <span className="flex-1 text-slate-700 truncate">
                            {log.text}
                          </span>
                        </div>
                      );
                    }

                    if (log.type === "checking") {
                      return (
                        <div
                          key={log.id}
                          className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-slate-600 font-poppins"
                        >
                          <span className="text-xs text-slate-400">
                            [{log.time}]
                          </span>
                          <span className="flex-1 truncate">
                            {log.text}
                          </span>
                        </div>
                      );
                    }

                    if (log.type === "error") {
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-rose-800"
                        >
                          <span className="text-rose-500 font-mono">[{log.time}]</span>
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="flex-1">{log.text}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 px-3 py-1 text-slate-500 font-mono text-[11px]"
                      >
                        <span>[{log.time}]</span>
                        <span>{log.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Spreadsheets to Search Picker */}
            <section className="flex flex-col h-full w-full min-h-0">
              <div className="mb-2 flex items-center justify-between shrink-0">
                <h2 className="text-sm font-semibold text-slate-800">
                  Spreadsheets to Search
                </h2>
                <button
                  type="button"
                  onClick={loadSheets}
                  disabled={sheetsLoading}
                  className="text-xs font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50 cursor-pointer"
                >
                  {sheetsLoading ? "Refreshing…" : "Refresh list"}
                </button>
              </div>

              {sheetsError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                  {sheetsError}
                </p>
              )}

              {!sheetsError && (
                <div className="flex-1 min-h-0">
                  <SheetPicker
                    sheets={sheets}
                    selectedIds={selectedIds}
                    onChange={setSelectedIds}
                    disabled={sheetsLoading}
                  />
                </div>
              )}
            </section>
          </form>

          {/* No sheets selected alert */}
          {selectedIds.size === 0 && !sheetsLoading && sheets.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 text-xs text-amber-800 ring-1 ring-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Please select at least one spreadsheet above to start searching.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSelectAllSheets}
                className="font-bold text-amber-900 underline hover:no-underline cursor-pointer"
              >
                Select all
              </button>
            </div>
          )}

          {/* Results Section */}
          {searchError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <XCircle className="h-5 w-5 text-rose-600" />
                <span>Search Error</span>
              </div>
              <p className="mt-1">{searchError}</p>
            </div>
          )}

          {searchErrors.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
              <p className="font-bold">
                Some spreadsheets couldn&apos;t be read:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {searchErrors.map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            </div>
          )}

          {hasSearched && results && results.length > 0 && (
            <ResultsList
              results={results}
              keyword={debouncedKeyword || keyword}
              caseSensitive={caseSensitive}
            />
          )}

          {hasSearched && totalMatches === 0 && !searching && !searchError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <XCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-rose-900">
                NOT FOUND: No matches for &ldquo;{debouncedKeyword || keyword}&rdquo;
              </h3>
              <p className="mt-1 text-xs font-medium text-rose-700">
                Checked across {selectedIds.size} spreadsheet
                {selectedIds.size === 1 ? "" : "s"} in {elapsedSecondsFormatted}s.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
