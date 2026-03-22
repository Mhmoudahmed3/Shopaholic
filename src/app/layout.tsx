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
  title: "SHOPAHOLIC | Minimalist Luxury Fashion",
  description: "Experience the pinnacle of minimalist luxury. Discover our curated collection of timeless fashion essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
