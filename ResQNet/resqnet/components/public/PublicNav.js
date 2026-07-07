"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PublicNav — minimal top bar for public / auth pages.
 *
 * LEFT  : ResQNet wordmark linking to /.
 * RIGHT : Report Emergency (red, subtle) | Login | Register.
 * MOBILE: hamburger collapses the right actions into a stacked drawer.
 *
 * On auth pages (/login, /register, etc.) the nav is intentionally lighter —
 * just the wordmark and the opposite auth link (login ↔ register).
 */

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export default function PublicNav() {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);
  const isAuth    = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-primary rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
            R
          </span>
          <span className="text-base font-bold tracking-tight text-text">
            Res<span className="text-primary">Q</span>Net
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {!isAuth && (
            <Link
              href="/report"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-critical-strong transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-primary"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Report Emergency
            </Link>
          )}
          {pathname !== "/login" && (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-text transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Login
            </Link>
          )}
          {pathname !== "/register" && (
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Register
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-primary md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              {!isAuth && (
                <Link
                  href="/report"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-critical-strong transition-colors hover:bg-primary-light"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report Emergency
                </Link>
              )}
              {pathname !== "/login" && (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-slate-100"
                >
                  Login
                </Link>
              )}
              {pathname !== "/register" && (
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                  Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
