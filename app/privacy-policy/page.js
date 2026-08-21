// app/privacy-policy/page.js
import Link from 'next/link';
import Footer from '@/components/Footer.js';

export const metadata = {
  title: 'Privacy Policy - SheetSearch',
  description:
    'Privacy Policy for SheetSearch (sheetsearch.umairlab.com). Learn how we handle your data, Google OAuth scopes, and our strict zero-storage policy.',
  alternates: {
    canonical: 'https://sheetsearch.umairlab.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 24, 2024';

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header / Nav */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-3 text-slate-900 transition-colors hover:text-brand-600"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 4h16v16H4z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  opacity="0.4"
                />
                <path d="M4 8h16" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" />
                <path d="M4 16h16" stroke="currentColor" strokeWidth="1.6" />
                <rect x="6" y="6" width="3" height="2" fill="currentColor" />
                <rect x="6" y="10" width="3" height="2" fill="currentColor" />
                <rect x="6" y="14" width="3" height="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-base font-bold">SheetSearch</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-brand-600"
          >
            <span>←</span> Back to App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-10">
          <header className="border-b border-slate-100 pb-6">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
              Legal & Transparency
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Last updated: {lastUpdated} · Effective date: {lastUpdated}
            </p>
          </header>

          {/* Quick Summary Callout */}
          <div className="mt-8 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              Summary for Quick Reference
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
              <li>
                • <strong>Zero Persistent Data Storage:</strong> We never store, save, or cache your spreadsheet rows, cell values, or contents in any database.
              </li>
              <li>
                • <strong>Read-Only API Access:</strong> We only request read-only permissions to query Google Drive file lists and read Google Sheets data on your explicit command.
              </li>
              <li>
                • <strong>Secure Sessions:</strong> OAuth credentials are stored exclusively in encrypted, HTTP-only session cookies in your browser.
              </li>
              <li>
                • <strong>No Data Selling or AI Training:</strong> Your data is never sold, shared with third parties, or used to train artificial intelligence or machine learning models.
              </li>
            </ul>
          </div>

          <div className="prose prose-slate mt-8 max-w-none space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900">1. Introduction</h2>
              <p className="mt-2">
                Welcome to <strong>SheetSearch</strong> (accessible at{' '}
                <a
                  href="https://sheetsearch.umairlab.com"
                  className="font-medium text-brand-600 underline hover:text-brand-700"
                >
                  https://sheetsearch.umairlab.com
                </a>
                ). We value your trust and are committed to protecting your personal information and spreadsheet data.
              </p>
              <p className="mt-2">
                This Privacy Policy explains how SheetSearch accesses, uses, processes, and protects your information when you connect your Google Account and use our real-time search application.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                2. Information We Access and Process
              </h2>
              <p className="mt-2">
                When you use SheetSearch, we interact with Google APIs solely to provide the search functionality. We access the following categories of data:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Google Account Identity:</strong> Your email address and basic profile info (via OpenID Connect, <code>openid</code>, <code>userinfo.email</code>, <code>userinfo.profile</code>) to identify your session and display your signed-in email address in the user interface.
                </li>
                <li>
                  <strong>Google Drive Metadata:</strong> Spreadsheet file metadata (such as file ID, file name, and modified timestamp) via the Google Drive API (<code>https://www.googleapis.com/auth/drive.readonly</code>) to display the list of spreadsheets available for you to choose from.
                </li>
                <li>
                  <strong>Google Sheets Data:</strong> Sheet tab names and cell values within selected spreadsheets via the Google Sheets API (<code>https://www.googleapis.com/auth/spreadsheets.readonly</code>) solely during an active search query to locate matching keywords.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                3. How We Use Your Information
              </h2>
              <p className="mt-2">
                We use the data accessed from Google APIs strictly to operate and deliver the SheetSearch service:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>To authenticate your session securely using OAuth 2.0.</li>
                <li>To populate the spreadsheet selector list with files you have permission to view.</li>
                <li>To execute keyword searches across your selected sheets in real time and return matching row numbers and cell contents to your browser.</li>
                <li>To construct direct deep links enabling you to navigate directly to matching rows in Google Sheets.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                4. Google API Services User Data Policy Compliance (Limited Use)
              </h2>
              <div className="mt-2 rounded-lg border-l-4 border-brand-500 bg-brand-50/60 p-4 text-slate-800">
                <p className="font-semibold text-slate-900">
                  Google API Services User Data Policy Disclosure
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  SheetSearch&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-700 underline hover:text-brand-800"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the <strong>Limited Use</strong> requirements.
                </p>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>
                  We do not use Google user data to serve advertisements, including retargeting, personalized, or interest-based advertising.
                </li>
                <li>
                  We do not allow humans to read your spreadsheet data unless you have given us explicit permission for troubleshooting or support purposes, or as required by law.
                </li>
                <li>
                  We do not transfer or disclose Google user data to third parties, except as strictly necessary to provide or improve user-facing features.
                </li>
                <li>
                  We do not use Google user data to train, evaluate, or fine-tune generalized artificial intelligence (AI) or machine learning (ML) models.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                5. Data Storage, Retention, and Security
              </h2>
              <p className="mt-2">
                <strong>No Database Storage:</strong> SheetSearch operates without a persistent database. We do not store your spreadsheet data, search queries, or search results on our servers or hard drives.
              </p>
              <p className="mt-2">
                <strong>In-Memory Processing:</strong> When you execute a search, spreadsheet rows are retrieved ephemerally into server memory, filtered against your query keyword, and streamed back to your client. Memory is released immediately after request completion.
              </p>
              <p className="mt-2">
                <strong>Session Encryption:</strong> OAuth access and refresh tokens are stored exclusively inside encrypted, signed HTTP-only session cookies (powered by <code>iron-session</code>) on your own browser. Server secrets are required to decrypt tokens.
              </p>
              <p className="mt-2">
                <strong>Data in Transit:</strong> All communications between your browser, our servers, and Google APIs are encrypted using industry-standard Transport Layer Security (TLS/HTTPS).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                6. Third-Party Sharing and Disclosures
              </h2>
              <p className="mt-2">
                We do not sell, rent, trade, or monetize your personal data or spreadsheet contents. We will only disclose information if required by applicable law, regulation, or valid legal process.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                7. Your Rights and Revoking Access
              </h2>
              <p className="mt-2">
                You maintain complete control over your Google Account and data access at all times:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <strong>Sign Out:</strong> Clicking the &quot;Sign Out&quot; button immediately destroys your encrypted session cookie and disconnects your active session.
                </li>
                <li>
                  <strong>Revoke Google Account Permissions:</strong> You can revoke SheetSearch&apos;s access to your Google Account at any time via your{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 underline hover:text-brand-700"
                  >
                    Google Account Third-party apps &amp; services settings
                  </a>
                  . Once revoked, SheetSearch can no longer access your Drive or Sheets files.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                8. Cookies and Technical Tracking
              </h2>
              <p className="mt-2">
                SheetSearch uses strictly necessary, encrypted HTTP cookies for session management and CSRF protection. We do not use tracking cookies, analytics trackers, or third-party marketing cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                9. Changes to This Privacy Policy
              </h2>
              <p className="mt-2">
                We may periodically update this Privacy Policy to reflect improvements to the service or regulatory changes. Any updates will be posted on this page with an updated &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                10. Contact Information
              </h2>
              <p className="mt-2">
                If you have questions, concerns, or requests regarding this Privacy Policy or our security practices, please contact us at:
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">
                <p><strong>SheetSearch</strong></p>
                <p>Website:{' '}
                  <a
                    href="https://sheetsearch.umairlab.com"
                    className="text-brand-600 underline"
                  >
                    https://sheetsearch.umairlab.com
                  </a>
                </p>
                <p>Email: privacy@umairlab.com (or contact via{' '}
                  <a
                    href="https://umairlab.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 underline"
                  >
                    umairlab.com
                  </a>
                  )
                </p>
              </div>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
