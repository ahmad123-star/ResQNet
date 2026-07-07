"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, PieChart as PieIcon, TrendingUp,
  Download, FileText, Users, AlertTriangle, HandCoins, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";

const PIE_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const REPORT_ICONS = {
  "total-em":  { icon: AlertTriangle, bg: "bg-critical-light", text: "text-primary" },
  resolved:    { icon: CheckCircle2,  bg: "bg-resolved-light", text: "text-resolved" },
  "users-reg": { icon: Users,         bg: "bg-info-light",     text: "text-info" },
  donations:   { icon: HandCoins,     bg: "bg-pending-light",  text: "text-pending" },
};

function ChartCard({ title, children }) {
  return (
    <Card padded className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-text">{title}</p>
      <div className="h-64">{children}</div>
    </Card>
  );
}

function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const EXPORTABLE_REPORTS = [
  {
    id:    "emergencies",
    title: "Emergency Summary",
    type:  "Live",
    description: "All emergencies with category, severity, status and location.",
  },
  {
    id:    "users",
    title: "User Accounts",
    type:  "Live",
    description: "All registered users with role and account status.",
  },
  {
    id:    "donations",
    title: "Donation Records",
    type:  "Live",
    description: "All donations with type, amount and date.",
  },
];

export default function AdminReportsPage() {
  const toast = useToast();
  const [exporting,    setExporting]    = useState(null);
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [emChart,      setEmChart]      = useState([]);
  const [roleChart,    setRoleChart]    = useState([]);
  const [donationChart,setDonationChart]= useState([]);

  useEffect(() => {
    const supabase = createClient();

    // Summary counts
    Promise.all([
      supabase.from("emergencies").select("id", { count: "exact", head: true }),
      supabase.from("emergencies").select("id", { count: "exact", head: true }).eq("status", "Resolved"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("donations").select("id", { count: "exact", head: true }),
    ]).then(([total, resolved, users, donations]) => {
      setStats({
        totalEm:   total.count     ?? 0,
        resolved:  resolved.count  ?? 0,
        users:     users.count     ?? 0,
        donations: donations.count ?? 0,
      });
      setStatsLoading(false);
    });

    // Emergencies over last 6 weeks
    supabase.from("emergencies").select("created_at, status").then(({ data }) => {
      const weeks = {};
      const now = Date.now();
      (data ?? []).forEach((e) => {
        const age = Math.floor((now - new Date(e.created_at)) / 604800000); // ms in a week
        if (age > 5) return;
        const label = `W-${5 - age}`;
        if (!weeks[label]) weeks[label] = { week: label, Reported: 0, Resolved: 0 };
        weeks[label].Reported++;
        if (e.status === "Resolved") weeks[label].Resolved++;
      });
      setEmChart(Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)));
    });

    // Users by role
    supabase.from("profiles").select("role").then(({ data }) => {
      const counts = {};
      (data ?? []).forEach((p) => { counts[p.role] = (counts[p.role] ?? 0) + 1; });
      setRoleChart(Object.entries(counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), value,
      })));
    });

    // Donations by month (last 6 months)
    supabase.from("donations").select("created_at, donation_type, amount").then(({ data }) => {
      const months = {};
      (data ?? []).forEach((d) => {
        const date  = new Date(d.created_at);
        const label = date.toLocaleString("default", { month: "short" });
        if (!months[label]) months[label] = { month: label, Monetary: 0, "In-Kind": 0 };
        if (d.donation_type === "Funds") months[label].Monetary++;
        else months[label]["In-Kind"]++;
      });
      setDonationChart(Object.values(months).slice(-6));
    });
  }, []);

  const resolutionRate = stats && stats.totalEm > 0
    ? Math.round((stats.resolved / stats.totalEm) * 100)
    : 0;

  const SUMMARY = stats ? [
    { id: "total-em",  label: "Total Emergencies",  value: stats.totalEm.toLocaleString(),  sub: "Since launch",                         status: "info" },
    { id: "resolved",  label: "Resolved",           value: stats.resolved.toLocaleString(), sub: `${resolutionRate}% resolution rate`,    status: "resolved" },
    { id: "users-reg", label: "Users Registered",   value: stats.users.toLocaleString(),    sub: "All roles",                            status: "info" },
    { id: "donations", label: "Donations Received", value: stats.donations.toLocaleString(),sub: "Total records",                        status: "resolved" },
  ] : [];

  const handleExport = async (id) => {
    setExporting(id);
    const supabase = createClient();
    try {
      if (id === "emergencies") {
        const { data } = await supabase
          .from("emergencies")
          .select("id, severity, status, address, created_at, emergency_categories(name)")
          .order("created_at", { ascending: false });
        const rows = [["ID", "Category", "Severity", "Status", "Address", "Reported At"]];
        (data ?? []).forEach((e) => rows.push([
          e.id.slice(0, 8), e.emergency_categories?.name ?? "Other",
          e.severity, e.status, e.address, new Date(e.created_at).toLocaleString(),
        ]));
        downloadCsv("emergencies.csv", rows);
      } else if (id === "users") {
        const { data } = await supabase
          .from("profiles")
          .select("name, email, role, blocked, created_at")
          .order("created_at", { ascending: false });
        const rows = [["Name", "Email", "Role", "Status", "Joined"]];
        (data ?? []).forEach((u) => rows.push([
          u.name, u.email, u.role, u.blocked ? "Blocked" : "Active",
          new Date(u.created_at).toLocaleString(),
        ]));
        downloadCsv("users.csv", rows);
      } else if (id === "donations") {
        const { data } = await supabase
          .from("donations")
          .select("donation_type, amount, item_name, quantity, message, created_at")
          .order("created_at", { ascending: false });
        const rows = [["Type", "Amount (₨)", "Item", "Quantity", "Message", "Date"]];
        (data ?? []).forEach((d) => rows.push([
          d.donation_type, d.amount ?? "", d.item_name ?? "", d.quantity ?? "",
          d.message ?? "", new Date(d.created_at).toLocaleString(),
        ]));
        downloadCsv("donations.csv", rows);
      } else if (id === "ALL") {
        await handleExport("emergencies");
        await handleExport("users");
        await handleExport("donations");
        setExporting(null);
        toast.success("All reports exported", { description: "3 CSV files downloaded." });
        return;
      }
      toast.success("Export ready", { description: `${id}.csv downloaded.` });
    } catch (err) {
      toast.error("Export failed", { description: err.message });
    }
    setExporting(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-text-secondary" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Admin Reports</h1>
            <p className="text-sm text-text-secondary">Platform-wide analytics and exports.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" loading={exporting === "ALL"} onClick={() => handleExport("ALL")}>
          <Download className="h-4 w-4" />
          {exporting === "ALL" ? "Preparing…" : "Export all (CSV)"}
        </Button>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          [0,1,2,3].map((i) => (
            <motion.div key={i} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </Card>
            </motion.div>
          ))
        ) : SUMMARY.map((s) => {
          const meta = REPORT_ICONS[s.id];
          const Icon = meta.icon;
          return (
            <motion.div key={s.id} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", meta.bg)}>
                    <Icon className={cn("h-5 w-5", meta.text)} aria-hidden="true" />
                  </span>
                  <StatusBadge status={s.status} dot={false} />
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-text">{s.value}</p>
                  <p className="text-sm font-medium text-text">{s.label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{s.sub}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">Analytics</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <ChartCard title="Emergencies — Last 6 Weeks">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Reported" fill="#ef4444" radius={[4,4,0,0]} />
                <Bar dataKey="Resolved" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Users by Role">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleChart} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  } labelLine={false}>
                  {roleChart.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Donations — by Month">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donationChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Monetary" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="In-Kind"  stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </motion.div>

      {/* Exportable reports */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.18 }}>
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text">Export Reports</h2>
        </div>
        <Card className="overflow-hidden">
          <ul className="divide-y divide-border">
            {EXPORTABLE_REPORTS.map((r, i) => (
              <motion.li key={r.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <FileText className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{r.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-text-secondary">{r.description}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-xs font-medium text-resolved-strong">{r.type}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" loading={exporting === r.id}
                  onClick={() => handleExport(r.id)}>
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{exporting === r.id ? "…" : "CSV"}</span>
                </Button>
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>

    </div>
  );
}
