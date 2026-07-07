"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Activity, ArrowRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import { cn, timeAgo } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { getCategoryColor, dbStatusToUi } from "@/lib/data/victimData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

const STAT_ICONS = {
  active:   { icon: AlertTriangle, bg: "bg-critical-light", text: "text-primary",   badge: "critical" },
  resolved: { icon: CheckCircle2,  bg: "bg-resolved-light", text: "text-resolved",  badge: "resolved" },
};

/* Map DB status → activity dot colour */
function activityDot(dbStatus) {
  if (dbStatus === "Resolved")    return "bg-resolved";
  if (dbStatus === "In Progress") return "bg-pending";
  return "bg-info";
}

function activityBadge(dbStatus) {
  if (dbStatus === "Resolved")    return "resolved";
  if (dbStatus === "In Progress") return "pending";
  return "info";
}

export default function VictimDashboard() {
  const { user } = useShell();

  const [activeCount,   setActiveCount]   = useState(null);
  const [resolvedCount, setResolvedCount] = useState(null);
  const [recent,        setRecent]        = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    Promise.all([
      // Active = Reported + In Progress
      supabase
        .from("emergencies")
        .select("*", { count: "exact", head: true })
        .eq("victim_id", user.id)
        .in("status", ["Reported", "In Progress"]),

      // Resolved
      supabase
        .from("emergencies")
        .select("*", { count: "exact", head: true })
        .eq("victim_id", user.id)
        .eq("status", "Resolved"),

      // Recent 5 for activity feed
      supabase
        .from("emergencies")
        .select("id, status, created_at, description, emergency_categories(name)")
        .eq("victim_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]).then(([activeRes, resolvedRes, recentRes]) => {
      setActiveCount(activeRes.count ?? 0);
      setResolvedCount(resolvedRes.count ?? 0);
      setRecent(recentRes.data ?? []);
      setLoading(false);
    });
  }, [user?.id]);

  const stats = [
    {
      id: "active",
      label: "Active Emergencies",
      value: activeCount,
      sub: "Reported or in progress",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: resolvedCount,
      sub: "All time",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading */}
      <motion.div
        variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">My Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Overview of your emergency reports and nearby help.
          </p>
        </div>
        <p className="text-xs text-text-secondary">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Report CTA */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
        <div className="relative overflow-hidden rounded-2xl bg-primary p-6 sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 right-20 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Need help right now?</h2>
              <p className="mt-1 max-w-md text-sm text-white/80">
                Submit an emergency report and the nearest volunteers and NGOs will be notified immediately.
              </p>
            </div>
            <div className="relative shrink-0">
              <motion.span
                className="absolute inset-0 rounded-xl bg-white/30"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <Link
                href="/victim/report"
                className="relative flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-primary shadow transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <AlertTriangle className="h-5 w-5" />
                Report Emergency
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-2"
      >
        {stats.map((stat) => {
          const meta = STAT_ICONS[stat.id];
          const Icon = meta.icon;
          return (
            <motion.div key={stat.id} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", meta.bg)}>
                    <Icon className={cn("h-5 w-5", meta.text)} />
                  </span>
                  <StatusBadge status={meta.badge} dot={false} />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-9 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold tracking-tight text-text">{stat.value}</p>
                  )}
                  <p className="text-sm font-medium text-text">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{stat.sub}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.18 }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-text-secondary" />
            <h2 className="text-base font-semibold text-text">Recent Activity</h2>
          </div>
          <Link
            href="/victim/my-emergencies"
            className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary rounded"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Card>
          {loading ? (
            <ul className="divide-y divide-border">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </li>
              ))}
            </ul>
          ) : recent.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-text-secondary">
              No emergencies yet.{" "}
              <Link href="/victim/report" className="font-medium text-primary hover:text-primary-hover">
                Report one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((item, i) => {
                const categoryName = item.emergency_categories?.name ?? "Emergency";
                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + i * 0.05, duration: 0.22 }}
                    className="flex items-start gap-3 px-5 py-3.5"
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", activityDot(item.status))} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text leading-snug">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold mr-1.5",
                          getCategoryColor(categoryName)
                        )}>
                          {categoryName}
                        </span>
                        {item.description?.slice(0, 80)}{item.description?.length > 80 ? "…" : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">{timeAgo(item.created_at)}</p>
                    </div>
                    <StatusBadge status={activityBadge(item.status)} dot={false} className="shrink-0 self-start">
                      {item.status}
                    </StatusBadge>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </Card>
      </motion.section>

    </div>
  );
}
