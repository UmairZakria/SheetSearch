// app/page.js
// Server Component (SSR) for full SEO, crawler rendering, and immediate HTML delivery.

import { getSession } from "@/lib/session.js";
import SearchDashboard from "@/components/SearchDashboard.jsx";
import Footer from "@/components/Footer.js";
import Link from "next/link";
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
  ChevronRight,
  Info,
  Layers,
  Sprout,
  Activity,
  Gauge,
  Sliders,
  Play,
  MoveRightIcon,
} from "lucide-react";
import ConnectButton from "@/components/ConnectButton";
import FAQ from "@/components/FAQ";
import Hero from "@/components/Hero";
import CustomScrollbar from "@/components/CustomScrollbar";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const session = await getSession();
  const isAuthed = Boolean(session?.tokens?.access_token);
  const authError = searchParams?.auth_error;

  if (isAuthed) {
    return <SearchDashboard initialUser={session.user} />;
  }

  return (
    <div className=" w-full  p-[1.2vw] bg-white   text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* <CustomScrollbar /> */}
      {/* Top Hero Section with Cloud Sky Background */}
      
      <Hero authError={authError}/>
      {/* Official Purpose & Scopes Section (For Google OAuth Verification Compliance) */}
      <section
        id="purpose"
        className="relative z-20  bg-[#F9F9F9] py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex flex-col items-center justify-around gap-[2vw]">
          {/* Section Header */}
          <div className="text-center font-poppins">
            <h2 className="mt-3 text-3xl font-medium text-black sm:text-4xl">
              Application Purpose &amp; Overview
            </h2>
            <p className="mx-auto mt-4 w-[40vw] text-base leading-relaxed text-slate-500 sm:text-base">
              SheetSearch solves a fundamental limitation in Google Drive and
              Google Sheets: native Google Sheets only permits in-sheet
              searching within a single open tab at a time.
            </p>
          </div>

          {/* Highlight Cards */}
          <div className="mt-[3vw] flex w-[90%] gap-[1vw]">
            <div className="rounded-xl   bg-white p-[2vw] shadow-xl ">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-poppins font-medium text-black">
                  What is SheetSearch?
                </h3>
              </div>
              <p className="mt-[0.5vw] text-lg leading-relaxed text-slate-800">
                SheetSearch is a dedicated search productivity utility. Users
                securely connect their Google account, select any number of
                spreadsheets from their Google Drive, and perform instantaneous
                multi-spreadsheet keyword searches to locate exact records,
                invoice numbers, customer transactions, or SKUs in real time.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-xl ">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-medium font-poppins text-black">
                  Strict Zero Data Storage
                </h3>
              </div>
              <p className="mt-3 text-lg leading-relaxed text-slate-800">
                No spreadsheet data, rows, or cell contents are ever stored,
                cached, or saved to a database. Searches execute ephemerally in
                volatile memory and are cleared immediately after display. All
                credentials live exclusively in encrypted session cookies on the
                user&apos;s browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Step-by-Step Process matching Reference UI) */}
      <section
        id="how-it-works"
        className="bg-[#F9F9F9] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="mx-auto max-w-5xl">
          {/* Section Eyebrow & Title */}
          <div className="text-left font-poppins">
            <h2 className="mt-2 text-3xl font-poppins text-center text-slate-900 md:text-4xl">
              Complete every{" "}
              <span className="font-semibold text-black">Step Carefully</span>
            </h2>
          </div>

          {/* S-Curve Process Flow Container */}
          <div className="relative mt-[2vw] p-[2vw]  ">
            {/* Desktop Continuous Winding Blue S-Curve SVG */}
            

            {/* Top Row: Steps 1, 2, 3 */}
            <div className="grid grid-cols-1   md:grid-cols-3 text-center font-poppins relative z-10">
              {/* Step 1: Planning / Auth */}
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-transform duration-300 hover:scale-105">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-medium text-slate-900">
                  Planning &amp; Auth
                </h3>
                <p className="mt-[0.6vw] w-[14vw] text-sm leading-relaxed text-slate-500">
                  Connect securely via Google OAuth with strictly read-only
                  scopes.
                </p>
              </div>

              {/* Step 2: Design / Sheet Selection (Active Highlighted Node) */}
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-2xl border-2 border-sky-400 ring-8 ring-sky-100 transition-transform duration-300 hover:scale-105">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
                    <Layers className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-medium text-slate-900">
                  Sheet Selection
                </h3>
                <p className="mt-[0.6vw] w-[14vw] text-sm leading-relaxed text-slate-500">
                  Choose any number of spreadsheets from your Google Drive list
                  to search.
                </p>
              </div>

              {/* Step 3: Development / Keyword Input */}
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-transform duration-300 hover:scale-105">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <Search className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-medium text-slate-900">
                  Keyword Input
                </h3>
                <p className="mt-[0.6vw] w-[14vw] text-sm leading-relaxed text-slate-500">
                  Type any keyword, transaction ID, invoice number, or customer
                  name.
                </p>
              </div>
            </div>

            {/* Spacer for S-Curve turn in Desktop */}
            <div className=" h-[11vw] " />

            {/* Bottom Row: Steps 4, 5, 6 */}
            <div className="mt-12 md:mt-0   grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6 text-center font-poppins relative z-10">
              {/* Step 4: Testing / Real-Time Scan */}
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-transform duration-300 hover:scale-105">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <Activity className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-medium text-slate-900">
                  Real-Time Scan
                </h3>
                <p className="mt-[0.6vw] w-[14vw] text-sm leading-relaxed text-slate-500">
                  SheetSearch queries selected spreadsheet tabs simultaneously
                  in real time.
                </p>
              </div>

              {/* Step 5: Launch / Live Results */}
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-transform duration-300 hover:scale-105">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-medium text-slate-900">
                  Live Results
                </h3>
                <p className="mt-[0.6vw] w-[14vw] text-sm leading-relaxed text-slate-500">
                  Matching cell snippets, row numbers, and column letters appear
                  live.
                </p>
              </div>

              {/* Step 6: Support / Deep Row Navigation */}
              <div className="flex flex-col items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-transform duration-300 hover:scale-105">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                    <ExternalLink className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="mt-5 text-lg font-medium text-slate-900">
                  Deep Navigation
                </h3>
                <p className="mt-[0.6vw] w-[14vw] text-sm leading-relaxed text-slate-500">
                  Click &quot;Open in Sheets&quot; to launch Google Sheets
                  directly on the exact row.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google API Permissions & Compliance Section */}
      {/* <section
        id="permissions"
        className="border-t border-slate-800 bg-slate-950 py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              OAuth Verification Scopes
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white">
              Google API Permissions Requested
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
              SheetSearch requests strictly read-only permissions necessary to
              deliver search functionality.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-brand-500/20 px-2.5 py-1 text-xs font-mono font-bold text-brand-300">
                  drive.readonly
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    https://www.googleapis.com/auth/drive.readonly
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    <strong>Purpose:</strong> Used exclusively to retrieve your
                    list of Google Sheets titles and IDs so you can select which
                    spreadsheets to search.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300">
                  spreadsheets.readonly
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    https://www.googleapis.com/auth/spreadsheets.readonly
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    <strong>Purpose:</strong> Used strictly during active search
                    requests to read cells in chosen spreadsheets for keyword
                    matches. Never stored.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-purple-500/20 px-2.5 py-1 text-xs font-mono font-bold text-purple-300">
                  openid / email / profile
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Basic Profile &amp; Email
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    <strong>Purpose:</strong> Used solely to authenticate your
                    session and display your signed-in identity in the app.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-brand-500 bg-brand-950/40 p-4 text-xs leading-relaxed text-slate-300 ring-1 ring-brand-500/20">
            <strong>Google API Services User Data Policy:</strong>{" "}
            SheetSearch&apos;s use and transfer of information received from
            Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand-400 underline hover:text-brand-300"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </div>
        </div>
      </section> */}

      {/* Security & FAQ Section */}
      <section
        id="security"
        className="py-20 px-4 bg-[#F9F9F9]  sm:px-6 lg:px-8"
      >
        <FAQ />
        <div className="mx-[5vw]">
          {/* <div id="faq" className="mt-10 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <h3 className="text-sm font-bold text-white">
                Does SheetSearch save or store my spreadsheet data?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                <strong>No.</strong> SheetSearch operates with zero persistent
                storage. When you perform a search, spreadsheet cells are read
                ephemerally in volatile memory to locate matching keywords and
                returned immediately to your browser.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <h3 className="text-sm font-bold text-white">
                Can SheetSearch edit or delete my spreadsheets?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                <strong>No.</strong> We only request read-only scopes (
                <code>drive.readonly</code> and{" "}
                <code>spreadsheets.readonly</code>). The application has no
                write, edit, or delete capabilities.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <h3 className="text-sm font-bold text-white">
                How do I disconnect my Google Account?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                You can sign out at any time via the &quot;Sign Out&quot;
                button, which destroys your encrypted session cookie. You can
                also revoke access anytime from your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-400 underline hover:text-brand-300"
                >
                  Google Account Security Settings
                </a>
                .
              </p>
            </div>
          </div> */}

          {/* Bottom CTA Card */}
          <div className="mt-16 w-full  rounded-xl bg-gradient-to-r from-brand-50 via-sky-50 to-emerald-50 p-[5vw] text-center text-black space-y-[2vw]  ">
            <h3 className="text-3xl font-medium  tracking-tight sm:text-3xl">
              Ready to Search Your Google Sheets?
            </h3>
            <p className="mx-auto mt-[1vw] px-[3vw]  max-w-lg text-lg text-black/90">
              Connect your Google account in seconds with read-only access and
              find any record instantly.
            </p>
            <div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
