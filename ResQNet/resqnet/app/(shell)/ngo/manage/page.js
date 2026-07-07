"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, CheckCircle2, MapPin, Clock, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn, timeAgo } from "@/lib/utils";
import { fadeInUp } from "@/lib/motion";
import {
  SEVERITY_META,
  MANAGE_STATUS_OPTIONS, MANAGE_STATUS_META,
  dbStatusToManage, manageStatusToDb, dbSeverityToUi, getCategoryColor,
} from "@/lib/data/ngoData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";
import { createNotification } from "@/lib/notifications";
import { createSystemLog } from "@/lib/systemLog";

/* ── Status step tracker ─────────────────────────────────────────────────── */
function StatusTrack({ current }) {
  const steps = ["reported", "in_progress", "resolved"];
  const idx   = steps.indexOf(current);
  return (
    <ol className="flex items-center gap-0">
      {steps.map((s, i) => {
        const meta    = MANAGE_STATUS_META[s];
        const isDone  = i <= idx;
        const isCurr  = i === idx;
        const isLast  = i === steps.length - 1;
        return (
          <li key={s} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                isDone
                  ? isCurr ? "border-primary bg-primary text-white" : "border-resolved bg-resolved text-white"
                  : "border-border bg-surface text-text-secondary"
              )}>
                {isDone && !isCurr
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <span className="text-[10px] font-bold">{i + 1}</span>
                }
              </span>
              <p className={cn("text-[11px] font-semibold whitespace-nowrap",
                isCurr ? "text-primary" : isDone ? "text-resolved-strong" : "text-text-secondary")}>
                {meta.label}
              </p>
            </div>
            {!isLast && (
              <div className={cn("mx-1 h-0.5 flex-1 rounded", i < idx ? "bg-resolved/60" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Request picker (left panel) ─────────────────────────────────────────── */
function RequestPicker({ selected, onSelect, requests, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3">
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return <p className="py-4 text-center text-sm text-text-secondary">No emergencies found.</p>;
  }

  return (
    <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
      {requests.map((req) => (
        <button key={req.id} type="button" onClick={() => onSelect(req)}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
            "focus-visible:outline-2 focus-visible:outline-primary",
            selected?.id === req.id
              ? "border-primary/50 bg-primary-light"
              : "border-border bg-surface hover:bg-slate-50"
          )}>
          <span className={cn("mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", req.categoryColor)}>
            {req.category}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{req.location}</p>
            <p className="text-xs text-text-secondary">{req.displayId} · {req.time}</p>
          </div>
          <StatusBadge status={SEVERITY_META[req.severity]?.badge ?? "info"} className="shrink-0">
            {SEVERITY_META[req.severity]?.label ?? req.severity}
          </StatusBadge>
        </button>
      ))}
    </div>
  );
}

/* ── Inner (uses useSearchParams) ────────────────────────────────────────── */
function ManageInner() {
  const params   = useSearchParams();
  const preId    = params.get("id");
  const toast    = useToast();
  const { user } = useShell();

  const [requests,    setRequests]    = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [req,    setReq]    = useState(null);
  const [status, setStatus] = useState("reported");
  const [notes,  setNotes]  = useState("");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("emergencies")
      .select(`
        id, victim_id, severity, status, address, created_at,
        emergency_categories(name),
        victim:profiles!victim_id(name)
      `)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load emergencies", { description: error.message });
          setLoadingData(false);
          return;
        }
        const rows = (data ?? []).map((row) => {
          const catName = row.emergency_categories?.name ?? "Other";
          return {
            id:            row.id,
            victimId:      row.victim_id ?? null,
            displayId:     row.id.slice(0, 8).toUpperCase(),
            category:      catName,
            categoryColor: getCategoryColor(catName),
            location:      row.address ?? "Location not specified",
            severity:      dbSeverityToUi(row.severity),
            manageStatus:  dbStatusToManage(row.status),
            time:          timeAgo(row.created_at),
            reportedBy:    row.victim?.name ?? "Anonymous",
          };
        });
        setRequests(rows);

        if (preId) {
          const pre = rows.find((r) => r.id === preId);
          if (pre) {
            setReq(pre);
            setStatus(pre.manageStatus);
          }
        }

        setLoadingData(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectReq = (r) => {
    setReq(r);
    setStatus(r.manageStatus);
    setNotes("");
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("emergencies")
      .update({ status: manageStatusToDb(status) })
      .eq("id", req.id);

    setSaving(false);
    if (error) {
      toast.error("Update failed", { description: error.message });
    } else {
      setRequests((prev) =>
        prev.map((r) => r.id === req.id ? { ...r, manageStatus: status } : r)
      );
      setReq((prev) => ({ ...prev, manageStatus: status }));
      setSaved(true);
      toast.success("Status updated", {
        description: `Emergency is now ${MANAGE_STATUS_META[status].label}.`,
      });

      createSystemLog(user?.id, `Emergency ${req.displayId} status changed to ${MANAGE_STATUS_META[status].label}.`, "info");

      /* Notify the victim when NGO updates the emergency status */
      if (req.victimId) {
        const notifMap = {
          in_progress: { type: "task",     title: "Emergency In Progress", message: `Your emergency at ${req.location} is now being handled by our team.` },
          resolved:    { type: "resolved", title: "Emergency Resolved",    message: `Your emergency at ${req.location} has been marked as resolved.` },
          reported:    { type: "system",   title: "Emergency Status Updated", message: `Your emergency at ${req.location} has been updated.` },
        };
        const notif = notifMap[status];
        if (notif) await createNotification(req.victimId, notif.type, notif.title, notif.message);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Manage Emergency</h1>
          <p className="text-sm text-text-secondary">Update status and add operational notes.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: request list */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.06 }}
          className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select a request</CardTitle>
              <CardDescription>Click any row to manage it.</CardDescription>
            </CardHeader>
            <CardBody>
              <RequestPicker
                selected={req}
                onSelect={handleSelectReq}
                requests={requests}
                loading={loadingData}
              />
            </CardBody>
          </Card>
        </motion.div>

        {/* Right: update form */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
          className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!req ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="flex h-72 items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Settings2 className="h-10 w-10 text-slate-300" aria-hidden="true" />
                    <p className="text-sm text-text-secondary">Select a request on the left to update it.</p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", req.categoryColor)}>
                          {req.category}
                        </span>
                        <CardTitle className="mt-2">{req.location}</CardTitle>
                      </div>
                      <span className="text-xs font-mono text-text-secondary">{req.displayId}</span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{req.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{req.time}</span>
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />Reported by {req.reportedBy}</span>
                    </div>
                  </CardHeader>

                  <CardBody className="space-y-5">
                    <StatusTrack current={status} />

                    <div>
                      <Label htmlFor="mg-status" required>Update status</Label>
                      <Select id="mg-status"
                        options={MANAGE_STATUS_OPTIONS}
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setSaved(false); }} />
                    </div>

                    <div>
                      <Label htmlFor="mg-notes">Operational notes</Label>
                      <Textarea id="mg-notes" rows={4}
                        placeholder="Add notes about the response, handover details, or follow-up actions…"
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); setSaved(false); }} />
                    </div>

                    <AnimatePresence>
                      {saved && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 rounded-lg bg-resolved-light px-3 py-2">
                          <CheckCircle2 className="h-4 w-4 text-resolved" />
                          <span className="text-xs font-medium text-resolved-strong">Status saved successfully.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardBody>

                  <CardFooter className="justify-end">
                    <Button variant="ghost" onClick={() => { setReq(null); setSaved(false); }}>
                      Choose another
                    </Button>
                    <Button variant="primary" loading={saving} onClick={handleSave}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function ManagePage() {
  return <Suspense><ManageInner /></Suspense>;
}
