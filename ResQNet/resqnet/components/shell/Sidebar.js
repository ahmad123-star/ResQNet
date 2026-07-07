"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_CONFIG } from "@/lib/navConfig";
import { useShell } from "@/lib/shellContext";
import { cn } from "@/lib/utils";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Sidebar — fixed left-hand navigation for desktop & tablet.
 *
 * - Full mode (collapsed=false): logo + label + full nav item text.
 * - Rail mode (collapsed=true): logo initial only + icon-only items with tooltips.
 * - Active item has a solid primary-red background pill.
 * - Collapse toggle sits at the bottom of the sidebar.
 *
 * Hidden below the `md` breakpoint (mobile uses MobileDrawer + BottomNav).
 */

const SIDEBAR_W_FULL  = 240;
const SIDEBAR_W_RAIL  = 68;

export default function Sidebar() {
  const { role, collapsed, setCollapsed } = useShell();
  const pathname = usePathname();
  const config   = NAV_CONFIG[role];

  if (!config) return null;

  return (
    <motion.aside
      animate={{ width: collapsed ? SIDEBAR_W_RAIL : SIDEBAR_W_FULL }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-0 h-screen z-30",
        "bg-surface border-r border-border overflow-hidden shrink-0"
      )}
    >
      {/* ---- Logo ---- */}
      <div className={cn(
        "flex items-center h-16 shrink-0 border-b border-border px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
          R
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              key="wordmark"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden whitespace-nowrap text-base font-bold tracking-tight text-text"
            >
              Res<span className="text-primary">Q</span>Net
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Nav items ---- */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {config.items.map((item) => {
          const Icon    = item.icon;
          const active  = pathname === item.href || pathname.startsWith(item.href + "/");

          const inner = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                collapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5 w-full",
                active
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-slate-100 hover:text-text"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );

          // Wrap with tooltip in rail mode for accessibility.
          return collapsed ? (
            <Tooltip key={item.href} content={item.label} side="right">
              {inner}
            </Tooltip>
          ) : (
            <div key={item.href}>{inner}</div>
          );
        })}
      </nav>

      {/* ---- Collapse toggle ---- */}
      <div className="shrink-0 border-t border-border p-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-9 items-center justify-center rounded-xl text-text-secondary",
            "transition-colors hover:bg-slate-100 hover:text-text",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            collapsed ? "w-9 mx-auto" : "w-full gap-2 px-3"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
