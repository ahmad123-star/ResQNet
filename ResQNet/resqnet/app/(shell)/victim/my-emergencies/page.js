"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, Clock, Circle, Plus, XCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn, timeAgo } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import {
  STATUS_MAP, SEVERITY_MAP,
  dbStatusToUi, dbSeverityToUi, buildTimeline, getCategoryColor,
} from "@/lib/data/victimData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

/* ── Status timeline (horizontal) ───────────────────────────────────────── */
function Timeline({ steps }) {
  return (
    <ol className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isLast    = i === steps.length - 1;
        const isDone    = step.done;
        const isCurrent = !isDone && i > 0 && steps[i - 1]?.done;
        return (
          <li key={step.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                isDone ? "border-resolved bg-resolved text-white"
                  : isCurrent ? "border-primary bg-primary-light text-primary"
                  : "border-border bg-surface text-text-secondary"
              )}>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="h-2.5 w-2.5 rounded-full bg-primary"
                  />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </span>
              <div className="text-center">
                <p className={cn(
                  "text-[11px] font-semibold leading-none",
                  isDone ? "text-resolved-strong" : isCurrent ? "text-primary" : "text-text-secondary"
                )}>{step.label}</p>
                {step.time && (
                  <p className="mt-0.5 text-[10px] text-text-secondary">{step.time}</p>
                )}
              </div>
            </div>
            {!isLast && (
              <div className={cn(
                "mx-1 h-0.5 flex-1 rounded transition-colors",
                steps[i + 1]?.done || isCurrent ? "bg-resolved/50" : "bg-border"
              )} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Emergency card ──────────────────────────────────────────────────────── */
function EmergencyCard({ emergency, onCancel }) {
  const statusMeta   = STATUS_MAP[emergency.status]   || STATUS_MAP.active;
  const severityMeta = SEVERITY_MAP[emergency.severity] || SEVERITY_MAP.medium;
  const canCancel = emergency.status === "active" || emergency.status === "in_progress";

  return (
    <motion.div variants={staggerItem} layout>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className={cn("h-1 w-full", {
          "bg-primary":  emergency.severity === "high",
          "bg-pending":  emergency.severity === "medium",
          "bg-resolved": emergency.severity === "low",
        })} />
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  getCategoryColor(emergency.categoryName)
                )}>
                  {emergency.categoryName}
                </span>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  severityMeta.className
                )}>
                  {severityMeta.label}
                </span>
              </div>
              <p className="mt-1.5 text-sm font-medium text-text leading-snug line-clamp-2">
                {emergency.description}
              </p>
            </div>
            <StatusBadge status={statusMeta.badge} className="shrink-0">
              {statusMeta.label}
            </StatusBadge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {emergency.time}
            </span>
            <span className="font-mono">#{emergency.shortId}</span>
            {emergency.assignedVolunteer && (
              <span>Assigned to {emergency.assignedVolunteer}</span>
            )}
          </div>

          <div className="pt-2">
            <Timeline steps={emergency.timeline} />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-text-secondary truncate max-w-[50%]">{emergency.address}</p>
            <div className="flex items-center gap-3">
              {canCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(emergency.id)}
                  className="text-xs font-medium text-text-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary rounded"
                >
                  Cancel
                </button>
              )}
              <Link
                href={`/emergency/${emergency.id}`}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-primary rounded"
              >
                View details →
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function EmergencySkeletons() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-8 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function transformRow(row) {
  const uiStatus = dbStatusToUi(row.status);
  return {
    id:                row.id,
    shortId:           row.id.slice(0, 8),
    categoryName:      row.emergency_categories?.name ?? "Other",
    description:       row.description,
    severity:          dbSeverityToUi(row.severity),
    status:            uiStatus,
    address:           row.address,
    time:              timeAgo(row.created_at),
    assignedVolunteer: row.tasks?.[0]?.profiles?.name ?? null,
    timeline:          buildTimeline(row.status, row.created_at),
  };
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function MyEmergenciesPage() {
  const { user }      = useShell();
  const toast         = useToast();
  const [loading, setLoading]         = useState(true);
  const [emergencies, setEmergencies] = useState([]);
  const [fetchError, setFetchError]   = useState("");
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelling, setCancelling]         = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase
      .from("emergencies")
      .select(`
        id, description, severity, status, address, created_at,
        emergency_categories(name),
        tasks(profiles(name))
      `)
      .eq("victim_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFetchError(error.message);
        else setEmergencies((data ?? []).map(transformRow));
        setLoading(false);
      });
  }, [user?.id]);

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;
    setCancelling(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("emergencies")
      .update({ status: "Cancelled" })
      .eq("id", cancelTargetId)
      .eq("victim_id", user.id);
    setCancelling(false);
    setCancelTargetId(null);
    if (error) {
      toast.error("Could not cancel report", { description: error.message });
    } else {
      setEmergencies((prev) =>
        prev.map((e) => e.id === cancelTargetId ? { ...e, status: "cancelled" } : e)
      );
      toast.success("Report cancelled");
    }
  };

  const active    = emergencies.filter((e) => e.status !== "resolved" && e.status !== "cancelled");
  const resolved  = emergencies.filter((e) => e.status === "resolved");
  const cancelled = emergencies.filter((e) => e.status === "cancelled");

  const renderList = (list, emptyIcon, emptyTitle, emptyDesc, showAction = false) => (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="skel" exit={{ opacity: 0 }}><EmergencySkeletons /></motion.div>
      ) : fetchError ? (
        <motion.div key="err" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="rounded-lg bg-critical-light px-4 py-3 text-sm text-critical-strong">{fetchError}</p>
        </motion.div>
      ) : list.length === 0 ? (
        <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDesc}
            action={showAction ? (
              <Link
                href="/victim/report"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Plus className="h-4 w-4" /> Report one
              </Link>
            ) : undefined}
          />
        </motion.div>
      ) : (
        <motion.div key="list" variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {list.map((em) => <EmergencyCard key={em.id} emergency={em} onCancel={setCancelTargetId} />)}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div
        variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-text-secondary" />
          <h1 className="text-2xl font-bold tracking-tight text-text">My Emergencies</h1>
        </div>
        <Link
          href="/victim/report"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus className="h-4 w-4" /> New report
        </Link>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active
              {!loading && active.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                  {active.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {renderList(active, FileText, "No active emergencies", "You have no ongoing emergencies. Stay safe!", true)}
          </TabsContent>
          <TabsContent value="resolved">
            {renderList(resolved, CheckCircle2, "No resolved emergencies", "Resolved reports will appear here once closed.")}
          </TabsContent>
          <TabsContent value="cancelled">
            {renderList(cancelled, XCircle, "No cancelled reports", "Reports you cancel will appear here.")}
          </TabsContent>
          <TabsContent value="all">
            {renderList(emergencies, FileText, "No emergencies yet", "Your submitted reports will appear here.", true)}
          </TabsContent>
        </Tabs>
      </motion.div>

      <Modal
        open={!!cancelTargetId}
        onClose={() => setCancelTargetId(null)}
        title="Cancel report"
        size="sm"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <XCircle className="h-5 w-5 text-text-secondary" />
          </span>
          <p className="pt-1 text-sm text-text-secondary">
            Cancel report <span className="font-semibold text-text">#{cancelTargetId?.slice(0, 8)}</span>?
            Volunteers and NGOs will no longer see it.
          </p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setCancelTargetId(null)} disabled={cancelling}>Keep it</Button>
          <Button variant="outline" loading={cancelling} onClick={handleCancelConfirm}>
            {cancelling ? "Cancelling…" : "Yes, cancel report"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
