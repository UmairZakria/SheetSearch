// lib/google.js
// Thin wrapper around googleapis for OAuth + Drive + Sheets.
// Centralizes: token storage, refresh-on-401, and a single client factory.

import { google } from 'googleapis';
import { DRIVE_LIST_QUERY } from './constants.js';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. See .env.example for setup.`
    );
  }
  return value;
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    requireEnv('GOOGLE_CLIENT_ID'),
    requireEnv('GOOGLE_CLIENT_SECRET'),
    requireEnv('GOOGLE_REDIRECT_URI')
  );
}

export function getAuthUrl() {
  const oauth2 = getOAuth2Client();
  const { GOOGLE_SCOPES } = require('./constants.js');
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // ensure we always get a refresh_token on first run
    include_granted_scopes: true,
    scope: GOOGLE_SCOPES,
  });
}

export async function exchangeCodeForTokens(code) {
  const oauth2 = getOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  return tokens;
}

export async function fetchUserProfile(accessToken) {
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({ access_token: accessToken });
  const oauth2api = google.oauth2({ version: 'v2', auth: oauth2 });
  const { data } = await oauth2api.userinfo.get();
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

// Attach the user's stored tokens to a fresh OAuth2 client.
// googleapis' OAuth2 will automatically refresh when access_token expires,
// as long as a refresh_token is present.
export function authorizedClient(tokens) {
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials(tokens);
  oauth2.on('tokens', (newTokens) => {
    // Persist refreshed tokens back to the session by mutating the object in place.
    // Callers pass the same object held in the session, so this propagates on save.
    if (newTokens.access_token) tokens.access_token = newTokens.access_token;
    if (newTokens.expiry_date) tokens.expiry_date = newTokens.expiry_date;
    if (newTokens.refresh_token) tokens.refresh_token = newTokens.refresh_token;
    if (newTokens.scope) tokens.scope = newTokens.scope;
    if (newTokens.token_type) tokens.token_type = newTokens.token_type;
    if (newTokens.id_token) tokens.id_token = newTokens.id_token;
  });
  return oauth2;
}

// --- Drive: list the user's Google Sheets ---
export async function listUserSheets(tokens, { pageToken } = {}) {
  const auth = authorizedClient(tokens);
  const drive = google.drive({ version: 'v3', auth });
  const res = await drive.files.list({
    q: DRIVE_LIST_QUERY,
    fields:
      'nextPageToken, files(id, name, modifiedTime, owners(displayName,emailAddress), webViewLink)',
    pageSize: 100,
    orderBy: 'modifiedTime desc',
    pageToken: pageToken || undefined,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return {
    files: res.data.files || [],
    nextPageToken: res.data.nextPageToken || null,
  };
}

// --- Sheets: fetch every row from a sheet, with valueRenderOption so dates/numbers are strings ---
export async function getSheetValues(tokens, spreadsheetId, range) {
  const auth = authorizedClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: 'unformatted_value',
    dateTimeRenderOption: 'serial_number',
  });
  return res.data.values || [];
}

// Fetch basic metadata about a spreadsheet (title, sheet/tab names).
export async function getSpreadsheetMeta(tokens, spreadsheetId) {
  const auth = authorizedClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'spreadsheetId,properties(title),sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))',
  });
  return res.data;
}

// Build a "deep link" to a specific row in Google Sheets.
// We use the gid of the tab and the row number, then point to a range like A{row}:Z{row}
// so the user lands exactly on that row.
export function buildSheetRowLink({ spreadsheetId, sheetId, rowNumber }) {
  const gid = sheetId || 0;
  // A1 notation; we assume columns A-Z is generous enough for any single row view.
  const range = `A${rowNumber}:Z${rowNumber}`;
  const params = new URLSearchParams({
    gid: String(gid),
    range,
  });
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId
  )}/edit?${params.toString()}`;
}
