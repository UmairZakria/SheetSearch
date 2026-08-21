// components/Footer.js
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Sheet Search</span>
            <span>·</span>
            <span>Search your Google Sheets securely</span>
          </div>

          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link
              href="/privacy-policy"
              className="text-slate-600 transition-colors hover:text-brand-600"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-slate-600 transition-colors hover:text-brand-600"
            >
              Terms of Service
            </Link>
          </nav>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 sm:text-left">
          <p>
            © {currentYear} Sheet Search (
            <a
              href="https://sheetsearch.umairlab.com"
              className="hover:underline hover:text-slate-500"
            >
              sheetsearch.umairlab.com
            </a>
            ). All rights reserved. Sheet Search is not affiliated with or endorsed by Google LLC. Google Sheets and Google Drive are trademarks of Google LLC.
          </p>
        </div>
      </div>
    </footer>
  );
}
