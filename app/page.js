// app/page.js
// Server Component (SSR) for full SEO, crawler rendering, and immediate HTML delivery.

import { getSession } from '@/lib/session.js';
import SearchDashboard from '@/components/SearchDashboard.js';
import ConnectButton from '@/components/ConnectButton.js';
import Footer from '@/components/Footer.js';
import {
  Search,
  FileSpreadsheet,
  Table,
  ExternalLink,
  ShieldCheck,
  Lock,
  DatabaseZap,
  Zap,
  CheckCircle2,
  PlayIcon,
  ChevronRight,
  Info,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const session = await getSession();
  const isAuthed = Boolean(session?.tokens?.access_token);
  const authError = searchParams?.auth_error;

  if (isAuthed) {
    return <SearchDashboard initialUser={session.user} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-black flex items-center justify-center rounded-full">
              <PlayIcon className="text-white rounded-full fill-white size-4 rotate-35" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              SheetSearch
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#purpose" className="transition hover:text-brand-600">
              Purpose &amp; Features
            </a>
            <a href="#how-it-works" className="transition hover:text-brand-600">
              How It Works
            </a>
            <a href="#permissions" className="transition hover:text-brand-600">
              Google Scopes
            </a>
            <a href="#security" className="transition hover:text-brand-600">
              Security &amp; Privacy
            </a>
            <a href="#faq" className="transition hover:text-brand-600">
              FAQ
            </a>
          </nav>

          <div>
            <a
              href="/api/auth/login"
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm duration-300 ease-in-out group font-medium text-white transition hover:bg-brand-700"
            >
              Connect Google
              <ChevronRight className="text-sm group-hover:translate-x-1 transition-all duration-200 ease-in-out h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-6 ">
        <div className="mx-auto  text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
            Google Sheets Multi-Search Productivity Tool
          </div>

          <h1 className="mt-5 text-4xl font- tracking- text-slate-900 sm:text-5xl lg:text-7xl">
           Search Across All Your <br />
<span className='text-brand-600'>Google Sheets</span> Instantly
          </h1>

          <p className="mt-3 text-xl font- text-brand-300 sm:text-2xl">
            Fast, Real-Time Search Across Multiple Google Sheets
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            <strong>SheetSearch</strong> is a dedicated web productivity application designed to search across multiple Google Spreadsheets simultaneously. Quickly locate any keyword, transaction, invoice number, customer record, or SKU across all your spreadsheets in real time.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ConnectButton />
          </div>

          {authError && (
            <div className="mx-auto mt-6 max-w-md rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
              We couldn&apos;t complete sign-in ({authError}). Please try again.
            </div>
          )}

          {/* Official Purpose Callout Box (Google OAuth Review Compliance) */}
          <div className="mt-10 rounded-2xl border-2 border-brand-500/30 bg-white p-6 text-left shadow-lg ring-1 ring-slate-200 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Info className="h-4 w-4 shrink-0" />
              <span>Application Purpose &amp; Overview</span>
            </div>

            <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
              What is the purpose of SheetSearch?
            </h2>

            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
              <p>
                <strong>SheetSearch</strong> was built to solve a fundamental limitation of Google Drive and Google Sheets: native Google Sheets only allows you to search within one spreadsheet tab at a time.
              </p>
              <p>
                The core purpose of SheetSearch is to provide users with a unified, high-speed multi-spreadsheet search utility. Once you sign in with your Google Account, SheetSearch allows you to select which spreadsheets from your Google Drive you want to search, enter a search term, and view all matching rows across all files in one unified interface.
              </p>
            </div>

            <div className="mt-5 grid gap-3 pt-2 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/80">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-brand-600" />
                  Why Google User Data is Accessed
                </div>
                <p className="mt-1.5 text-slate-600 leading-relaxed">
                  SheetSearch requests read-only access to Google Drive (to list your spreadsheet titles) and Google Sheets (to search cell values for your query). We never request write or delete access.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/80">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-brand-600" />
                  Strict Zero Data Storage Policy
                </div>
                <p className="mt-1.5 text-slate-600 leading-relaxed">
                  No spreadsheet data or search terms are ever stored in a database or retained on our servers. Searches execute ephemerally in volatile memory and are cleared immediately after display.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Application Mockup */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl text-left ring-1 ring-slate-200/60 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400"></span>
                <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                <span className="h-3 w-3 rounded-full bg-green-400"></span>
                <span className="ml-2 text-xs font-semibold text-slate-500">SheetSearch Interface Preview</span>
              </div>
              <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">Live Demo Preview</span>
            </div>

            <div className="mt-4 space-y-4">
              {/* Search Bar Preview */}
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <Search className="h-3.5 w-3.5 text-brand-600" /> Search Keyword
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200">
                  <span>Invoice #INV-2024-8910</span>
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-[11px] text-brand-700 font-semibold">3 files selected</span>
                </div>
              </div>

              {/* Results Match Card Preview */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>Client Billing Ledger 2024.xlsx</span>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">1 match found</span>
                </div>
                <div className="p-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Sheet: <strong>Q3 Invoices</strong> · Row: <strong>142</strong> · Column: <strong>C</strong></span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                      Open in Sheets <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="overflow-hidden rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                    <div className="grid grid-cols-4 gap-2 text-slate-600">
                      <div>2024-09-18</div>
                      <div>Acme Corp</div>
                      <div className="bg-amber-100 text-amber-900 font-bold px-1 rounded">INV-2024-8910</div>
                      <div>$4,850.00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/80">
              <Lock className="h-6 w-6 text-brand-600" />
              <div className="mt-2 text-sm font-semibold text-slate-900">Read-Only</div>
              <div className="text-xs text-slate-500 mt-0.5">Cannot edit or alter sheets</div>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/80">
              <DatabaseZap className="h-6 w-6 text-brand-600" />
              <div className="mt-2 text-sm font-semibold text-slate-900">Zero Storage</div>
              <div className="text-xs text-slate-500 mt-0.5">No sheet data saved to servers</div>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/80">
              <Zap className="h-6 w-6 text-brand-600" />
              <div className="mt-2 text-sm font-semibold text-slate-900">Live Search</div>
              <div className="text-xs text-slate-500 mt-0.5">Real-time Sheets API queries</div>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200/80">
              <ExternalLink className="h-6 w-6 text-brand-600" />
              <div className="mt-2 text-sm font-semibold text-slate-900">Deep Linking</div>
              <div className="text-xs text-slate-500 mt-0.5">Jumps to exact matching row</div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Purpose Section */}
      <section id="purpose" className="border-t border-slate-200/70 bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Application Purpose
            </h2>
            <p className="mt-2 text-2xl font-medium text-slate-900 sm:text-3xl">
              Why We Built SheetSearch
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Google Drive and Google Sheets natively limit your in-sheet searching to one document at a time. When managing dozens of project sheets, monthly financial reports, inventory logs, or customer lists, finding a single piece of information requires opening each file individually.
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              <strong>SheetSearch</strong> solves this problem by allowing you to select your spreadsheets and execute live, high-speed keyword queries across all of them in parallel.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Multi-Spreadsheet Search</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Select multiple spreadsheets from your Google Drive and search across all tabs simultaneously in one unified search view.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                <Table className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Instant Row Context</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                See the exact spreadsheet title, sheet/tab name, matching row number, and the full row data with matched cells highlighted.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                <ExternalLink className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">1-Click Deep Navigation</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Every search result includes a direct deep-link that opens the Google Sheet scrolled directly to the exact row and cell range.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Live, Real-Time Queries</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                No stale caches. Queries fetch live data via Google APIs so any modifications made to your Google Sheets seconds ago are reflected.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                <DatabaseZap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Strict Zero Data Storage</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Your spreadsheets never get saved to any database. Search data is processed ephemerally in volatile memory during your request only.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Encrypted Client Sessions</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Authentication tokens are kept inside encrypted, HTTP-only cookie sessions. Revoke permissions anytime from your Google Account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Step-by-Step Workflow
            </h2>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              How SheetSearch Works
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
              A simple 4-step workflow to search across all your spreadsheets in seconds.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 1</div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Connect Google</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Click &quot;Connect with Google&quot; to securely sign in using Google OAuth with read-only permissions.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 2</div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Pick Spreadsheets</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Select which Google Sheets you want to search through your list of accessible Drive spreadsheets.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 3</div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Search Keyword</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Type any search term, customer name, date, or SKU. SheetSearch queries your selected sheets live.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 4</div>
              <h3 className="mt-2 text-base font-bold text-slate-900">Open Exact Row</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Review matching rows with highlighted matching cells and click &quot;Open in Sheets&quot; to jump straight to that row.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google API Scopes & Transparency Section */}
      <section id="permissions" className="border-t border-slate-200/70 bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              OAuth Consent &amp; Transparency
            </h2>
            <p className="mt-2 text-2xl font-medium text-slate-900 sm:text-3xl">
              Google API Permissions Requested
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
              SheetSearch requests only the minimal read-only permissions needed to deliver the search functionality.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800">
                  drive.readonly
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    https://www.googleapis.com/auth/drive.readonly
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    <strong>Purpose:</strong> Used exclusively to retrieve your list of Google Sheets filenames and IDs so you can pick which spreadsheets you wish to search. SheetSearch cannot modify, create, or delete any files.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800">
                  spreadsheets.readonly
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    https://www.googleapis.com/auth/spreadsheets.readonly
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    <strong>Purpose:</strong> Used strictly during active search requests to read tab names and cell values within your chosen spreadsheets to identify matching keyword rows. Data is never stored permanently.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800">
                  openid / email / profile
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Basic Profile &amp; Email
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    <strong>Purpose:</strong> Used solely to authenticate your session and display your signed-in email address in the application interface.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border-l-4 border-brand-500 bg-brand-50/70 p-4 text-xs leading-relaxed text-slate-700">
            <strong>Google API Services User Data Policy:</strong> SheetSearch&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-700 underline hover:text-brand-800"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </div>
        </div>
      </section>

      {/* Security & FAQ Section */}
      <section id="security" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Security &amp; FAQ
            </h2>
            <p className="mt-2 text-2xl font-medium text-slate-900 sm:text-3xl">
              Frequently Asked Questions
            </p>
          </div>

          <div id="faq" className="mt-10 space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Does SheetSearch save or store my spreadsheet data?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                <strong>No.</strong> SheetSearch operates with zero persistent storage. When you perform a search, spreadsheet cells are read ephemerally in volatile memory to locate matching keywords and returned immediately to your browser. No spreadsheet contents, formulas, or search terms are saved to a database.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Can SheetSearch edit or delete my spreadsheets?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                <strong>No.</strong> We only request read-only scopes (<code>drive.readonly</code> and <code>spreadsheets.readonly</code>). The application has no write, edit, or delete capabilities on your files.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                How do I disconnect my Google Account?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                You can sign out at any time via the &quot;Sign Out&quot; button, which destroys your encrypted session cookie. You can also revoke access anytime from your{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 underline"
                >
                  Google Account Security Settings
                </a>
                .
              </p>
            </div>
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 p-8 text-center text-white shadow-lg sm:p-10">
            <h3 className="text-2xl uppercase font-bold">Ready to Search Your Google Sheets?</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-blue-100">
              Connect your account in seconds with read-only access and find any record instantly.
            </p>
            <div className="mt-6 flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
