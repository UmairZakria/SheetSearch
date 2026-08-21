'use client';

// components/SheetPicker.js
// Multi-select list of spreadsheets, with search-to-filter and "select all".

import { useMemo, useState } from 'react';

export default function SheetPicker({ sheets, selectedIds, onChange, disabled }) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter.trim()) return sheets;
    const f = filter.toLowerCase();
    return sheets.filter((s) => s.name.toLowerCase().includes(f));
  }, [sheets, filter]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));

  function toggle(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function toggleAllFiltered() {
    const next = new Set(selectedIds);
    if (allFilteredSelected) {
      filtered.forEach((s) => next.delete(s.id));
    } else {
      filtered.forEach((s) => next.add(s.id));
    }
    onChange(next);
  }

  if (sheets.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
        No spreadsheets found in your Google Drive.
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter spreadsheets…"
          disabled={disabled}
          className="block w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={toggleAllFiltered}
          disabled={disabled}
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-100 transition hover:bg-brand-50 disabled:opacity-60"
        >
          {allFilteredSelected ? 'Clear visible' : 'Select visible'}
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg ring-1 ring-slate-100">
        <ul className="divide-y divide-slate-100">
          {filtered.map((s) => {
            const checked = selectedIds.has(s.id);
            return (
              <li key={s.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition hover:bg-slate-50 ${
                    checked ? 'bg-brand-50/50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(s.id)}
                    disabled={disabled}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {s.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {s.owner?.name || 'Unknown owner'}
                      {s.modifiedTime
                        ? ` · modified ${formatRelative(s.modifiedTime)}`
                        : ''}
                    </p>
                  </div>
                </label>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-slate-400">
              No matches.
            </li>
          )}
        </ul>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {selectedIds.size} of {sheets.length} selected
      </p>
    </div>
  );
}

function formatRelative(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
