import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkSections = [
    {
      title: "Quick Links",
      items: [
        { label: "Home", href: "/" },
        { label: "Purpose & Features", href: "/#purpose" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "FAQs", href: "/#faq" },
      ],
    },
    {
      title: "Legal & Privacy",
      items: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
        {
          label: "Google API Policy",
          href: "https://developers.google.com/terms/api-services-user-data-policy",
          external: true,
        },
      ],
    },
    {
      title: "Follow Us",
      items: [
        {
          label: "Instagram",
          href: "https://www.instagram.com/umairlab/",
          external: true,
        },
        {
          label: "Facebook",
          href: "https://www.facebook.com/profile.php?id=61577743829712",
          external: true,
        },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/umairzakria/",
          external: true,
        },
        {
          label: "GitHub",
          href: "https://github.com/UmairZakria",
          external: true,
        },
      ],
    },
  ];

  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 relative z-50 bg-white/5 backdrop-blur-xs font-poppins">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div>
              <img src="/logo.png" alt="SheetSearch Logo" className="size-[3.5vw] min-w-8 min-h-8 brightness-110" />
            </div>
            <span className="text-xl font-comfortaa font-bold text-black">
              <span className="text-[#00ff88]">Sheet</span>
              Search
            </span>
          </Link>
          <p className="max-w-[410px] mt-6 text-sm text-slate-600 leading-relaxed">
            SheetSearch is a dedicated search productivity utility designed to query across multiple Google Spreadsheets simultaneously with 100% read-only access and zero persistent data storage.
          </p>
        </div>

        <div className="flex flex-wrap justify-between w-full md:w-[50%] gap-6">
          {linkSections.map((section, index) => (
            <div key={index} className="min-w-[120px]">
              <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
                {section.title}
              </h3>
              <ul className="text-sm space-y-2">
                {section.items.map((item, i) => (
                  <li key={i}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-black hover:underline transition"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-slate-600 hover:text-black hover:underline transition"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <p>
          Copyright {currentYear} ©{" "}
          <a
            href="https://www.umairlab.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-800 hover:underline"
          >
            UmairLab
          </a>
          . All Rights Reserved.
        </p>
        <p className="text-[11px] text-slate-400 text-center sm:text-right">
          SheetSearch is not affiliated with or endorsed by Google LLC. Google Sheets and Google Drive are trademarks of Google LLC.
        </p>
      </div>
    </footer>
  );
}
