import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * 404 — not-found.js (global, rendered by Next.js when notFound() is called
 * or a route simply doesn't exist).
 *
 * Server Component — no "use client" needed. Uses plain Tailwind classes from
 * the design system tokens so it works even before client JS hydrates.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Branded accent */}
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light mb-6">
        <AlertTriangle className="h-8 w-8 text-primary" aria-hidden="true" />
      </span>

      {/* Error code */}
      <p className="text-8xl font-bold tracking-tight text-primary select-none">
        404
      </p>

      {/* Heading */}
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-text">
        Page not found
      </h1>

      {/* Message */}
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        If you followed a link, it may be out of date.
      </p>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Back to home
        </Link>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-6 text-sm font-medium text-text transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Go to login
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-xs text-text-secondary">
        Res<span className="font-semibold text-primary">Q</span>Net — emergency response platform
      </p>
    </div>
  );
}
