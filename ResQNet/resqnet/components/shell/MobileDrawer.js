"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_CONFIG } from "@/lib/navConfig";
import { useShell } from "@/lib/shellContext";
import { cn } from "@/lib/utils";

/**
 * MobileDrawer — full-width slide-in navigation overlay for small screens.
 *
 * - Triggered by the hamburger in the Header.
 * - Renders a backdrop + a panel that slides in from the left.
 * - Closes on backdrop tap, the X button, or when a nav item is tapped.
 * - Only mounted on md- screens (CSS hides it on desktop, but we also skip
 *   rendering entirely to keep the DOM clean).
 */

const DRAWER_W = 280;

export default function MobileDrawer() {
  const { role, drawerOpen, setDrawerOpen } = useShell();
  const pathname = usePathname();
  const config   = NAV_CONFIG[role];

  if (!config) return null;

  const close = () => setDrawerOpen(false);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: -DRAWER_W }}
            animate={{ x: 0 }}
            exit={{ x: -DRAWER_W }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{ width: DRAWER_W }}
            className="absolute left-0 top-0 h-full flex flex-col bg-surface shadow-xl"
          >
            {/* Header row */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                  R
                </span>
                <span className="text-base font-bold tracking-tight text-text">
                  Res<span className="text-primary">Q</span>Net
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Role badge */}
            <div className="px-4 py-3 border-b border-border shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {role}
              </span>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {config.items.map((item, i) => {
                const Icon   = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                        "transition-colors duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        active
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-slate-100 hover:text-text"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
