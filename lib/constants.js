// lib/constants.js
// Centralized configuration so routes/components never reach into process.env directly.

export const GOOGLE_SCOPES = [
  // Drive: see the user's Google Sheets files (metadata + file list)
  'https://www.googleapis.com/auth/drive.readonly',
  // Sheets: read cell values from sheets
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  // Basic profile (helps the UI greet the user)
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const APP_NAME = 'SheetSearch';

// Soft cap on rows returned by the Sheets API per request.
// 1000 is a sensible default; very large sheets are handled via pagination below.
export const SHEETS_PAGE_ROWS = 1000;

// Hard cap on matched rows we'll return per query to keep responses bounded.
export const MAX_MATCHES_PER_QUERY = 500;

// Drive query used to find Google Sheets the user has access to.
export const DRIVE_LIST_QUERY = [
  "mimeType='application/vnd.google-apps.spreadsheet'",
  "trashed=false",
].join(' and ');
