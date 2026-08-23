"use client";
import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Does SheetSearch save or store my spreadsheet data?",
      answer:
        "No. SheetSearch operates with strict zero-data-storage. When you perform a search, spreadsheet cells are read ephemerally in volatile memory and returned directly to your browser. Nothing is ever saved to a database or server disk.",
    },
    {
      question: "Can SheetSearch edit or delete my spreadsheets?",
      answer:
        "No. We only request read-only scopes (drive.readonly and spreadsheets.readonly). SheetSearch has no write, edit, or delete capabilities on your files.",
    },
    {
      question: "How do I search across multiple Google Sheets?",
      answer:
        "Sign in with your Google Account, pick the spreadsheets you want to search from your Google Drive list, and type any keyword or transaction ID to see live matches across all sheets simultaneously.",
    },
    {
      question: "How do I disconnect my Google Account?",
      answer:
        "You can sign out anytime using the Sign Out button, which instantly destroys your encrypted session cookie. You can also revoke access anytime in your Google Account Security Settings.",
    },
    {
      question: "What Google permissions are requested?",
      answer:
        "We request drive.readonly to let you choose spreadsheets from your Drive, and spreadsheets.readonly to perform keyword searches across cells in your chosen sheets.",
    },
  ];

  return (
    <div id="faq" className="w-full px-[5vw] mx-auto flex flex-col md:flex-row items-start justify-center gap-8 ">
      <img
        className="max-w-sm w-full rounded-xl h-auto shadow-md"
        src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop"
        alt="SheetSearch FAQ"
      />
      <div className="flex-1">
        <p className="text-emerald-600 text-sm font-medium">FAQ&apos;s</p>
        <h2 className="text-3xl font-semibold text-slate-900 font-poppins">Looking for answers?</h2>
        <p className="text-sm text-slate-500 mt-2 pb-4">
          Everything you need to know about SheetSearch, data security, and multi-sheet querying.
        </p>
        {faqs.map((faq, index) => (
          <div
            className="border-b border-slate-200 py-4 cursor-pointer"
            key={index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-medium text-slate-900 font-poppins">{faq.question}</h3>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${openIndex === index ? "rotate-180" : ""} transition-all duration-300 ease-in-out shrink-0`}
              >
                <path
                  d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                  stroke="#1D293D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className={`text-sm text-slate-600 leading-relaxed transition-all duration-300 ease-in-out max-w-md ${openIndex === index ? "opacity-100 max-h-[300px] translate-y-0 pt-3" : "opacity-0 max-h-0 -translate-y-2 overflow-hidden"}`}
            >
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
