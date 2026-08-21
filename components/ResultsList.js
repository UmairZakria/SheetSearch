'use client';

// components/ResultsList.js
// Renders search results grouped by spreadsheet, with row preview + "Open in Sheets" link.

import { useState } from 'react';

export default function ResultsList({ results, keyword, caseSensitive }) {
  if (!results || results.length === 0) return null;

  const total = results.reduce((acc, r) => acc + r.matchCount, 0);
  const needle = caseSensitive ? keyword : keyword.toLowerCase();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        {total} {total === 1 ? 'match' : 'matches'} found
      </h2>
      {results.map((r) => (
        <SpreadsheetCard
          key={r.spreadsheetId}
          spreadsheet={r}
          keyword={needle}
          caseSensitive={caseSensitive}
        />
      ))}
    </section>
  );
}

function SpreadsheetCard({ spreadsheet, keyword, caseSensitive }) {
  const [expanded, setExpanded] = useState(spreadsheet.matchCount <= 5);
  const shown = expanded
    ? spreadsheet.matches
    : spreadsheet.matches.slice(0, 5);

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-800">
            {spreadsheet.spreadsheetName}
          </h3>
          <p className="text-xs text-slate-500">
            {spreadsheet.matchCount} matching row
            {spreadsheet.matchCount === 1 ? '' : 's'}
          </p>
        </div>
        <a
          href={spreadsheet.spreadsheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100 hover:bg-brand-50"
        >
          Open sheet ↗
        </a>
      </header>

      <ul className="divide-y divide-slate-100">
        {shown.map((m, i) => (
          <li key={`${m.sheetId}-${m.rowNumber}-${i}`} className="px-4 py-3">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {m.sheetTitle} · row {m.rowNumber} · col {m.matchColumnLetter}
              </p>
              <a
                href={m.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Open in Sheets ↗
              </a>
            </div>
            <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    {m.rowData.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-3 py-2 align-top ${
                          j === m.matchColumnIndex
                            ? 'bg-amber-50 font-medium text-amber-900'
                            : 'text-slate-700'
                        }`}
                      >
                        {highlight(cell, keyword, caseSensitive)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </li>
        ))}
      </ul>

      {spreadsheet.matches.length > 5 && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2.5 text-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            {expanded
              ? 'Show fewer matches'
              : `Show all ${spreadsheet.matches.length} matches`}
          </button>
        </div>
      )}
    </article>
  );
}

function highlight(cell, needle, caseSensitive) {
  if (cell == null || cell === '') return <span className="text-slate-300">—</span>;
  const text = String(cell);
  if (!needle) return text;

  const haystack = caseSensitive ? text : text.toLowerCase();
  const parts = [];
  let i = 0;
  while (i < text.length) {
    const idx = haystack.indexOf(needle, i);
    if (idx === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark key={`${idx}-${parts.length}`} className="match">
        {text.slice(idx, idx + needle.length)}
      </mark>
    );
    i = idx + needle.length;
  }
  return <>{parts}</>;
}
