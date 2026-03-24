import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SHOPOHOLIC | Premium Global Fashion",
  description: "Experience the ultimate collection of curated fashion. Shop SHOPOHOLIC for timeless styles and modern aesthetics.",
};

import { SettingsSync } from "@/components/SettingsSync";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-loader" strategy="beforeInteractive">
          {`
            (function() {
              try {
                const storage = localStorage.getItem('shopaholic-settings-storage');
                const theme = storage ? JSON.parse(storage).state.theme : 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })()
          `}
        </Script>
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col min-h-screen overflow-x-hidden`}>
        <SettingsSync />
        {children}
      </body>
    </html>
  );
}
