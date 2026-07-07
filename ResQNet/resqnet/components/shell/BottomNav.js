"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_CONFIG } from "@/lib/navConfig";
import { useShell } from "@/lib/shellContext";
import { cn } from "@/lib/utils";

/**
 * BottomNav — fixed mobile bottom navigation bar + a prominent SOS/action button.
 *
 * Visible only on mobile (hidden md+).
 * Shows 4 key items per role (from navConfig.bottomNav).
 * The role's `primaryAction` floats above the centre of the bar as a large
 * red pill — always one tap away.
 *
 * The SOS button is skipped if the primary action is already one of the 4
 * bottom nav items AND the bar already surfaces it visually.
 */
export default function BottomNav() {
  const { role } = useShell();
  const pathname  = usePathname();
  const config    = NAV_CONFIG[role];

  if (!config) return null;

  const { items, bottomNav, primaryAction } = config;

  // Resolve the 4 bottom-nav items from the role's full item list.
  const navItems = bottomNav
    .map((href) => items.find((it) => it.href === href))
    .filter(Boolean);

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30">
      {/* SOS / primary action — floats above the bar centre */}
      <div className="relative flex justify-center">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -top-6"
        >
          <Link
            href={primaryAction.href}
            className={cn(
              "flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg",
              "transition-all active:scale-95",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            )}
          >
            {/* Pulsing ring on the SOS button */}
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-white/60"
                animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            {primaryAction.label}
          </Link>
        </motion.div>
      </div>

      {/* Bar */}
      <nav className="flex items-end bg-surface border-t border-border px-1 pb-safe">
        {navItems.map((item) => {
          const Icon   = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-end gap-1 py-2 pt-3 text-center",
                "transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-primary",
                active ? "text-primary" : "text-text-secondary"
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={cn("h-5 w-5", active && "scale-105")}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium leading-tight">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
