# Sheet Search

A production-ready Next.js app that lets non-technical users search across the Google
Sheets they have access to — in real time, with no spreadsheet data ever leaving
Google's APIs or being stored by the app.

**Flow:** Connect Google → Select Sheets → Search Keyword → See Matches → Open Exact Row

---

## What you get

- Google OAuth 2.0 sign-in (read-only scopes only).
- Live listing of the user's Google Sheets via the Drive API.
- Real-time keyword search across selected spreadsheets via the Sheets API.
- Per-row match results: spreadsheet name, sheet/tab, exact row number, the
  matching column, the full row data, and a deep link that opens that row in
  Google Sheets.
- Encrypted, HTTP-only cookie sessions — OAuth tokens never touch the browser.
- Token auto-refresh handled server-side by `googleapis`.
- Graceful handling of expired sessions, missing permissions, rate limits, and
  very large sheets.
- Clean, responsive, minimal Tailwind UI.

---

## Architecture

```
sheet-search/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js        # Step 1: redirect to Google
│   │   │   ├── callback/route.js     # Step 2: exchange code → tokens
│   │   │   ├── status/route.js       # Frontend auth check
│   │   │   └── logout/route.js
│   │   ├── sheets/route.js           # GET: list user's spreadsheets
│   │   └── search/route.js           # POST: live search across sheets
│   ├── globals.css
│   ├── layout.js
│   └── page.js                       # Single-page client UI
├── components/
│   ├── ConnectButton.js
│   ├── SheetPicker.js
│   ├── ResultsList.js
│   └── SignOutButton.js
├── lib/
│   ├── constants.js                  # Scopes, limits
│   ├── errors.js                     # Normalized error handling
│   ├── google.js                     # googleapis OAuth + Drive + Sheets wrapper
│   ├── search.js                     # Pure row-matching logic
│   └── session.js                    # iron-session configuration
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

**Separation of concerns**

| Layer | Files | Responsibility |
| --- | --- | --- |
| Auth | `lib/session.js`, `lib/constants.js`, `app/api/auth/*` | OAuth flow, encrypted session, CSRF state |
| Google integration | `lib/google.js` | Drive list, Sheets read, token refresh, deep links |
| Search logic | `lib/search.js` | Pure, unit-testable row matching |
| API | `app/api/sheets`, `app/api/search` | Request validation, error mapping, response shaping |
| UI | `app/page.js`, `components/*` | Connect → Select → Search → Display |

---

## Setup

### 1. Create a Google Cloud project

1. Go to https://console.cloud.google.com/.
2. Create (or select) a project.
3. **Enable APIs**:
   - Google Drive API
   - Google Sheets API
4. **Configure the OAuth consent screen**:
   - User type: External (or Internal if you're on Workspace).
   - Add the scopes:
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/spreadsheets.readonly`
     - `openid`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Add yourself as a test user while it's in "Testing" mode.
5. **Create OAuth credentials**:
   - Type: Web application.
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback` (development)
     - `https://your-domain.com/api/auth/callback` (production)

### 2. Configure the app

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_PASSWORD=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

### 3. Install & run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

## Security model

- **Read-only scopes only.** The app requests `drive.readonly` and
  `spreadsheets.readonly`. There is no path in the codebase that asks for write
  scopes.
- **Tokens are server-side only.** Access + refresh tokens live exclusively in
  the encrypted `iron-session` cookie. The frontend never receives them, and no
  API response includes them.
- **Cookie flags.** `HttpOnly`, `SameSite=Lax`, `Secure` in production, scoped
  to `/`, 8-hour rolling expiry.
- **Session secret required in production.** The app refuses to start in
  production with the default insecure secret.
- **CSRF protection.** A random `state` token is stored in the encrypted
  session before the OAuth redirect and verified on callback; it's cleared on
  use so it can't be replayed.
- **Security headers.** `X-Frame-Options: DENY`, `X-Content-Type-Options:
  nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive
  `Permissions-Policy`.
- **No sheet data is persisted.** Every search hits the Google Sheets API live;
  the only thing stored in the cookie is the OAuth token.

---

## Deployment notes

- Set `SESSION_PASSWORD` to a 32+ char random string.
- Set `GOOGLE_REDIRECT_URI` to the production callback URL.
- Add the production callback URL to **Authorized redirect URIs** in Google
  Cloud Console.
- If you publish the OAuth consent screen, you must submit it for Google's
  verification (unless the app only signs in users from your own Workspace).
- Deploy to any platform that supports Next.js 14 (Vercel, Render, Fly, etc.).
- No database is required.

---

## How real-time search works

1. The frontend listens to the keyword input and debounces (350 ms).
2. On each settled change, `POST /api/search` sends
   `{ keyword, spreadsheetIds, options: { caseSensitive } }`.
3. The server loads the spreadsheet metadata (`spreadsheets.get`) and the full
   `A:Z` values for every tab (`spreadsheets.values.get`). No caching — every
   call hits Google so changes made seconds ago are reflected.
4. `lib/search.js` scans each row once, returns at most one match per row (the
   first column containing the keyword), capped at `MAX_MATCHES_PER_QUERY`
   (default 500) per query.
5. The frontend groups matches by spreadsheet and renders the full row, with
   the matching cell highlighted.
6. The "Open in Sheets" link uses `gid` + `range=A{row}:Z{row}` so the user
   lands exactly on the matching row.

If a single sheet fails (permission revoked, sheet deleted, etc.), the search
continues and the error is surfaced in a non-blocking banner — the user keeps
seeing results from the sheets that worked.

---

## Limits & trade-offs

- **Sheets per query: 25.** Soft cap to keep request latency predictable.
- **Matches per query: 500.** Protects the response size; the rest are
  truncated. For longer searches, narrow by selecting fewer sheets or a more
  specific keyword.
- **A–Z columns.** A search tool doesn't need columns past Z for typical use.
  Extend `defaultRangeForSheet` in `lib/search.js` if your data goes wider.
- **Sequential per-sheet fetches.** Simpler and gentler on the per-user API
  budget. Parallelize inside `app/api/search/route.js` if you need lower
  latency and have a higher quota.

---

## Scripts

```bash
npm run dev      # local dev server on :3000
npm run build    # production build
npm run start    # run the production build
npm run lint     # next lint
```


