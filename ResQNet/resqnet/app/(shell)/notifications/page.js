"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, AlertTriangle, CheckCircle2, Heart, Settings,
  ClipboardList, Check, BellOff,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/motion";
import { useShell } from "@/lib/shellContext";

/* ── Type icon map ───────────────────────────────────────────────────────── */
const TYPE_META = {
  emergency: { icon: AlertTriangle, bg: "bg-critical-light", text: "text-primary" },
  task:      { icon: ClipboardList, bg: "bg-pending-light",  text: "text-pending" },
  resolved:  { icon: CheckCircle2,  bg: "bg-resolved-light", text: "text-resolved" },
  donation:  { icon: Heart,         bg: "bg-info-light",     text: "text-info" },
  system:    { icon: Settings,      bg: "bg-slate-100",      text: "text-text-secondary" },
};

/* ── Skeleton rows ───────────────────────────────────────────────────────── */
function NotifSkeleton() {
  return (
    <div className="space-y-px">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-border last:border-0">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ── Single notification row ─────────────────────────────────────────────── */
function NotifRow({ notif, onMarkRead }) {
  const meta = TYPE_META[notif.type] ?? TYPE_META.system;
  const Icon = meta.icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-start gap-4 px-5 py-4 transition-colors",
        "border-b border-border last:border-0",
        !notif.read && "bg-primary-light/30"
      )}
    >
      {/* Type icon */}
      <span className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        meta.bg
      )}>
        <Icon className={cn("h-5 w-5", meta.text)} aria-hidden="true" />
        {!notif.read && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" />
        )}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-sm leading-snug",
          notif.read ? "font-normal text-text" : "font-semibold text-text"
        )}>
          {notif.title}
        </p>
        <p className="mt-0.5 text-sm text-text-secondary leading-snug">{notif.message}</p>
        <p className="mt-1 text-xs text-text-secondary">{notif.time}</p>
      </div>

      {/* Mark as read */}
      {!notif.read && (
        <button
          type="button"
          onClick={() => onMarkRead(notif.id)}
          aria-label="Mark as read"
          className={cn(
            "mt-1 shrink-0 flex h-7 w-7 items-center justify-center rounded-full",
            "border border-border text-text-secondary transition-colors",
            "hover:border-primary hover:bg-primary-light hover:text-primary",
            "focus-visible:outline-2 focus-visible:outline-primary"
          )}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </motion.li>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const { notifications, notifsLoading, unreadCount, markRead, markAllRead } = useShell();
  const toast = useToast();
  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkRead = (id) => {
    markRead(id);
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await markAllRead();
    setMarkingAll(false);
    toast.success("All notifications marked as read");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Heading */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-text-secondary" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text">Notifications</h1>
              {!notifsLoading && (
                <p className="text-sm text-text-secondary">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "All caught up"}
                </p>
              )}
            </div>
          </div>
          {!notifsLoading && unreadCount > 0 && (
            <Button variant="ghost" size="sm" loading={markingAll} onClick={handleMarkAllRead}>
              <Check className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {notifsLoading ? (
            <motion.div key="skeleton" exit={{ opacity: 0 }}>
              <Card className="overflow-hidden">
                <NotifSkeleton />
              </Card>
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div key="empty"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <EmptyState
                icon={BellOff}
                title="No notifications yet"
                description="You'll see updates about your emergencies, tasks, and donations here."
              />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="overflow-hidden">
                <motion.ul layout>
                  <AnimatePresence initial={false}>
                    {notifications.map((n) => (
                      <NotifRow key={n.id} notif={n} onMarkRead={handleMarkRead} />
                    ))}
                  </AnimatePresence>
                </motion.ul>

                {/* All-read footer */}
                <AnimatePresence>
                  {unreadCount === 0 && !notifsLoading && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 border-t border-border px-5 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-resolved" aria-hidden="true" />
                      <p className="text-xs font-medium text-resolved-strong">
                        You&apos;re all caught up!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
