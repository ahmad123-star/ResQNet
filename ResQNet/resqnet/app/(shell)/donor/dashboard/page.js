"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, TrendingUp, Coins, ArrowRight, Package,
  CheckCircle2, Clock, AlertCircle, RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { DONATION_STATUS_META } from "@/lib/data/donorData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

/* ── Status icon for history rows ────────────────────────────────────────── */
const ROW_ICON = {
  completed:  { icon: CheckCircle2, cls: "text-resolved" },
  processing: { icon: RefreshCw,    cls: "text-info" },
  pending:    { icon: Clock,        cls: "text-pending" },
  failed:     { icon: AlertCircle,  cls: "text-primary" },
};

function transformDonation(row) {
  const type   = row.type === "Items" ? "items" : "funds";
  const status = (row.status ?? "pending").toLowerCase();

  let target = "General Relief Fund";
  if (row.target_ngo?.name) {
    target = row.target_ngo.name;
  } else if (row.target_emergency) {
    const cat  = row.target_emergency.emergency_categories?.name ?? "Emergency";
    const addr = row.target_emergency.address ?? "";
    target = addr ? `${cat} — ${addr}` : cat;
  }

  return {
    id:        row.id,
    displayId: row.id.slice(0, 8).toUpperCase(),
    type,
    amount:    type === "funds" && row.amount != null
      ? `₨ ${Number(row.amount).toLocaleString("en-PK")}`
      : null,
    item:      type === "items" && row.item
      ? `${row.quantity ?? "?"} × ${row.item}`
      : null,
    target,
    status:    ["completed", "pending", "failed"].includes(status) ? status : "processing",
    date:      row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "—",
    rawAmount: row.amount ?? 0,
  };
}

function StatSkeleton() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export default function DonorDashboard() {
  const { user } = useShell();

  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase
      .from("donations")
      .select(`
        id, type, amount, item, quantity, status, created_at,
        target_ngo:profiles!target_ngo_id(name),
        target_emergency:emergencies!target_emergency_id(id, address, emergency_categories(name))
      `)
      .eq("donor_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setDonations((data ?? []).map(transformDonation));
        setLoading(false);
      });
  }, [user?.id]);

  /* Computed stats */
  const totalFunds = donations
    .filter((d) => d.type === "funds")
    .reduce((sum, d) => sum + d.rawAmount, 0);
  const activeCount    = donations.filter((d) => d.status === "pending" || d.status === "processing").length;
  const completedCount = donations.filter((d) => d.status === "completed").length;
  const recent         = donations.slice(0, 5);
  const active         = donations.filter((d) => d.status === "pending" || d.status === "processing");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const STAT_DEFS = [
    {
      id: "total",
      label:  "Funds Donated",
      icon:   Coins,
      bg:     "bg-resolved-light",
      iconCls: "text-resolved",
      status: "resolved",
      value:  loading ? null : `₨ ${totalFunds.toLocaleString("en-PK")}`,
      sub:    loading ? null : `Across ${donations.length} contribution${donations.length !== 1 ? "s" : ""}`,
    },
    {
      id: "active",
      label:  "Active",
      icon:   TrendingUp,
      bg:     "bg-pending-light",
      iconCls: "text-pending",
      status: "pending",
      value:  loading ? null : String(activeCount),
      sub:    loading ? null : "Pending or processing",
    },
    {
      id: "completed",
      label:  "Completed",
      icon:   CheckCircle2,
      bg:     "bg-info-light",
      iconCls: "text-info",
      status: "info",
      value:  loading ? null : String(completedCount),
      sub:    loading ? null : "Successfully deployed",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Donor Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}.` : "Your contribution history and impact summary."}
          </p>
        </div>
        <p className="text-xs text-text-secondary">{today}</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-3">
        {STAT_DEFS.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.id} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.bg)}>
                    <Icon className={cn("h-5 w-5", stat.iconCls)} aria-hidden="true" />
                  </span>
                  <StatusBadge status={stat.status} dot={false} />
                </div>
                <div>
                  {loading ? (
                    <StatSkeleton />
                  ) : (
                    <>
                      <p className="text-3xl font-bold tracking-tight text-text">{stat.value}</p>
                      <p className="text-sm font-medium text-text">{stat.label}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">{stat.sub}</p>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Donate CTA banner */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <div className="relative overflow-hidden rounded-2xl bg-primary p-6 sm:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Heart className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  Make a difference today
                </h2>
                <p className="mt-0.5 text-sm text-white/80">
                  Every contribution — funds or items — goes directly to verified emergencies.
                </p>
              </div>
            </div>
            <Link
              href="/donor/donate"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary shadow transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Donate now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Active contributions alert */}
      {!loading && active.length > 0 && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.14 }}>
          <div className="flex items-start gap-3 rounded-xl border border-pending/30 bg-pending-light px-4 py-3">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-pending" aria-hidden="true" />
            <p className="text-sm text-text">
              <span className="font-semibold">
                {active.length} contribution{active.length > 1 ? "s" : ""}
              </span>{" "}
              currently being processed. We&apos;ll notify you when they&apos;re confirmed.
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent donation history */}
      <motion.section variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.16 }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">Recent Donations</h2>
          {!loading && donations.length > 0 && (
            <Link href="/donor/my-donations"
              className="text-xs font-medium text-primary hover:underline">
              View all {donations.length}
            </Link>
          )}
        </div>

        <Card>
          {loading ? (
            <ul className="divide-y divide-border">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-4 px-5 py-4">
                  <Skeleton className="mt-0.5 h-9 w-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full shrink-0" />
                </li>
              ))}
            </ul>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Heart className="h-6 w-6 text-slate-400" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text">No donations yet</p>
                <p className="text-xs text-text-secondary">
                  Use the{" "}
                  <Link href="/donor/donate" className="font-medium text-primary hover:underline">
                    Donate
                  </Link>{" "}
                  page to make your first contribution.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((d, i) => {
                const statusMeta = DONATION_STATUS_META[d.status] ?? DONATION_STATUS_META.pending;
                const rowIcon    = ROW_ICON[d.status];
                const RowIcon    = rowIcon?.icon;
                return (
                  <motion.li
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.22 }}
                    className="flex items-start gap-4 px-5 py-4"
                  >
                    <span className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      d.type === "funds" ? "bg-resolved-light" : "bg-info-light"
                    )}>
                      {d.type === "funds"
                        ? <Coins   className="h-4 w-4 text-resolved" aria-hidden="true" />
                        : <Package className="h-4 w-4 text-info"     aria-hidden="true" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-text">
                          {d.amount ?? d.item}
                        </p>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          d.type === "funds"
                            ? "bg-resolved-light text-resolved-strong"
                            : "bg-info-light text-info-strong"
                        )}>
                          {d.type === "funds" ? "Funds" : "Items"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary truncate">→ {d.target}</p>
                      <p className="mt-0.5 text-[11px] text-text-secondary">
                        {d.date} · {d.displayId}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <StatusBadge status={statusMeta.badge}>{statusMeta.label}</StatusBadge>
                      {RowIcon && <RowIcon className={cn("h-3.5 w-3.5", rowIcon.cls)} aria-hidden="true" />}
                    </div>
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
