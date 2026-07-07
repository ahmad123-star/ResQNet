"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle, Package, Users, CheckCircle2,
  ArrowRight, BarChart2, PieChart,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

const KPI_ICONS = {
  open:      { icon: AlertTriangle, bg: "bg-critical-light", text: "text-primary",  badge: "critical" },
  resources: { icon: Package,       bg: "bg-info-light",     text: "text-info",     badge: "info" },
  assigned:  { icon: Users,         bg: "bg-pending-light",  text: "text-pending",  badge: "pending" },
  resolved:  { icon: CheckCircle2,  bg: "bg-resolved-light", text: "text-resolved", badge: "resolved" },
};

const KPI_META = [
  { id: "open",      label: "Open Requests",      sub: "Reported or in progress" },
  { id: "resources", label: "Resources Tracked",   sub: "In your inventory" },
  { id: "assigned",  label: "Volunteers Assigned", sub: "Active tasks right now" },
  { id: "resolved",  label: "Resolved",            sub: "All time" },
];

/* ── Chart placeholder ───────────────────────────────────────────────────── */
function ChartPlaceholder({ icon: Icon, label, description }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-slate-50 text-center px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  { href: "/ngo/requests",  icon: AlertTriangle, label: "Emergency Requests", sub: "Review and assign incoming requests", bg: "bg-critical-light", text: "text-primary" },
  { href: "/ngo/resources", icon: Package,       label: "Resources",          sub: "Track and manage available resources", bg: "bg-info-light",     text: "text-info" },
  { href: "/ngo/assign",    icon: Users,         label: "Assign Volunteers",  sub: "Match volunteers to open emergencies", bg: "bg-pending-light",  text: "text-pending" },
  { href: "/ngo/reports",   icon: BarChart2,     label: "Reports",            sub: "View operational performance metrics", bg: "bg-resolved-light", text: "text-resolved" },
];

export default function NgoDashboard() {
  const { user } = useShell();

  const [loading,    setLoading]    = useState(true);
  const [kpis,       setKpis]       = useState({ open: null, resources: null, assigned: null, resolved: null });
  const [dateString, setDateString] = useState(null);

  useEffect(() => {
    setDateString(new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    Promise.all([
      // Open requests (Reported + In Progress)
      supabase
        .from("emergencies")
        .select("*", { count: "exact", head: true })
        .in("status", ["Reported", "In Progress"]),

      // Resources for this NGO
      supabase
        .from("resources")
        .select("*", { count: "exact", head: true })
        .eq("ngo_id", user.id),

      // Active volunteer tasks
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .in("status", ["Accepted", "In Progress"]),

      // Resolved emergencies
      supabase
        .from("emergencies")
        .select("*", { count: "exact", head: true })
        .eq("status", "Resolved"),
    ]).then(([openRes, resRes, assignedRes, resolvedRes]) => {
      setKpis({
        open:      openRes.count      ?? 0,
        resources: resRes.count       ?? 0,
        assigned:  assignedRes.count  ?? 0,
        resolved:  resolvedRes.count  ?? 0,
      });
      setLoading(false);
    });
  }, [user?.id]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{user?.name ?? "NGO"}</p>
          <h1 className="text-2xl font-bold tracking-tight text-text">Operations Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Overview of ongoing emergency operations.</p>
        </div>
        <p className="text-xs text-text-secondary">{dateString}</p>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_META.map((kpi) => {
          const meta = KPI_ICONS[kpi.id];
          const Icon = meta.icon;
          return (
            <motion.div key={kpi.id} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", meta.bg)}>
                    <Icon className={cn("h-5 w-5", meta.text)} aria-hidden="true" />
                  </span>
                  <StatusBadge status={meta.badge} dot={false} />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-9 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold tracking-tight text-text">{kpis[kpi.id]}</p>
                  )}
                  <p className="text-sm font-medium text-text">{kpi.label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{kpi.sub}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Chart placeholders */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
        <div className="mb-4 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">Analytics</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-secondary">
            Charts coming soon
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card padded>
            <p className="mb-3 text-sm font-semibold text-text">Emergencies by Category</p>
            <ChartPlaceholder
              icon={PieChart}
              label="Category breakdown chart"
              description="Pie chart showing distribution of emergency types will render here."
            />
          </Card>
          <Card padded>
            <p className="mb-3 text-sm font-semibold text-text">Status Overview</p>
            <ChartPlaceholder
              icon={BarChart2}
              label="Status progress chart"
              description="Bar chart of Open / In Progress / Resolved counts will render here."
            />
          </Card>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" transition={{ delay: 0.18 }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.href} variants={staggerItem}>
              <Link href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.bg)}>
                  <Icon className={cn("h-5 w-5", item.text)} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{item.label}</p>
                  <p className="truncate text-xs text-text-secondary">{item.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}
