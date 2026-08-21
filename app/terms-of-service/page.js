// app/terms-of-service/page.js
import Link from 'next/link';
import Footer from '@/components/Footer.js';

export const metadata = {
  title: 'Terms of Service - Sheet Search',
  description:
    'Terms of Service for Sheet Search (sheetsearch.umairlab.com). Read our terms and conditions for using our real-time Google Sheets search tool.',
  alternates: {
    canonical: 'https://sheetsearch.umairlab.com/terms-of-service',
  },
};

export default function TermsOfServicePage() {
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
            <span className="text-base font-bold">Sheet Search</span>
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
              Terms &amp; Conditions
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Last updated: {lastUpdated} · Effective date: {lastUpdated}
            </p>
          </header>

          <div className="prose prose-slate mt-8 max-w-none space-y-8 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-900">
                1. Acceptance of Terms
              </h2>
              <p className="mt-2">
                By accessing or using <strong>Sheet Search</strong> (available at{' '}
                <a
                  href="https://sheetsearch.umairlab.com"
                  className="font-medium text-brand-600 underline hover:text-brand-700"
                >
                  https://sheetsearch.umairlab.com
                </a>
                ), you agree to be bound by these Terms of Service and our{' '}
                <Link
                  href="/privacy-policy"
                  className="font-medium text-brand-600 underline hover:text-brand-700"
                >
                  Privacy Policy
                </Link>
                . If you do not agree to these terms, please do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                2. Description of Service
              </h2>
              <p className="mt-2">
                Sheet Search provides a web-based productivity utility that enables users to connect their Google Account and perform keyword searches across their Google Sheets spreadsheets in real time. The service utilizes Google Drive and Google Sheets APIs with read-only permissions to query metadata and cell values on demand without permanently persisting user spreadsheet content.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                3. Google Account and Authorization
              </h2>
              <p className="mt-2">
                To use Sheet Search, you must sign in and authorize access via Google OAuth. You represent and warrant that:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>You have the legal authority to grant access to the Google Account and spreadsheets you search.</li>
                <li>You will not use the service in violation of any applicable laws, organizational policies, or Google&apos;s Terms of Service.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials and browser sessions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                4. Acceptable Use Policy
              </h2>
              <p className="mt-2">
                You agree not to misuse Sheet Search. Prohibited activities include, but are not limited to:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>Attempting to probe, scan, or test the vulnerability of the service or breach any security measures.</li>
                <li>Using automated scripts, bots, or scrapers to overload or abuse the service infrastructure or Google API quotas.</li>
                <li>Reverse engineering, decompiling, or attempting to extract the proprietary source code of the application.</li>
                <li>Using the service for any unlawful, infringing, fraudulent, or harmful purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                5. Intellectual Property and Content Ownership
              </h2>
              <p className="mt-2">
                <strong>Your Content:</strong> You retain full ownership, title, and intellectual property rights in all data, spreadsheets, and documents you access or search through Sheet Search. Sheet Search claims no ownership or license over your spreadsheet contents.
              </p>
              <p className="mt-2">
                <strong>Our Service:</strong> The Sheet Search software, user interface design, logos, trademarks, and documentation are the exclusive property of Sheet Search and its licensors.
              </p>
              <p className="mt-2">
                <strong>Third-Party Trademarks:</strong> Google Sheets, Google Drive, Google, and the Google logo are registered trademarks of Google LLC. Sheet Search is an independent application and is not affiliated with, endorsed by, or sponsored by Google LLC.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                6. Disclaimer of Warranties
              </h2>
              <p className="mt-2">
                SHEET SEARCH IS PROVIDED ON AN <strong>&quot;AS IS&quot;</strong> AND <strong>&quot;AS AVAILABLE&quot;</strong> BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, TIMELINESS, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY.
              </p>
              <p className="mt-2">
                Search results depend on Google API availability, network conditions, spreadsheet formatting, and Google rate limits. We do not warrant that all sheet formats, calculated formula values, or protected ranges will be indexed or rendered identically.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                7. Limitation of Liability
              </h2>
              <p className="mt-2">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SHEET SEARCH, ITS OPERATORS, AFFILIATES, OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES (INCLUDING LOSS OF DATA, LOSS OF PROFITS, BUSINESS INTERRUPTION, OR INACCURACY OF SEARCH RESULTS) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                8. Termination and Access Revocation
              </h2>
              <p className="mt-2">
                We reserve the right to suspend or terminate access to the service for any user who violates these Terms or engages in abusive behavior. You may terminate your relationship with Sheet Search at any time by signing out and revoking application access via your Google Account security settings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                9. Changes to Terms
              </h2>
              <p className="mt-2">
                We may revise these Terms of Service periodically. Continued use of the service after revised terms become effective constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900">
                10. Contact Information
              </h2>
              <p className="mt-2">
                For questions concerning these Terms of Service, please contact:
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">
                <p><strong>Sheet Search</strong></p>
                <p>Website:{' '}
                  <a
                    href="https://sheetsearch.umairlab.com"
                    className="text-brand-600 underline"
                  >
                    https://sheetsearch.umairlab.com
                  </a>
                </p>
                <p>Email: legal@umairlab.com (or contact via{' '}
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
