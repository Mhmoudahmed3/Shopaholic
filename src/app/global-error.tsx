'use client';

import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-black`}>
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-3xl font-serif mb-4">Critical Error</h1>
            <p className="max-w-md text-neutral-600 mb-8">
              A critical problem occurred that prevented the application from loading. 
              Our team has been notified.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
            >
              Try Again
            </button>
        </div>
      </body>
    </html>
  );
}
