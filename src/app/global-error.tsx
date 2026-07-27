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
    console.error("OfferLoop root error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#faf8f5] px-6 text-center text-[#1c1d24]">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl font-semibold">
            Something went wrong in the simulation
          </h1>
          <p className="max-w-md text-sm text-[#5b5d6b]">
            This is an unexpected technical error, not a real employment issue. Your guest
            data stays safely on this device. Try reloading the page.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[#6366f1] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-[#d8d5cd] px-5 py-2.5 text-sm font-medium text-[#1c1d24] transition-colors hover:bg-[#f1efe9]"
          >
            Go to homepage
          </Link>
        </div>
      </body>
    </html>
  );
}
