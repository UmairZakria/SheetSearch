// app/layout.js
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import "./globals.css";
import { Poppins, Comfortaa } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["200", "300","400", "500", "600", "700"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["400", "500", "600","700"],
});

export const metadata = {
  title: "SheetSearch - Search Across All Your Google Sheets",
  description:
    "SheetSearch lets you search across all of your Google Sheets in real time with read-only access and zero data storage.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" /> */}
        {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /> */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        />
      </head>
      <body
        className={` ${poppins.variable} ${comfortaa.variable}  antialiased `}
      >
        <SmoothScrollProvider />
        {children}
      </body>
    </html>
  );
}
