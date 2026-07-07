"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn, timeAgo } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import {
  REQUEST_STATUS_META, SEVERITY_META,
  dbEmergencyStatusToUi, dbSeverityToUi, getCategoryColor,
} from "@/lib/data/ngoData";
import { createClient } from "@/lib/supabase/client";

const FILTERS = [
  { value: "all",        label: "All" },
  { value: "open",       label: "Open" },
  { value: "in_progress",label: "In Progress" },
  { value: "resolved",   label: "Resolved" },
];

/* ── DB row → UI shape ───────────────────────────────────────────────────── */
function transformRow(row) {
  const catName    = row.emergency_categories?.name ?? "Other";
  const activeTask = (row.tasks ?? []).find((t) => t.status !== "Completed");
  return {
    id:               row.id,
    displayId:        row.id.slice(0, 8).toUpperCase(),
    category:         catName,
    categoryColor:    getCategoryColor(catName),
    location:         row.address ?? "Location not specified",
    severity:         dbSeverityToUi(row.severity),
    status:           dbEmergencyStatusToUi(row.status),
    time:             timeAgo(row.created_at),
    reportedBy:       row.victim?.name ?? "Anonymous",
    assignedVolunteer: activeTask?.volunteer?.name ?? null,
  };
}

/* ── Desktop table row ───────────────────────────────────────────────────── */
function RequestRow({ req }) {
  const statusMeta   = REQUEST_STATUS_META[req.status]   ?? REQUEST_STATUS_META.open;
  const severityMeta = SEVERITY_META[req.severity] ?? SEVERITY_META.medium;
  return (
    <motion.tr variants={staggerItem}
      className="border-b border-border last:border-0 transition-colors hover:bg-slate-50/60">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", req.categoryColor)}>
            {req.category}
          </span>
          <span className="text-xs text-text-secondary font-mono">{req.displayId}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-text">{req.location}</td>
      <td className="px-4 py-3.5">
        <StatusBadge status={severityMeta.badge}>{severityMeta.label}</StatusBadge>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={statusMeta.badge}>{statusMeta.label}</StatusBadge>
      </td>
      <td className="px-4 py-3.5 text-xs text-text-secondary whitespace-nowrap">{req.time}</td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/ngo/manage?id=${req.id}`}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary">
            View
          </Link>
          {req.status !== "resolved" && (
            <Link href={`/ngo/assign?id=${req.id}`}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary">
              Assign
            </Link>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

/* ── Mobile card ─────────────────────────────────────────────────────────── */
function RequestCard({ req }) {
  const statusMeta   = REQUEST_STATUS_META[req.status]   ?? REQUEST_STATUS_META.open;
  const severityMeta = SEVERITY_META[req.severity] ?? SEVERITY_META.medium;
  return (
    <motion.div variants={staggerItem}>
      <Card className="overflow-hidden">
        <div className={cn("h-1 w-full", {
          "bg-primary":  req.severity === "high",
          "bg-pending":  req.severity === "medium",
          "bg-resolved": req.severity === "low",
        })} />
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", req.categoryColor)}>
                  {req.category}
                </span>
                <span className="text-xs text-text-secondary font-mono">{req.displayId}</span>
              </div>
              <p className="text-sm text-text">{req.location}</p>
            </div>
            <StatusBadge status={statusMeta.badge} className="shrink-0">{statusMeta.label}</StatusBadge>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={severityMeta.badge}>{severityMeta.label}</StatusBadge>
            <span className="text-xs text-text-secondary">{req.time}</span>
          </div>
          {req.assignedVolunteer && (
            <p className="text-xs text-text-secondary">
              Assigned to <span className="font-medium text-text">{req.assignedVolunteer}</span>
            </p>
          )}
          <div className="flex gap-2 border-t border-border pt-3">
            <Link href={`/ngo/manage?id=${req.id}`}
              className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium text-text transition-colors hover:bg-slate-100">
              View / Update
            </Link>
            {req.status !== "resolved" && (
              <Link href={`/ngo/assign?id=${req.id}`}
                className="flex-1 rounded-lg bg-primary py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-primary-hover">
                Assign Volunteer
              </Link>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ── Skeletons ───────────────────────────────────────────────────────────── */
function RowSkeletons() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-border">
          <td className="px-4 py-3.5"><div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-16" /></div></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-36" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-14 rounded-full" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
          <td className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
          <td className="px-4 py-3.5 text-right"><div className="flex justify-end gap-2"><Skeleton className="h-7 w-14 rounded-lg" /><Skeleton className="h-7 w-16 rounded-lg" /></div></td>
        </tr>
      ))}
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function RequestsPage() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("emergencies")
      .select(`
        id, severity, status, address, created_at,
        emergency_categories(name),
        victim:profiles!victim_id(name),
        tasks(status, volunteer:profiles!volunteer_id(name))
      `)
      .neq("status", "Cancelled")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load requests", { description: error.message });
        } else {
          setRequests((data ?? []).map(transformRow));
        }
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = requests.filter((r) => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = !search || [r.displayId, r.category, r.location]
      .some((f) => f.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Heading */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Emergency Requests</h1>
          <p className="text-sm text-text-secondary">
            {loading ? "Loading…" : `${visible.length} of ${requests.length} requests`}
          </p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.06 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by ID, category, location…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
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
      {(loading || visible.length > 0) && (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
          className="hidden overflow-hidden rounded-xl border border-border md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                {["Category / ID", "Location", "Severity", "Status", "Reported", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {loading ? <RowSkeletons /> : visible.map((r) => <RequestRow key={r.id} req={r} />)}
            </motion.tbody>
          </table>
        </motion.div>
      )}

      {/* Mobile cards */}
      {loading ? (
        <div className="flex flex-col gap-3 md:hidden">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-1 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-4 w-16" /></div>
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full shrink-0" />
                </div>
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <EmptyState
            icon={AlertTriangle}
            title="No requests match this filter"
            description="Try a different status or clear the search."
          />
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible"
          className="flex flex-col gap-3 md:hidden">
          {visible.map((r) => <RequestCard key={r.id} req={r} />)}
        </motion.div>
      )}

    </div>
  );
}
