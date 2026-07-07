"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin, Clock, User, CheckCircle2, Circle,
  AlertTriangle, Navigation, Share2, Users, Settings2,
  Package, ScrollText, Trash2, Heart, RefreshCw,
} from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter,
} from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button    from "@/components/ui/Button";
import Skeleton  from "@/components/ui/Skeleton";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useShell } from "@/lib/shellContext";
import { cn, timeAgo } from "@/lib/utils";
import Map from "@/components/ui/Map";
import { fadeInUp } from "@/lib/motion";
import { DETAIL_ACTIONS } from "@/lib/data/sharedData";
import { getCategoryColor, dbSeverityToUi } from "@/lib/data/victimData";
import { createClient } from "@/lib/supabase/client";

const ACTION_ICONS = {
  MapPin, Share2, CheckCircle2, Navigation, RefreshCw,
  Users, Settings2, Package, ScrollText, Trash2, Heart,
};

/* DB status → badge + label */
const STATUS_META = {
  Reported:     { badge: "critical", label: "Reported" },
  "In Progress":{ badge: "pending",  label: "In Progress" },
  Resolved:     { badge: "resolved", label: "Resolved" },
  Cancelled:    { badge: "info",     label: "Cancelled" },
};

const SEVERITY_META = {
  high:   { badge: "critical", label: "High" },
  medium: { badge: "pending",  label: "Medium" },
  low:    { badge: "info",     label: "Low" },
};

/* ── Timeline ────────────────────────────────────────────────────────────── */
function buildTimeline(status, createdAt) {
  const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
  if (status === "Cancelled") {
    return [
      { label: "Reported",  done: true, detail: "Emergency submitted",       time: fmt(createdAt) },
      { label: "Cancelled", done: true, detail: "Report cancelled by victim", time: "—" },
    ];
  }
  const inProg  = status === "In Progress" || status === "Resolved";
  const resolved = status === "Resolved";
  return [
    { label: "Reported",    done: true,     detail: "Emergency submitted", time: fmt(createdAt) },
    { label: "In Progress", done: inProg,   detail: "Help is on the way",  time: inProg    ? "—" : null },
    { label: "Resolved",    done: resolved, detail: "Situation resolved",  time: resolved  ? "—" : null },
  ];
}

