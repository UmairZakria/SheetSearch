// lib/google.js
// Optimized wrapper around googleapis with batching, metadata caching, and exponential backoff for rate limits.

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
    prompt: 'consent',
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

export function authorizedClient(tokens) {
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials(tokens);
  oauth2.on('tokens', (newTokens) => {
    if (newTokens.access_token) tokens.access_token = newTokens.access_token;
    if (newTokens.expiry_date) tokens.expiry_date = newTokens.expiry_date;
    if (newTokens.refresh_token) tokens.refresh_token = newTokens.refresh_token;
    if (newTokens.scope) tokens.scope = newTokens.scope;
    if (newTokens.token_type) tokens.token_type = newTokens.token_type;
    if (newTokens.id_token) tokens.id_token = newTokens.id_token;
  });
  return oauth2;
}

// --- Exponential Backoff & Jitter for 429 Quota / 503 Rate Limits ---
export async function withExponentialBackoff(fn, { maxRetries = 3, initialDelayMs = 800 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const status = err?.status || err?.response?.status || err?.code;
      const isRateLimit = status === 429 || status === '429' || status === 503 || status === '503';
      const isNetwork = err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT';

      if ((isRateLimit || isNetwork) && attempt <= maxRetries) {
        const jitter = Math.random() * 300;
        const delay = initialDelayMs * Math.pow(2, attempt - 1) + jitter;
        console.warn(`[Google API Rate Limit Backoff] Status ${status}, retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

// --- In-Memory Metadata Cache (5-minute TTL) ---
const metaCache = new Map();
const META_CACHE_TTL_MS = 5 * 60 * 1000;

// Fetch basic metadata about a spreadsheet (with in-memory cache)
export async function getSpreadsheetMeta(tokens, spreadsheetId, { forceRefresh = false } = {}) {
  const cached = metaCache.get(spreadsheetId);
  const now = Date.now();
  if (!forceRefresh && cached && now - cached.timestamp < META_CACHE_TTL_MS) {
    return cached.data;
  }

  const data = await withExponentialBackoff(async () => {
    const auth = authorizedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'spreadsheetId,properties(title),sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))',
    });
    return res.data;
  });

  metaCache.set(spreadsheetId, { data, timestamp: now });
  return data;
}

// --- Drive: list user's Google Sheets ---
export async function listUserSheets(tokens, { pageToken } = {}) {
  return await withExponentialBackoff(async () => {
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
  });
}

// --- Single Tab Value Retrieval ---
export async function getSheetValues(tokens, spreadsheetId, range) {
  return await withExponentialBackoff(async () => {
    const auth = authorizedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: 'FORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });
    return res.data.values || [];
  });
}

// --- Optimized Batch Retrieval for all tabs in a spreadsheet (1 API call) ---
export async function batchGetSpreadsheetValues(tokens, spreadsheetId, ranges) {
  if (!ranges || ranges.length === 0) return [];

  return await withExponentialBackoff(async () => {
    const auth = authorizedClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
      valueRenderOption: 'FORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
    });
    return res.data.valueRanges || [];
  });
}

// Build a deep link directly to a specific row in Google Sheets
export function buildSheetRowLink({ spreadsheetId, sheetId, rowNumber }) {
  const gid = sheetId || 0;
  const range = `A${rowNumber}:Z${rowNumber}`;
  const params = new URLSearchParams({
    gid: String(gid),
    range,
  });
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId
  )}/edit?${params.toString()}`;
}
