"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, AlertTriangle, Building2, HandCoins,
  CheckCircle2, BarChart2, PieChart, ArrowRight, ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { SYSTEM_CHECKS } from "@/lib/data/adminData";
import { createClient } from "@/lib/supabase/client";

const KPI_DEFS = [
  {
    id:   "users",
    label: "Total Users",
    icon:  Users,
    bg:    "bg-info-light",
    text:  "text-info",
    status: "info",
  },
  {
    id:   "emergencies",
    label: "Active Emergencies",
    icon:  AlertTriangle,
    bg:    "bg-critical-light",
    text:  "text-primary",
    status: "critical",
  },
  {
    id:   "ngos",
    label: "Partner NGOs",
    icon:  Building2,
    bg:    "bg-pending-light",
    text:  "text-pending",
    status: "pending",
  },
  {
    id:   "donations",
    label: "Total Donations",
    icon:  HandCoins,
    bg:    "bg-resolved-light",
    text:  "text-resolved",
    status: "resolved",
  },
];

const QUICK_LINKS = [
  { href: "/admin/users",      icon: Users,         label: "Users",       sub: "Manage accounts & roles",   bg: "bg-info-light",     text: "text-info" },
  { href: "/admin/logs",       icon: AlertTriangle, label: "System Logs", sub: "Monitor platform activity", bg: "bg-critical-light", text: "text-primary" },
  { href: "/admin/donations",  icon: HandCoins,     label: "Donations",   sub: "View all transactions",     bg: "bg-resolved-light", text: "text-resolved" },
  { href: "/admin/performance",icon: BarChart2,     label: "Performance", sub: "Uptime & response metrics", bg: "bg-pending-light",  text: "text-pending" },
];

function ChartBox({ icon: Icon, label, description }) {
  return (
    <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-slate-50 text-center px-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

function KpiValue({ loading, value, sub }) {
  if (loading) {
    return (
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    );
  }
  return (
    <>
      <p className="text-3xl font-bold tracking-tight text-text">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>
    </>
  );
}

export default function AdminDashboard() {
  const [counts,  setCounts]  = useState({ users: 0, emergencies: 0, ngos: 0, donations: 0 });
  const [loading, setLoading] = useState(true);
  const allOk = SYSTEM_CHECKS.every((c) => c.ok);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("emergencies").select("*", { count: "exact", head: true }).in("status", ["Reported", "In Progress"]),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "ngo"),
      supabase.from("donations").select("*", { count: "exact", head: true }),
    ]).then(([usersRes, emRes, ngoRes, donRes]) => {
      setCounts({
        users:       usersRes.count  ?? 0,
        emergencies: emRes.count     ?? 0,
        ngos:        ngoRes.count    ?? 0,
        donations:   donRes.count    ?? 0,
      });
      setLoading(false);
    });
  }, []);

  const kpiValues = {
    users:       { value: counts.users.toLocaleString(),       sub: "Registered accounts" },
    emergencies: { value: counts.emergencies.toLocaleString(), sub: "Reported + In Progress" },
    ngos:        { value: counts.ngos.toLocaleString(),        sub: "Active partner NGOs" },
    donations:   { value: counts.donations.toLocaleString(),   sub: "Total records" },
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Admin Panel</p>
          <h1 className="text-2xl font-bold tracking-tight text-text">System Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Platform-wide overview and health.</p>
        </div>
        <p className="text-xs text-text-secondary">{today}</p>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_DEFS.map((kpi) => {
          const Icon = kpi.icon;
          const vals = kpiValues[kpi.id];
          return (
            <motion.div key={kpi.id} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", kpi.bg)}>
                    <Icon className={cn("h-5 w-5", kpi.text)} aria-hidden="true" />
                  </span>
                  <StatusBadge status={kpi.status} dot={false} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{kpi.label}</p>
                  <KpiValue loading={loading} value={vals.value} sub={vals.sub} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts + System Status side by side */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}
        className="grid gap-6 lg:grid-cols-3">

        {/* Chart placeholders */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-4 w-4 text-text-secondary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-text">Analytics</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-secondary">Charts coming soon</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padded>
              <p className="mb-3 text-sm font-semibold text-text">Emergencies by Category</p>
              <ChartBox icon={PieChart} label="Category breakdown" description="Pie chart of emergency types." />
            </Card>
            <Card padded>
              <p className="mb-3 text-sm font-semibold text-text">User Growth</p>
              <ChartBox icon={BarChart2} label="Registrations over time" description="New users per week line chart." />
            </Card>
          </div>
        </div>

        {/* System status */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.16 }}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                  <CardTitle>System Status</CardTitle>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  allOk ? "bg-resolved-light text-resolved-strong" : "bg-critical-light text-critical-strong"
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", allOk ? "bg-resolved" : "bg-primary")} />
                  {allOk ? "All systems go" : "Degraded"}
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2.5">
                {SYSTEM_CHECKS.map((check) => (
                  <li key={check.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text">{check.label}</span>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                      check.ok ? "bg-resolved-light text-resolved-strong" : "bg-critical-light text-critical-strong"
                    )}>
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {check.ok ? "Operational" : "Down"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
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
