"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, LogOut, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";
import { useShell } from "@/lib/shellContext";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const { user, role, setDrawerOpen, avatarUrl, unreadCount } = useShell();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-20 flex h-16 items-center justify-between gap-3",
        "border-b border-border bg-surface/90 backdrop-blur px-4",
        "left-0 md:left-(--sidebar-w,240px) transition-[left] duration-300"
      )}
    >
      {/* ---- Left: Hamburger (mobile) + wordmark (mobile) ---- */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-base font-bold tracking-tight text-text">
          Res<span className="text-primary">Q</span>Net
        </span>
      </div>

      {/* Spacer on desktop */}
      <div className="hidden md:flex flex-1" />

      {/* ---- Right controls ---- */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Active emergencies pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
              animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <Link href="/dashboard" className="text-xs font-semibold text-critical-strong whitespace-nowrap">
            Live
          </Link>
        </div>

        {/* Notifications bell with real live badge */}
        <Link
          href="/notifications"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Bell className="h-5 w-5" />

          {/* Badge — re-mounts (and re-animates) each time unreadCount changes */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key={unreadCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={cn(
                  "absolute right-1 top-1 flex items-center justify-center rounded-full",
                  "bg-primary text-white font-bold leading-none",
                  unreadCount > 9
                    ? "h-4 w-4 text-[8px]"
                    : "h-3.5 w-3.5 text-[8px]"
                )}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* User avatar + dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              aria-label="User menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
            >
              <Avatar src={avatarUrl} name={user?.name ?? "User"} size="sm" />
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-semibold text-text">{user?.name ?? "User"}</p>
            <p className="text-xs text-text-secondary capitalize">{role}</p>
          </div>
          <DropdownItem icon={User}     onSelect={() => router.push("/profile")}>Profile</DropdownItem>
          <DropdownItem icon={Settings} onSelect={() => router.push("/profile")}>Settings</DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={LogOut} destructive onSelect={handleLogout}>Log out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
