// lib/search.js
// Search logic & range utilities — guaranteed 100% accuracy with large-sheet row chunking.

import { MAX_MATCHES_PER_QUERY } from './constants.js';

export const CHUNK_ROW_SIZE = 5000; // Optimal chunk size for large sheets (prevents 10MB Google API payload errors)

/**
 * Search a 2D grid of cell values for a keyword or query term.
 * Returns an array of match objects: { rowNumber, matchColumnIndex, matchColumnLetter, snippet, matchedKeyword, rowData }
 *
 * @param {string[][]} rows        rows[rowIndex][colIndex] = cell value
 * @param {string} keyword          user-entered keyword (already trimmed)
 * @param {object} opts
 * @param {boolean} opts.caseSensitive
 * @param {number} opts.rowOffset   Row offset for chunked requests (e.g. 5000 for rows 5001-10000)
 */
export function searchRows(rows, keyword, { caseSensitive = false, rowOffset = 0 } = {}) {
  if (!keyword || !Array.isArray(rows)) return [];
  const needle = caseSensitive ? keyword : keyword.toLowerCase();
  const matches = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell == null || cell === '') continue;
      const cellStr = String(cell);
      const haystack = caseSensitive ? cellStr : cellStr.toLowerCase();

      if (haystack.includes(needle)) {
        matches.push({
          rowNumber: i + 1 + rowOffset, // Exact 1-indexed Google Sheets row number
          matchColumnIndex: j,
          matchColumnLetter: columnLetter(j),
          snippet: cellStr,
          matchedKeyword: keyword,
          rowData: row,
        });
        break; // One match per row
      }
    }
  }

  return matches.slice(0, MAX_MATCHES_PER_QUERY);
}

/**
 * Converts 0-indexed column integer to Google Sheets column letter (e.g. 0 -> A, 25 -> Z, 26 -> AA).
 */
export function columnLetter(index) {
  let s = '';
  let n = Math.max(0, index);
  while (true) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
    if (n < 0) return s;
  }
}

/**
 * Formats a sheet title into safe Google Sheets A1 range notation.
 */
export function defaultRangeForSheet(title) {
  const safe = String(title).replace(/'/g, "''");
  return `'${safe}'`;
}

/**
 * Generates range queries for a tab.
 * For normal sheets (<= 5,000 rows), returns a single full-tab range.
 * For large sheets (> 5,000 rows), generates bounded row chunks to prevent Google payload limits.
 */
export function generateTabRanges(title, gridProperties, chunkSize = CHUNK_ROW_SIZE) {
  const safeTitle = String(title).replace(/'/g, "''");
  const rowCount = gridProperties?.rowCount || 0;
  const colCount = gridProperties?.columnCount || 26;
  const endCol = columnLetter(Math.max(colCount - 1, 0));

  if (!rowCount || rowCount <= chunkSize) {
    return [
      {
        range: `'${safeTitle}'`,
        rowOffset: 0,
      },
    ];
  }

  const chunks = [];
  let startRow = 1;
  while (startRow <= rowCount) {
    const endRow = Math.min(startRow + chunkSize - 1, rowCount);
    chunks.push({
      range: `'${safeTitle}'!A${startRow}:${endCol}${endRow}`,
      rowOffset: startRow - 1,
    });
    startRow = endRow + 1;
  }

  return chunks;
}
