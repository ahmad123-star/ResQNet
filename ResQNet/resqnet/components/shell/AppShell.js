"use client";

import { useShell } from "@/lib/shellContext";
import { cn } from "@/lib/utils";

/**
 * AppShell — the content area that sits beside/below the sidebar.
 *
 * Adjusts its left margin to match the current sidebar width so content
 * is never obscured. On mobile the sidebar is hidden, so no margin is needed.
 *
 * The CSS variable --sidebar-w is also read by the Header to set its left edge.
 */

const SIDEBAR_W_FULL = 240;
const SIDEBAR_W_RAIL = 68;

export default function AppShell({ children }) {
  const { collapsed } = useShell();
  const sidebarW = collapsed ? SIDEBAR_W_RAIL : SIDEBAR_W_FULL;

  return (
    <>
      {/* Communicate the sidebar width to the Header via a CSS variable on body. */}
      <style>{`:root { --sidebar-w: ${sidebarW}px; }`}</style>

      <div
        className={cn(
          // On mobile: no left offset, just top/bottom clearance for header + bottom nav.
          "pt-16 pb-20 md:pb-0",
          // On md+: shift right to clear the sidebar.
          "md:pt-16"
        )}
        style={{ marginLeft: `var(--sidebar-on-desktop, 0px)` }}
      >
        {/* Inner <style> sets the desktop margin separately so we don't affect mobile. */}
        <style>{`
          @media (min-width: 768px) {
            :root { --sidebar-on-desktop: ${sidebarW}px; }
          }
          @media (max-width: 767px) {
            :root { --sidebar-on-desktop: 0px; }
          }
        `}</style>
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </>
  );
}
