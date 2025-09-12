"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log errors to an error reporting service
    // console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded border border-slate-800 bg-slate-950 p-6">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="opacity-80 text-sm mb-4">
          {error?.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-medium rounded px-4 py-2"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded bordeßr border-slate-700 hover:bg-slate-800"
          >
            Go home
          </Link>
        </div>
        {error?.digest && (
          <p className="mt-3 text-xs opacity-60">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
