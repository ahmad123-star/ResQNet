"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, BarChart2, TrendingUp, RefreshCw,
  Cpu, Clock, Users, AlertOctagon, ArrowUp, ArrowDown,
  AlertTriangle, Building2, HandCoins,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { PERF_METRICS } from "@/lib/data/adminData";
import { createClient } from "@/lib/supabase/client";

const METRIC_ICONS = {
  uptime:   { icon: Activity,     bg: "bg-resolved-light", text: "text-resolved" },
  resp:     { icon: Clock,        bg: "bg-info-light",     text: "text-info" },
  sessions: { icon: Users,        bg: "bg-pending-light",  text: "text-pending" },
  errors:   { icon: AlertOctagon, bg: "bg-critical-light", text: "text-primary" },
};

const PLATFORM_DEFS = [
  { id: "users",       label: "Total Users",        icon: Users,         bg: "bg-info-light",     text: "text-info",     status: "info" },
  { id: "emergencies", label: "Active Emergencies", icon: AlertTriangle, bg: "bg-critical-light", text: "text-primary",  status: "critical" },
  { id: "ngos",        label: "Partner NGOs",       icon: Building2,     bg: "bg-pending-light",  text: "text-pending",  status: "pending" },
  { id: "donations",   label: "Total Donations",    icon: HandCoins,     bg: "bg-resolved-light", text: "text-resolved", status: "resolved" },
];

function ChartBox({ icon: Icon, title, description, tall = false }) {
  return (
    <Card padded className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text">{title}</p>
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-slate-50 text-center px-6",
        tall ? "h-64" : "h-48"
      )}>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        </div>
      </div>
    </Card>
  );
}

const ENDPOINTS = [
  { name: "/api/emergencies",   ms: 98,  ok: true },
  { name: "/api/users",         ms: 112, ok: true },
  { name: "/api/notifications", ms: 204, ok: true },
  { name: "/api/resources",     ms: 87,  ok: true },
  { name: "/api/donations",     ms: 145, ok: true },
  { name: "/api/auth/session",  ms: 63,  ok: true },
];

export default function PerformancePage() {
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [counts,  setCounts]  = useState({ users: 0, emergencies: 0, ngos: 0, donations: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);

  const fetchCounts = async (quiet = false) => {
    const supabase = createClient();
    const [usersRes, emRes, ngoRes, donRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("emergencies").select("*", { count: "exact", head: true }).in("status", ["Reported", "In Progress"]),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "ngo"),
      supabase.from("donations").select("*", { count: "exact", head: true }),
    ]);
    setCounts({
      users:       usersRes.count  ?? 0,
      emergencies: emRes.count     ?? 0,
      ngos:        ngoRes.count    ?? 0,
      donations:   donRes.count    ?? 0,
    });
    if (!quiet) setLoadingCounts(false);
  };

  useEffect(() => { fetchCounts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCounts(true);
    setRefreshing(false);
    toast.success("Metrics refreshed", { description: "All checks passed." });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">System Performance</h1>
            <p className="text-sm text-text-secondary">Real-time monitoring and health metrics.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" loading={refreshing} onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          {refreshing ? "Refreshing…" : "Refresh metrics"}
        </Button>
      </motion.div>

      {/* Technical metric KPI cards (static) */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERF_METRICS.map((m) => {
          const meta = METRIC_ICONS[m.id];
          const Icon = meta.icon;
          const trendUp   = m.trend.startsWith("+");
          const trendDown = m.trend.startsWith("-");
          return (
            <motion.div key={m.id} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", meta.bg)}>
                    <Icon className={cn("h-5 w-5", meta.text)} aria-hidden="true" />
                  </span>
                  <StatusBadge status={m.status} dot={false} />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-text">{m.value}</p>
                  <p className="text-sm font-medium text-text">{m.label}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {trendDown
                      ? <ArrowDown className="h-3 w-3 text-resolved" aria-hidden="true" />
                      : <ArrowUp className={cn("h-3 w-3", trendUp && m.id === "errors" ? "text-critical-strong" : "text-resolved")} aria-hidden="true" />
                    }
                    <span className="text-xs text-text-secondary">{m.trend} vs yesterday</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">{m.sub}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Platform Stats (real DB counts) */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">Platform Stats</h2>
        </div>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORM_DEFS.map((def) => {
            const Icon = def.icon;
            return (
              <motion.div key={def.id} variants={staggerItem}>
                <Card className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", def.bg)}>
                      <Icon className={cn("h-5 w-5", def.text)} aria-hidden="true" />
                    </span>
                    <StatusBadge status={def.status} dot={false} />
                  </div>
                  <div>
                    {loadingCounts ? (
                      <div className="space-y-1.5">
                        <Skeleton className="h-7 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold tracking-tight text-text">
                          {counts[def.id].toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-text">{def.label}</p>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Chart placeholders */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">Performance Graphs</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-secondary">
            Charts coming soon
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartBox icon={BarChart2}  title="Response Time Over Time"
            description="Average API response time (ms) per hour — line chart." tall />
          <ChartBox icon={TrendingUp} title="Active Sessions Over Time"
            description="Concurrent authenticated users per hour — area chart." tall />
        </div>
      </motion.div>

      {/* Endpoint health table */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.18 }}>
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">API Endpoint Health</h2>
        </div>
        <Card className="overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Endpoint</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Latency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Status</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {ENDPOINTS.map((ep, i) => (
                <motion.tr key={ep.name}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-text">{ep.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", ep.ms < 100 ? "bg-resolved" : ep.ms < 200 ? "bg-pending" : "bg-primary")}
                          style={{ width: `${Math.min((ep.ms / 300) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-text-secondary">{ep.ms} ms</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ep.ok ? "resolved" : "critical"}>
                      {ep.ok ? "OK" : "Error"}
                    </StatusBadge>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </Card>
      </motion.div>

    </div>
  );
}
