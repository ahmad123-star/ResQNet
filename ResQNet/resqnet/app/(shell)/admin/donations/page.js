"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HandCoins, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { DONATION_STATUS, dbDonationTypeToUi, dbDonationStatusToUi } from "@/lib/data/adminData";
import { createClient } from "@/lib/supabase/client";

const FILTERS = [
  { value: "all",        label: "All" },
  { value: "monetary",   label: "Monetary" },
  { value: "in-kind",    label: "In-Kind" },
  { value: "completed",  label: "Completed" },
  { value: "pending",    label: "Pending" },
  { value: "failed",     label: "Failed" },
];

function transformDonation(row) {
  const type   = dbDonationTypeToUi(row.type);
  const status = dbDonationStatusToUi(row.status);
  return {
    id:          row.id,
    displayId:   row.id.slice(0, 8).toUpperCase(),
    donor:       row.donor?.name ?? "Anonymous",
    type,
    amount:      type === "monetary" && row.amount != null
      ? `₨ ${Number(row.amount).toLocaleString("en-PK")}`
      : null,
    item:        type === "in-kind" ? (row.item ?? "—") : null,
    status,
    date:        row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "—",
  };
}

function TableSkeletons() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-border">
          <td className="px-4 py-3.5"><Skeleton className="h-3 w-24 font-mono" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-3 w-20" /></td>
        </tr>
      ))}
    </>
  );
}

export default function DonationsPage() {
  const toast = useToast();

  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("donations")
      .select("id, type, amount, item, status, created_at, donor:profiles!donor_id(name)")
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
  }, []);

  const visible = all.filter((d) => {
    const matchFilter = filter === "all" || d.type === filter || d.status === filter;
    const matchSearch = !search ||
      [d.displayId, d.donor, d.type, d.amount ?? "", d.item ?? ""]
        .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-center gap-2">
        <HandCoins className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Donations</h1>
          <p className="text-sm text-text-secondary">
            {loading ? "Loading…" : `${visible.length} of ${all.length} records`}
          </p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.06 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input placeholder="Search donor, ID, type, amount…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {["ID", "Donor", "Type", "Amount / Item", "Status", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {loading ? (
              <TableSkeletons />
            ) : visible.map((d) => {
              const sm = DONATION_STATUS[d.status] ?? DONATION_STATUS.pending;
              return (
                <motion.tr key={d.id} variants={staggerItem}
                  className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">{d.displayId}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-text">{d.donor}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      d.type === "monetary"
                        ? "bg-resolved-light text-resolved-strong"
                        : "bg-info-light text-info-strong"
                    )}>
                      {d.type === "monetary" ? "Monetary" : "In-Kind"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text">{d.amount || d.item}</td>
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
            No donations match this filter.
          </div>
        )}
      </motion.div>

      {/* Mobile cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex flex-col gap-3 md:hidden">
        {loading ? (
          [0, 1, 2].map((i) => (
            <Card key={i} padded className="space-y-2">
              <div className="flex justify-between gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-40" />
            </Card>
          ))
        ) : visible.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="No donations match this filter"
            description="Try a different type or status filter."
          />
        ) : (
          visible.map((d) => {
            const sm = DONATION_STATUS[d.status] ?? DONATION_STATUS.pending;
            return (
              <motion.div key={d.id} variants={staggerItem}>
                <Card padded className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-text">{d.donor}</p>
                      <p className="text-xs font-mono text-text-secondary">{d.displayId}</p>
                    </div>
                    <StatusBadge status={sm.badge}>{sm.label}</StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 font-semibold",
                      d.type === "monetary" ? "bg-resolved-light text-resolved-strong" : "bg-info-light text-info-strong"
                    )}>
                      {d.type === "monetary" ? "Monetary" : "In-Kind"}
                    </span>
                    <span className="font-medium text-text">{d.amount || d.item}</span>
                    <span>{d.date}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
