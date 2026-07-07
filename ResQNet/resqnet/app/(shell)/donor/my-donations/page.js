"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HandCoins, Search, Filter, Coins, Package,
  CheckCircle2, RefreshCw, Clock, AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { DONATION_STATUS_META } from "@/lib/data/donorData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

const FILTERS = [
  { value: "all",       label: "All" },
  { value: "funds",     label: "Monetary" },
  { value: "items",     label: "In-Kind" },
  { value: "completed", label: "Completed" },
  { value: "pending",   label: "Pending" },
  { value: "failed",    label: "Failed" },
];

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

  const normStatus = ["completed", "pending", "failed"].includes(status)
    ? status
    : "processing";

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
    status:    normStatus,
    date:      row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        })
      : "—",
    rawAmount: row.amount ?? 0,
  };
}

function TableSkeletons() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-border">
          <td className="px-4 py-3.5"><Skeleton className="h-3 w-20" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-40" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-3 w-20" /></td>
        </tr>
      ))}
    </>
  );
}

export default function MyDonationsPage() {
  const { user } = useShell();
  const toast    = useToast();

  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

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
        if (error) {
          toast.error("Failed to load donations", { description: error.message });
        } else {
          setAll((data ?? []).map(transformDonation));
        }
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const visible = all.filter((d) => {
    const matchFilter =
      filter === "all" ||
      d.type === filter ||
      d.status === filter;
    const matchSearch =
      !search ||
      [d.displayId, d.target, d.amount ?? "", d.item ?? ""]
        .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-center gap-2">
        <HandCoins className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">My Donations</h1>
          <p className="text-sm text-text-secondary">
            {loading ? "Loading…" : `${visible.length} of ${all.length} records`}
          </p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.06 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search ID, target, amount…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
          {FILTERS.map((f) => (
            <button key={f.value} type="button" onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-primary",
                filter === f.value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-text-secondary hover:bg-slate-200"
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Desktop table */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
        className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              {["ID", "Type", "Amount / Item", "Target", "Status", "Date"].map((h) => (
                <th key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {loading ? (
              <TableSkeletons />
            ) : visible.map((d) => {
              const sm = DONATION_STATUS_META[d.status] ?? DONATION_STATUS_META.pending;
              return (
                <motion.tr key={d.id} variants={staggerItem}
                  className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">{d.displayId}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      d.type === "funds"
                        ? "bg-resolved-light text-resolved-strong"
                        : "bg-info-light text-info-strong"
                    )}>
                      {d.type === "funds"
                        ? <Coins className="h-3 w-3" aria-hidden="true" />
                        : <Package className="h-3 w-3" aria-hidden="true" />}
                      {d.type === "funds" ? "Monetary" : "In-Kind"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-text">
                    {d.amount ?? d.item}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary max-w-xs truncate">
                    {d.target}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={sm.badge}>{sm.label}</StatusBadge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-text-secondary whitespace-nowrap">{d.date}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
        {!loading && visible.length === 0 && (
          <div className="py-12 text-center text-sm text-text-secondary">
            {all.length === 0
              ? "You haven't made any donations yet."
              : "No donations match this filter."}
          </div>
        )}
      </motion.div>

      {/* Mobile cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex flex-col gap-3 md:hidden">
        {loading ? (
          [0, 1, 2].map((i) => (
            <Card key={i} padded className="space-y-3">
              <div className="flex justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-28" />
            </Card>
          ))
        ) : visible.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={all.length === 0 ? "No donations yet" : "No donations match this filter"}
            description={
              all.length === 0
                ? "Use the Donate page to make your first contribution."
                : "Try a different filter."
            }
          />
        ) : (
          visible.map((d) => {
            const sm       = DONATION_STATUS_META[d.status] ?? DONATION_STATUS_META.pending;
            const rowIcon  = ROW_ICON[d.status];
            const RowIcon  = rowIcon?.icon;
            return (
              <motion.div key={d.id} variants={staggerItem}>
                <Card padded className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        d.type === "funds" ? "bg-resolved-light" : "bg-info-light"
                      )}>
                        {d.type === "funds"
                          ? <Coins className="h-4 w-4 text-resolved" aria-hidden="true" />
                          : <Package className="h-4 w-4 text-info" aria-hidden="true" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text">{d.amount ?? d.item}</p>
                        <p className="text-[11px] font-mono text-text-secondary">{d.displayId}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={sm.badge}>{sm.label}</StatusBadge>
                      {RowIcon && <RowIcon className={cn("h-3.5 w-3.5", rowIcon.cls)} aria-hidden="true" />}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary truncate">→ {d.target}</p>
                  <p className="text-[11px] text-text-secondary">{d.date}</p>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

    </div>
  );
}
