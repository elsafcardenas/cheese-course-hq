import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Cheese Course HQ",
  description: "Content, tasks, platforms and KPIs for The Cheese Course in Miami and Spain.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Light by default; each person can switch to dark (remembered on their device).
  const store = await cookies();
  const dark = store.get("theme")?.value === "dark";
  const lang = store.get("lang")?.value === "es" ? "es" : "en";
  return (
    <html lang={lang} className={dark ? "dark" : ""}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
