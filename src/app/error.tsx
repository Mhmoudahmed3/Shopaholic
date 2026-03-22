'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Caught by App Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-white dark:bg-black">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-serif tracking-tight mb-3">We&apos;re experiencing a visual glitch.</h2>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-8">
        Something went wrong while loading this section of Shopaholic. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="group relative flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 text-sm font-bold tracking-[0.2em] uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        <RefreshCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
        Refresh Page
      </button>
    </div>
  );
}
