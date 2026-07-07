"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, MapPin, Clock, ChevronRight, CheckCircle2, Play,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button    from "@/components/ui/Button";
import Skeleton  from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn, timeAgo } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import {
  TASK_STATUSES, TASK_STATUS_META, SEVERITY_BADGE,
  dbTaskStatusToUi, uiTaskStatusToDb, dbSeverityToUi, getCategoryColor,
} from "@/lib/data/volunteerData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";
import { createNotification } from "@/lib/notifications";
import { createSystemLog } from "@/lib/systemLog";
import { emailNotify } from "@/lib/emailNotify";

/* ── Status stepper ──────────────────────────────────────────────────────── */
function StatusStepper({ current }) {
  const steps = ["accepted", "in_progress", "completed"];
  const currentIndex = steps.indexOf(current);
  return (
    <ol className="flex items-center gap-0">
      {steps.map((step, i) => {
        const meta      = TASK_STATUS_META[step];
        const isDone    = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast    = i === steps.length - 1;
        return (
          <li key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors",
                isDone    ? "border-resolved bg-resolved text-white" :
                isCurrent ? "border-primary bg-primary text-white" :
                            "border-border bg-surface text-text-secondary"
              )}>
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn(
                "text-[10px] font-medium leading-none whitespace-nowrap",
                isCurrent ? "text-primary" :
                isDone    ? "text-resolved-strong" : "text-text-secondary"
              )}>
                {meta.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn(
                "mx-1 h-0.5 flex-1 rounded",
                i < currentIndex ? "bg-resolved/60" : "bg-border"
              )} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Task card ───────────────────────────────────────────────────────────── */
function TaskCard({ task, onStatusChange }) {
  const [advancing, setAdvancing] = useState(false);
  const statusCfg  = TASK_STATUSES.find((s) => s.value === task.status);
  const statusMeta = TASK_STATUS_META[task.status];
  const sevMeta    = SEVERITY_BADGE[task.severity] ?? SEVERITY_BADGE.medium;

  const handleAdvance = async () => {
    if (!statusCfg?.next) return;
    setAdvancing(true);
    await onStatusChange(task.id, task.emergencyId, statusCfg.next);
    setAdvancing(false);
  };

  return (
    <motion.div variants={staggerItem} layout>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className={cn("h-1 w-full", {
          "bg-primary":  task.severity === "high",
          "bg-pending":  task.severity === "medium",
          "bg-resolved": task.severity === "low",
        })} />

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  task.categoryColor
                )}>
                  {task.categoryLabel}
                </span>
                <StatusBadge status={sevMeta.status}>{sevMeta.label}</StatusBadge>
              </div>
              <p className="text-sm font-medium text-text leading-snug">{task.description}</p>
            </div>
            <StatusBadge status={statusMeta.badge} className="shrink-0">
              {statusMeta.label}
            </StatusBadge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
            {task.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {task.address}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Accepted {task.acceptedAt}
            </span>
            <span className="font-mono">#{task.emergencyId.slice(0, 8)}</span>
          </div>

          <StatusStepper current={task.status} />

          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-text-secondary">
              Reported by{" "}
              <span className="font-medium text-text">{task.reportedBy}</span>
            </p>
            {statusCfg?.next ? (
              <Button
                size="sm"
                variant={task.status === "in_progress" ? "primary" : "secondary"}
                loading={advancing}
                onClick={handleAdvance}
              >
                {task.status === "accepted" ? (
                  <><Play className="h-3.5 w-3.5" />{advancing ? "Starting…" : statusCfg.nextLabel}</>
                ) : (
                  <><CheckCircle2 className="h-3.5 w-3.5" />{advancing ? "Completing…" : statusCfg.nextLabel}</>
                )}
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-resolved-strong">
                <CheckCircle2 className="h-4 w-4" /> All done
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ── Skeletons ───────────────────────────────────────────────────────────── */
function TaskSkeletons() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full shrink-0" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ── Transform DB row → UI shape ─────────────────────────────────────────── */
function transformTask(row) {
  const em      = row.emergencies ?? {};
  const catName = em.emergency_categories?.name ?? "Other";
  return {
    id:            row.id,
    emergencyId:   row.emergency_id,
    victimId:      em.victim_id ?? null,
    categoryLabel: catName,
    categoryColor: getCategoryColor(catName),
    severity:      dbSeverityToUi(em.severity),
    description:   em.description ?? "—",
    address:       em.address ?? null,
    acceptedAt:    timeAgo(row.created_at),
    reportedBy:    em.victim?.name ?? "Anonymous",
    status:        dbTaskStatusToUi(row.status),
  };
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function MyTasksPage() {
  const { user } = useShell();
  const toast    = useToast();

  const [loading, setLoading] = useState(true);
  const [tasks,   setTasks]   = useState([]);

  const loadTasks = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id, status, created_at, emergency_id,
        emergencies(
          id, description, severity, address, victim_id,
          emergency_categories(name),
          victim:profiles!victim_id(name)
        )
      `)
      .eq("volunteer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load tasks", { description: error.message });
    } else {
      setTasks((data ?? []).map(transformTask));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) loadTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  /* Advance task status; fire victim notification; resolve emergency on complete. */
  const handleStatusChange = async (taskId, emergencyId, nextUiStatus) => {
    const supabase     = createClient();
    const nextDbStatus = uiTaskStatusToDb(nextUiStatus);
    const task         = tasks.find((t) => t.id === taskId);

    const { error: taskErr } = await supabase
      .from("tasks")
      .update({ status: nextDbStatus })
      .eq("id", taskId);

    if (taskErr) {
      toast.error("Update failed", { description: taskErr.message });
      return;
    }

    createSystemLog(user.id, `Task ${taskId.slice(0, 8).toUpperCase()} status changed to ${nextUiStatus}.`, "info");

    if (nextUiStatus === "in_progress" && task?.victimId) {
      const msg = "A volunteer has started working on your emergency and is heading to your location.";
      await createNotification(task.victimId, "task", "Help is on the way", msg);
      emailNotify([task.victimId], "Help is on the way — ResQNet", msg);
    }

    if (nextUiStatus === "completed") {
      await supabase
        .from("emergencies")
        .update({ status: "Resolved" })
        .eq("id", emergencyId);

      if (task?.victimId) {
        const msg = "Your emergency has been resolved. Thank you for using ResQNet.";
        await createNotification(task.victimId, "resolved", "Emergency Resolved", msg);
        emailNotify([task.victimId], "Your emergency has been resolved — ResQNet", msg);
      }
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextUiStatus } : t))
    );

    const meta = TASK_STATUS_META[nextUiStatus];
    toast[nextUiStatus === "completed" ? "success" : "info"](
      `Task ${meta.label.toLowerCase()}`,
      {
        description:
          nextUiStatus === "completed"
            ? "Great work! Emergency marked as Resolved."
            : "Status updated.",
      }
    );
  };

  const active    = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Heading */}
      <motion.div
        variants={fadeInUp} initial="hidden" animate="visible"
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-text-secondary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">My Tasks</h1>
            <p className="text-sm text-text-secondary">
              {loading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>
        <Link
          href="/volunteer/nearby"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Find more <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }}>
            <TaskSkeletons />
          </motion.div>
        ) : tasks.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <EmptyState
              icon={ClipboardList}
              title="No tasks yet"
              description="Accept a nearby emergency to start helping people in your area."
              action={
                <Link
                  href="/volunteer/nearby"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <MapPin className="h-4 w-4" /> Find nearby emergencies
                </Link>
              }
            />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {active.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  Active ({active.length})
                </h2>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {active.map((task) => (
                    <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                  ))}
                </motion.div>
              </section>
            )}
            {completed.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  Completed ({completed.length})
                </h2>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {completed.map((task) => (
                    <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
                  ))}
                </motion.div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
