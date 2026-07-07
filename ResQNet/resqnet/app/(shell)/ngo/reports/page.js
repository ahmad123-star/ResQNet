"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, PieChart, TrendingUp, Download, FileText,
  CheckCircle2, Users, Package, AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

const SUMMARY_ICONS = {
  total:      { icon: AlertTriangle, bg: "bg-info-light",     text: "text-info",      badge: "info" },
  resolved:   { icon: CheckCircle2,  bg: "bg-resolved-light", text: "text-resolved",  badge: "resolved" },
  volunteers: { icon: Users,         bg: "bg-pending-light",  text: "text-pending",   badge: "pending" },
  resources:  { icon: Package,       bg: "bg-primary-light",  text: "text-primary",   badge: "info" },
};

const SUMMARY_META = [
  { id: "total",      label: "Total Emergencies",  sub: "All time" },
  { id: "resolved",   label: "Resolved",            sub: "Resolution rate" },
  { id: "volunteers", label: "Volunteers Active",   sub: "Ever assigned a task" },
  { id: "resources",  label: "Resources Tracked",   sub: "In your inventory" },
];

/* ── Chart placeholder ───────────────────────────────────────────────────── */
function ChartBox({ icon: Icon, title, description, tall = false }) {
  return (
    <Card padded className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text">{title}</p>
      <div className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-slate-50 text-center px-6",
        tall ? "h-72" : "h-52"
      )}>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        </div>
      </div>
    </Card>
  );
}

/* ── Recent reports list (static placeholder) ────────────────────────────── */
const RECENT_REPORTS = [
  { id: "RPT-006", title: "Weekly Operations Summary",    date: "3 Jun 2026",  type: "Weekly",   status: "resolved" },
  { id: "RPT-005", title: "Flood Response — May 2026",    date: "31 May 2026", type: "Incident", status: "resolved" },
  { id: "RPT-004", title: "Volunteer Performance Report", date: "24 May 2026", type: "Monthly",  status: "info" },
  { id: "RPT-003", title: "Resource Utilisation Report",  date: "17 May 2026", type: "Monthly",  status: "info" },
  { id: "RPT-002", title: "Q1 2026 Operations Report",    date: "1 Apr 2026",  type: "Quarterly",status: "resolved" },
];

export default function ReportsPage() {
  const { user }  = useShell();
  const toast     = useToast();

  const [loading,   setLoading]   = useState(true);
  const [summary,   setSummary]   = useState({ total: null, resolved: null, volunteers: null, resources: null });
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    Promise.all([
      supabase.from("emergencies").select("*", { count: "exact", head: true }),
      supabase.from("emergencies").select("*", { count: "exact", head: true }).eq("status", "Resolved"),
      supabase.from("tasks").select("volunteer_id").not("volunteer_id", "is", null),
      supabase.from("resources").select("*", { count: "exact", head: true }).eq("ngo_id", user.id),
    ]).then(([totalRes, resolvedRes, taskRes, resRes]) => {
      const distinctVols = new Set((taskRes.data ?? []).map((t) => t.volunteer_id)).size;
      setSummary({
        total:      totalRes.count    ?? 0,
        resolved:   resolvedRes.count ?? 0,
        volunteers: distinctVols,
        resources:  resRes.count      ?? 0,
      });
      setLoading(false);
    });
  }, [user?.id]);

  const handleExport = (id, format) => {
    setExporting(id);
    setTimeout(() => {
      setExporting(null);
      toast.success(`Export started — ${format}`, {
        description: `${id} will download shortly.`,
      });
    }, 1400);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading + export all */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Reports</h1>
            <p className="text-sm text-text-secondary">Operational performance and analytics.</p>
          </div>
        </div>
        <Button variant="outline" size="sm"
          onClick={() => handleExport("ALL", "PDF")}
          loading={exporting === "ALL"}>
          <Download className="h-4 w-4" />
          {exporting === "ALL" ? "Preparing…" : "Export all (PDF)"}
        </Button>
      </motion.div>

      {/* Summary stat cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_META.map((s) => {
          const meta = SUMMARY_ICONS[s.id];
          const Icon = meta.icon;
          return (
            <motion.div key={s.id} variants={staggerItem}>
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
                    <p className="text-3xl font-bold tracking-tight text-text">{summary[s.id]}</p>
                  )}
                  <p className="text-sm font-medium text-text">{s.label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {s.id === "resolved" && !loading && summary.total > 0
                      ? `${Math.round((summary.resolved / summary.total) * 100)}% resolution rate`
                      : s.sub}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Chart placeholders */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">Analytics</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-secondary">
            Charts coming soon
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ChartBox icon={BarChart2}  title="Emergencies Over Time"   description="Weekly bar chart of incoming vs resolved requests." tall />
          <ChartBox icon={PieChart}   title="Category Breakdown"      description="Pie chart of emergency types for the selected period." tall />
          <ChartBox icon={TrendingUp} title="Resolution Rate Trend"   description="Line chart showing resolution % week over week." tall />
        </div>
      </motion.div>

      {/* Recent reports list */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.18 }}>
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">Recent Reports</h2>
        </div>
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {RECENT_REPORTS.map((r, i) => (
              <motion.li key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <FileText className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{r.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-text-secondary">{r.date}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-xs font-medium text-text-secondary">{r.type}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={r.status} dot={false} className="hidden sm:inline-flex">
                    {r.status === "resolved" ? "Complete" : "Draft"}
                  </StatusBadge>
                  <Button size="sm" variant="outline"
                    loading={exporting === r.id}
                    onClick={() => handleExport(r.id, "PDF")}>
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {exporting === r.id ? "…" : "Export"}
                    </span>
                  </Button>
                </div>
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>

    </div>
  );
}
