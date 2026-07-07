"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle2, ChevronDown, ChevronUp, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn, timeAgo } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import {
  REQUEST_STATUS_META, SEVERITY_META,
  dbEmergencyStatusToUi, dbSeverityToUi, getCategoryColor,
} from "@/lib/data/ngoData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";
import { notifyMany } from "@/lib/notifications";
import { createSystemLog } from "@/lib/systemLog";
import { emailNotify } from "@/lib/emailNotify";

/* ── Emergency selector ──────────────────────────────────────────────────── */
function EmergencySelector({ selected, onSelect, requests, loading }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          selected ? "border-primary/40 bg-primary-light" : "border-border bg-surface hover:bg-slate-50"
        )}
      >
        {loading ? (
          <Skeleton className="h-4 w-48" />
        ) : selected ? (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", selected.categoryColor)}>
                {selected.category}
              </span>
              <span className="text-xs font-mono text-text-secondary">{selected.displayId}</span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-text truncate">{selected.location}</p>
          </div>
        ) : (
          <span className="text-sm text-text-secondary">Select an emergency request…</span>
        )}
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-text-secondary" /> : <ChevronDown className="h-4 w-4 shrink-0 text-text-secondary" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg"
          >
            {requests.length === 0 ? (
              <p className="px-4 py-3 text-sm text-text-secondary">No open emergencies.</p>
            ) : requests.map((req) => (
              <button key={req.id} type="button"
                onClick={() => { onSelect(req); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                  "border-b border-border last:border-0",
                  selected?.id === req.id && "bg-primary-light"
                )}>
                <span className={cn("inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", req.categoryColor)}>
                  {req.category}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text">{req.location}</p>
                  <p className="text-xs text-text-secondary">{req.displayId} · {req.time}</p>
                </div>
                <StatusBadge status={SEVERITY_META[req.severity]?.badge ?? "info"} className="shrink-0">
                  {SEVERITY_META[req.severity]?.label ?? req.severity}
                </StatusBadge>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Volunteer card ──────────────────────────────────────────────────────── */
function VolunteerCard({ vol, selected, onToggle }) {
  return (
    <motion.button
      variants={staggerItem}
      type="button"
      onClick={() => onToggle(vol.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        !vol.available && "opacity-50 cursor-not-allowed",
        selected && vol.available
          ? "border-primary/50 bg-primary-light ring-2 ring-primary/30"
          : "border-border bg-surface hover:bg-slate-50"
      )}
      disabled={!vol.available}
    >
      <span className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        selected && vol.available ? "bg-primary text-white" : "bg-slate-100 text-text-secondary"
      )}>
        {vol.name.split(" ").map((n) => n[0]).join("")}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text">{vol.name}</p>
          {!vol.available && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-text-secondary">
              Unavailable
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-text-secondary">{vol.taskCount} active task{vol.taskCount !== 1 ? "s" : ""}</p>
      </div>

      {selected && vol.available && (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      )}
    </motion.button>
  );
}

/* ── Inner component (uses useSearchParams) ──────────────────────────────── */
function AssignInner() {
  const params      = useSearchParams();
  const preselectId = params.get("id");
  const { user }    = useShell();
  const toast       = useToast();

  const [requests,    setRequests]    = useState([]);
  const [volunteers,  setVols]        = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedVols, setSelectedVols] = useState(new Set());
  const [saving,       setSaving]      = useState(false);
  const [done,         setDone]        = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase
        .from("emergencies")
        .select(`id, severity, status, address, created_at, emergency_categories(name)`)
        .in("status", ["Reported", "In Progress"])
        .order("created_at", { ascending: false }),

      supabase
        .from("profiles")
        .select("id, name, availability_status")
        .eq("role", "volunteer"),

      supabase
        .from("tasks")
        .select("volunteer_id")
        .in("status", ["Accepted", "In Progress"]),
    ]).then(([emRes, volRes, taskRes]) => {
      const taskCountMap = {};
      (taskRes.data ?? []).forEach((t) => {
        taskCountMap[t.volunteer_id] = (taskCountMap[t.volunteer_id] ?? 0) + 1;
      });

      const reqs = (emRes.data ?? []).map((row) => {
        const catName = row.emergency_categories?.name ?? "Other";
        return {
          id:            row.id,
          displayId:     row.id.slice(0, 8).toUpperCase(),
          category:      catName,
          categoryColor: getCategoryColor(catName),
          location:      row.address ?? "Location not specified",
          severity:      dbSeverityToUi(row.severity),
          status:        dbEmergencyStatusToUi(row.status),
          time:          timeAgo(row.created_at),
        };
      });

      const vols = (volRes.data ?? []).map((p) => ({
        id:        p.id,
        name:      p.name,
        available: p.availability_status === "available",
        taskCount: taskCountMap[p.id] ?? 0,
      }));

      setRequests(reqs);
      setVols(vols);

      if (preselectId) {
        const pre = reqs.find((r) => r.id === preselectId);
        if (pre) setSelectedReq(pre);
      }

      setLoadingData(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggleVol = (id) => {
    const vol = volunteers.find((v) => v.id === id);
    if (!vol?.available) return;
    setSelectedVols((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selectedReq || selectedVols.size === 0) return;
    setSaving(true);

    const supabase = createClient();
    const inserts  = [...selectedVols].map((volId) => ({
      emergency_id: selectedReq.id,
      volunteer_id: volId,
      status:       "Accepted",
    }));

    const { error: taskErr } = await supabase.from("tasks").insert(inserts);
    if (taskErr) {
      toast.error("Assignment failed", { description: taskErr.message });
      setSaving(false);
      return;
    }

    await supabase
      .from("emergencies")
      .update({ status: "In Progress" })
      .eq("id", selectedReq.id)
      .eq("status", "Reported");

    createSystemLog(user?.id, `${selectedVols.size} volunteer(s) assigned to emergency ${selectedReq.displayId}.`, "info");

    /* Notify every assigned volunteer */
    const assignMsg = `You've been assigned to emergency #${selectedReq.displayId} (${selectedReq.category} at ${selectedReq.location}). Please log in to ResQNet to respond.`;
    await notifyMany([...selectedVols], "task", "You've been assigned", assignMsg);
    emailNotify([...selectedVols], `You've been assigned to an emergency — ResQNet`, assignMsg);

    setAssignedCount(selectedVols.size);
    setSaving(false);
    setDone(true);
    toast.success("Volunteers assigned", {
      description: `${selectedVols.size} volunteer${selectedVols.size > 1 ? "s" : ""} assigned to ${selectedReq.displayId}.`,
    });
  };

  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <Card padded className="flex flex-col items-center gap-4 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-resolved-light">
              <UserCheck className="h-8 w-8 text-resolved" />
            </motion.span>
            <div>
              <h2 className="text-xl font-bold text-text">Assignment complete</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {assignedCount} volunteer{assignedCount > 1 ? "s" : ""} assigned to{" "}
                <span className="font-medium text-text">{selectedReq?.displayId}</span>.
              </p>
            </div>
            <Button variant="outline" fullWidth onClick={() => { setDone(false); setSelectedReq(null); setSelectedVols(new Set()); }}>
              Assign another
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center gap-2">
        <Users className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Assign Volunteers</h1>
          <p className="text-sm text-text-secondary">Select an emergency, then choose volunteers.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1: Pick emergency */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.06 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">1</span>
                <CardTitle>Select emergency</CardTitle>
              </div>
              <CardDescription>Open and in-progress requests only.</CardDescription>
            </CardHeader>
            <CardBody>
              <EmergencySelector
                selected={selectedReq}
                onSelect={setSelectedReq}
                requests={requests}
                loading={loadingData}
              />
              {selectedReq && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <StatusBadge status={REQUEST_STATUS_META[selectedReq.status]?.badge ?? "info"}>
                    {REQUEST_STATUS_META[selectedReq.status]?.label ?? selectedReq.status}
                  </StatusBadge>
                  <StatusBadge status={SEVERITY_META[selectedReq.severity]?.badge ?? "info"}>
                    {SEVERITY_META[selectedReq.severity]?.label ?? selectedReq.severity}
                  </StatusBadge>
                  <span>{selectedReq.time}</span>
                </motion.div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Step 2: Pick volunteers */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">2</span>
                  <CardTitle>Choose volunteers</CardTitle>
                </div>
                {selectedVols.size > 0 && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                    {selectedVols.size} selected
                  </span>
                )}
              </div>
              <CardDescription>Greyed-out volunteers are currently unavailable.</CardDescription>
            </CardHeader>
            <CardBody>
              {loadingData ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-4">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : volunteers.length === 0 ? (
                <p className="py-4 text-center text-sm text-text-secondary">No volunteers registered yet.</p>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                  {volunteers.map((vol) => (
                    <VolunteerCard key={vol.id} vol={vol}
                      selected={selectedVols.has(vol.id)} onToggle={toggleVol} />
                  ))}
                </motion.div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Assign CTA */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.16 }}>
        <Card className={cn(
          "border transition-colors",
          selectedReq && selectedVols.size > 0 ? "border-primary/30 bg-primary-light" : "border-border"
        )}>
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-text">
                {!selectedReq
                  ? "Select an emergency first"
                  : selectedVols.size === 0
                  ? "Now select one or more volunteers"
                  : `Assign ${selectedVols.size} volunteer${selectedVols.size > 1 ? "s" : ""} to ${selectedReq.displayId}`}
              </p>
              <p className="text-xs text-text-secondary">
                Selected volunteers will be notified immediately.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              loading={saving}
              disabled={!selectedReq || selectedVols.size === 0}
              onClick={handleAssign}
              className="shrink-0"
            >
              <UserCheck className="h-5 w-5" />
              {saving ? "Assigning…" : "Confirm assignment"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AssignPage() {
  return <Suspense><AssignInner /></Suspense>;
}
