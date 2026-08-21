// lib/search.js
// Pure search logic — no network calls. Easy to unit test and reuse.

import { SHEETS_PAGE_ROWS, MAX_MATCHES_PER_QUERY } from './constants.js';

/**
 * Search a single 2D grid of cell values for a keyword.
 * Returns an array of match objects: { rowNumber, columns, matchColumnIndex, snippet }
 *
 * @param {string[][]} rows  rows[rowIndex][colIndex] = cell value
 * @param {string} keyword    user-entered keyword (already trimmed)
 * @param {object} opts
 * @param {boolean} opts.caseSensitive
 */
export function searchRows(rows, keyword, { caseSensitive = false } = {}) {
  if (!keyword) return [];
  const needle = caseSensitive ? keyword : keyword.toLowerCase();
  const matches = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell == null) continue;
      const haystack = caseSensitive ? String(cell) : String(cell).toLowerCase();
      if (haystack.includes(needle)) {
        matches.push({
          rowNumber: i + 1, // Sheets rows are 1-indexed
          matchColumnIndex: j,
          matchColumnLetter: columnLetter(j),
          snippet: String(cell),
          rowData: row,
        });
        break; // one match per row is enough
      }
    }
  }

  return matches.slice(0, MAX_MATCHES_PER_QUERY);
}

export function columnLetter(index) {
  let s = '';
  let n = index;
  while (true) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
    if (n < 0) return s;
  }
}

// Build the API range string we pass to Sheets API for a tab.
// We always grab full columns A-Z by default; users may have wider sheets —
// for a search tool that's an acceptable ceiling.
export function defaultRangeForSheet(title) {
  const safe = title.replace(/'/g, "''");
  return `'${safe}'!A:Z`;
}

export const PAGE_ROWS = SHEETS_PAGE_ROWS;
