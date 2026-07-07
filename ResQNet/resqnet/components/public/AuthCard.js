import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * AuthCard — centered card container shared by all auth pages.
 *
 * Renders the ResQNet logo, an optional back-link, a heading + subtext, then
 * the form content as `children`, and finally a footer slot for contextual
 * links (e.g. "Already have an account? Login").
 *
 * Not animated here — each auth page wraps it with a motion.div so the card
 * slides in fresh on every visit.
 */
export default function AuthCard({
  title,
  description,
  backHref,
  backLabel,
  footer,
  wide = false,
  className,
  children,
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-border bg-surface p-7 shadow-md",
        wide ? "max-w-md" : "max-w-sm",
        className
      )}
    >
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-1">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow">
          R
        </span>
        <span className="mt-1 text-lg font-bold tracking-tight text-text">
          Res<span className="text-primary">Q</span>Net
        </span>
      </div>

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
        )}
      </div>

      {/* Form content */}
      {children}

      {/* Footer links */}
      {footer && (
        <div className="mt-5 text-center text-sm text-text-secondary">
          {footer}
        </div>
      )}
    </div>
  );
}
