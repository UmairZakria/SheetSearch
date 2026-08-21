// app/layout.js
import './globals.css';

export const metadata = {
  title: 'SheetSearch - Search Across All Your Google Sheets',
  description: 'SheetSearch lets you search across all of your Google Sheets in real time with read-only access and zero data storage.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
