'use client';

// components/ResultsList.js
// Renders search results grouped by spreadsheet, with row preview + "Open in Sheets" link.

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function ResultsList({ results, keyword, caseSensitive }) {
  if (!results || results.length === 0) return null;

  const total = results.reduce((acc, r) => acc + r.matchCount, 0);
  const needle = caseSensitive ? keyword : keyword.toLowerCase();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
          <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
            {total} {total === 1 ? 'match' : 'matches'}
          </span>
          <span>Found in your Google Sheets</span>
        </h2>
      </div>
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
    <article className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm ring-1 ring-emerald-100">
      <header className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50/70 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">
            {spreadsheet.spreadsheetName}
          </h3>
          <p className="text-xs font-semibold text-emerald-800">
            {spreadsheet.matchCount} matching row{spreadsheet.matchCount === 1 ? '' : 's'}
          </p>
        </div>
        <a
          href={spreadsheet.spreadsheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm ring-1 ring-inset ring-emerald-300 hover:bg-emerald-100 transition"
        >
          <span>Open sheet</span>
          <ExternalLink className="h-3.5 w-3.5 text-emerald-700" />
        </a>
      </header>

      <ul className="divide-y divide-slate-100">
        {shown.map((m, i) => (
          <li key={`${m.sheetId}-${m.rowNumber}-${i}`} className="px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="font-bold text-slate-700">{m.sheetTitle}</span> · row {m.rowNumber} · col {m.matchColumnLetter}
              </p>
              <a
                href={m.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <span>Open in Sheets</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="overflow-x-auto rounded-lg border border-emerald-100 bg-white">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    {m.rowData.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-3 py-2 align-top ${
                          j === m.matchColumnIndex
                            ? 'bg-emerald-50 font-bold text-emerald-950 ring-1 ring-inset ring-emerald-200'
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
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
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
      <mark key={`${idx}-${parts.length}`} className="rounded bg-emerald-200 px-1 py-0.5 font-extrabold text-emerald-950 ring-1 ring-emerald-400">
        {text.slice(idx, idx + needle.length)}
      </mark>
    );
    i = idx + needle.length;
  }
  return <>{parts}</>;
}