function Timeline({ steps }) {
  return (
    <ol className="relative ml-3.5 border-l border-border">
      {steps.map((step, i) => {
        const isDone    = step.done;
        const isCurrent = !isDone && i > 0 && steps[i - 1]?.done;
        return (
          <li key={step.label} className={cn("relative mb-6 last:mb-0 pl-7", !isDone && "opacity-50")}>
            <span className={cn(
              "absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-surface",
              isDone     ? "border-resolved bg-resolved text-white"
                : isCurrent ? "border-primary bg-primary text-white"
                : "border-border"
            )}>
              {isDone
                ? <CheckCircle2 className="h-4 w-4" />
                : isCurrent
                ? <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="h-2.5 w-2.5 rounded-full bg-white"
                  />
                : <Circle className="h-3 w-3 text-border" />
              }
            </span>
            <div>
              <p className={cn(
                "text-sm font-semibold",
                isDone ? "text-text" : isCurrent ? "text-primary" : "text-text-secondary"
              )}>
                {step.label}
                {step.time && (
                  <span className="ml-2 text-xs font-normal text-text-secondary">{step.time}</span>
                )}
              </p>
              {step.detail && <p className="mt-0.5 text-xs text-text-secondary">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}


function ActionButton({ action, onClick, loading }) {
  const Icon = ACTION_ICONS[action.icon];
  return (
    <Button
      variant={action.variant}
      size="md"
      loading={loading === action.id}
      onClick={() => onClick(action.id)}
      className="flex-1 sm:flex-none"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {action.label}
    </Button>
  );
}

/* ── Loading skeleton ────────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Card><CardBody className="space-y-4">
              <div className="flex gap-2"><Skeleton className="h-6 w-20 rounded-full" /><Skeleton className="h-6 w-24 rounded-full" /></div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="grid gap-2 sm:grid-cols-2">
                {[0,1,2,3].map(i => <Skeleton key={i} className="h-10" />)}
              </div>
            </CardBody></Card>
          </div>
          <Card className="h-48"><CardBody><Skeleton className="h-full w-full" /></CardBody></Card>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function EmergencyDetail({ id }) {
  const { role } = useShell();
  const toast    = useToast();
  const router   = useRouter();

  const [emergency,    setEmergency]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState("");
  const [loadingAction,  setLoadingAction]  = useState(null);
  const [deleting,       setDeleting]      = useState(false);
  const [deleteModal,    setDeleteModal]   = useState(false);
  const [cancelModal,    setCancelModal]   = useState(false);
  const [cancelling,     setCancelling]    = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("emergencies")
      .select(`
        id, description, severity, status, address, lat, lng, created_at, photo_url,
        emergency_categories(name),
        tasks(
          id, status, created_at,
          profiles(id, name, role)
        )
      `)
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) setFetchError(error.message);
        else       setEmergency(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (fetchError) return (
    <div className="p-8">
      <p className="rounded-lg bg-critical-light px-4 py-3 text-sm text-critical-strong">{fetchError}</p>
    </div>
  );
  if (!emergency) return null;

  const statusMeta   = STATUS_META[emergency.status]   || STATUS_META.Reported;
  const severityMeta = SEVERITY_META[dbSeverityToUi(emergency.severity)] || SEVERITY_META.medium;
  const actions      = DETAIL_ACTIONS[role] || [];
  const timeline     = buildTimeline(emergency.status, emergency.created_at);
  const categoryName = emergency.emergency_categories?.name ?? "Other";
  const categoryColor = getCategoryColor(categoryName);

  // Tasks join via volunteer_id — profiles here is always the assigned volunteer.
  const assignedVolunteer = emergency.tasks?.find((t) => t.profiles?.name)?.profiles?.name ?? null;

  const handleAction = (actionId) => {
    if (actionId === "delete")    { setDeleteModal(true); return; }

    /* Real navigation actions */
    if (actionId === "assign")    { router.push(`/ngo/assign?id=${id}`);   return; }
    if (actionId === "status")    { router.push(`/ngo/manage?id=${id}`);   return; }
    if (actionId === "manage")    { router.push(`/ngo/manage?id=${id}`);   return; }
    if (actionId === "logs")      { router.push("/admin/logs");             return; }
    if (actionId === "donate")    { router.push(`/donor/donate?emergency=${id}`); return; }
    if (actionId === "accept")    { router.push("/volunteer/nearby");       return; }
    if (actionId === "update")    { router.push("/volunteer/my-tasks");     return; }

    if (actionId === "navigate") {
      const lat = emergency.lat, lng = emergency.lng;
      const url = lat && lng
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(emergency.address ?? "")}`;
      window.open(url, "_blank", "noopener");
      return;
    }

    if (actionId === "share") {
      navigator.clipboard?.writeText(window.location.href).then(() =>
        toast.success("Link copied", { description: "Emergency link copied to clipboard." })
      );
      return;
    }

    /* Remaining placeholders (resource, track) */
    setLoadingAction(actionId);
    setTimeout(() => {
      setLoadingAction(null);
      toast.info("Feature coming soon", { description: "This action is not yet implemented." });
    }, 600);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("emergencies").delete().eq("id", id);
    setDeleting(false);
    setDeleteModal(false);
    if (error) {
      toast.error("Delete failed", { description: error.message });
    } else {
      toast.success("Report deleted");
      router.push(role === "admin" ? "/admin/dashboard" : "/victim/my-emergencies");
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("emergencies")
      .update({ status: "Cancelled" })
      .eq("id", id);
    setCancelling(false);
    setCancelModal(false);
    if (error) {
      toast.error("Could not cancel report", { description: error.message });
    } else {
      setEmergency((prev) => ({ ...prev, status: "Cancelled" }));
      toast.success("Report cancelled");
    }
  };

  const canCancelReport = role === "victim" &&
    emergency.status !== "Resolved" &&
    emergency.status !== "Cancelled";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Breadcrumb */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href={`/${role}/dashboard`}
            className="transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-primary rounded">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-mono font-medium text-text">{id.slice(0, 8)}</span>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Left (2/3) ────────────────────────────────────────────── */}
          <div className="space-y-5 lg:col-span-2">

            {/* Category + Severity + Status + meta */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.04 }}>
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
                      categoryColor
                    )}>
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {categoryName}
                    </span>
                    <StatusBadge status={severityMeta.badge}>{severityMeta.label} Severity</StatusBadge>
                    <StatusBadge status={statusMeta.badge}>{statusMeta.label}</StatusBadge>
                    <span className="font-mono text-xs text-text-secondary">{id.slice(0, 8)}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-text">{emergency.description}</p>

                  <dl className="grid gap-2 sm:grid-cols-2">
                    {[
                      { icon: MapPin, label: "Location",    value: emergency.address || "—" },
                      { icon: Clock,  label: "Reported",    value: timeAgo(emergency.created_at) },
                      { icon: Clock,  label: "Last update", value: timeAgo(emergency.created_at) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                        <div>
                          <p className="text-xs font-medium text-text-secondary">{label}</p>
                          <p className="text-sm text-text">{value}</p>
                        </div>
                      </div>
                    ))}
                  </dl>

                  {assignedVolunteer && (
                    <div className="flex flex-wrap gap-4 border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-text-secondary" />
                        <span className="text-text-secondary">Volunteer:</span>
                        <span className="font-medium text-text">{assignedVolunteer}</span>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>

            {/* Photo */}
            {emergency.photo_url && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.07 }}>
                <Card padded>
                  <p className="mb-3 text-sm font-semibold text-text">Photo</p>
                  <img
                    src={emergency.photo_url}
                    alt="Emergency photo"
                    className="w-full rounded-xl object-cover max-h-72 border border-border"
                  />
                </Card>
              </motion.div>
            )}

            {/* Map */}
            {emergency.lat && emergency.lng && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <Card padded>
                  <p className="mb-3 text-sm font-semibold text-text">Location</p>
                  <div className="overflow-hidden rounded-xl border border-border h-56">
                    <Map lat={emergency.lat} lng={emergency.lng} className="h-56 w-full" />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Role-specific actions */}
            {actions.length > 0 && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}>
                <Card padded className={cn(
                  "border",
                  actions.some((a) => a.variant === "primary")
                    ? "border-primary/20 bg-primary-light"
                    : "border-border"
                )}>
                  <div className="flex flex-wrap gap-3">
                    {actions.map((action) => (
                      <ActionButton key={action.id} action={action} loading={loadingAction} onClick={handleAction} />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-text-secondary">
                    {role === "victim"    && "You reported this emergency. Track updates below."}
                  {canCancelReport && (
                    <button
                      type="button"
                      onClick={() => setCancelModal(true)}
                      className="mt-2 block text-xs font-medium text-text-secondary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary rounded"
                    >
                      Cancel this report
                    </button>
                  )}
                    {role === "volunteer" && "Accept to add this to your task list and start responding."}
                    {role === "ngo"       && "Assign volunteers and update the coordination status."}
                    {role === "admin"     && "Admin controls: manage, audit, or remove this report."}
                    {role === "donor"     && "Donate directly to this emergency or share to raise awareness."}
                  </p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* ── Right: timeline ───────────────────────────────────────── */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.08 }}>
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
                <CardDescription>Progress of this emergency report.</CardDescription>
              </CardHeader>
              <CardBody>
                <Timeline steps={timeline} />
              </CardBody>

              {role === "volunteer" && (
                <CardFooter>
                  <Link href="/volunteer/my-tasks"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm font-medium text-text transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary">
                    <RefreshCw className="h-4 w-4 text-text-secondary" />
                    Go to My Tasks to update status
                  </Link>
                </CardFooter>
              )}
            </Card>
          </motion.div>

        </div>
      </div>

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel report" size="sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <ScrollText className="h-5 w-5 text-text-secondary" />
          </span>
          <p className="pt-1 text-sm text-text-secondary">
            Cancel report <span className="font-semibold text-text">{id.slice(0, 8)}</span>?
            Volunteers and NGOs will no longer see it. You can still view it in your history.
          </p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setCancelModal(false)} disabled={cancelling}>Keep it</Button>
          <Button variant="outline" loading={cancelling} onClick={handleCancel}>
            {cancelling ? "Cancelling…" : "Yes, cancel report"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete report" size="sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light">
            <Trash2 className="h-5 w-5 text-primary" />
          </span>
          <p className="pt-1 text-sm text-text-secondary">
            Permanently delete report <span className="font-semibold text-text">{id.slice(0, 8)}</span>?
            This action cannot be undone and all related data will be removed.
          </p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteModal(false)} disabled={deleting}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            {deleting ? "Deleting…" : "Delete report"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
