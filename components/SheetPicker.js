'use client';

// components/SheetPicker.js
// Multi-select list of spreadsheets with search filter, select all, and responsive flex height.

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
      <div className="rounded-xl h-full font-poppins bg-white p-6 shadow-xl flex items-center justify-center text-center">
        <p className="text-sm text-slate-500">
          No spreadsheets found in your Google Drive.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl h-full font-poppins bg-white p-4 sm:p-5 shadow-xl flex flex-col min-h-0">
      <div className="mb-3 flex items-center justify-between gap-3 shrink-0">
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
          className="shrink-0 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-100 transition hover:bg-brand-50 disabled:opacity-60 cursor-pointer"
        >
          {allFilteredSelected ? 'Unselect All' : 'Select All'}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-lg  pr-1 scrollbar-thin scrollbar-thumb-slate-200">
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
                    className="h-4 w-4 sm:size-[1.1vw] min-w-4 min-h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p title={s.name} className="truncate text-sm font-medium text-slate-800">
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
            <li className="px-3 py-6 text-center text-sm text-slate-400">
              No matches found.
            </li>
          )}
        </ul>
      </div>

      <p className="mt-3 text-xs text-slate-500 shrink-0">
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
