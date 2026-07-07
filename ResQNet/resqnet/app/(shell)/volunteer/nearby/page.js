"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, SlidersHorizontal, CheckCircle2, Navigation } from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn, timeAgo } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import {
  SEVERITY_BADGE, DISTANCE_FILTERS,
  getCategoryColor, dbSeverityToUi, haversineKm,
} from "@/lib/data/volunteerData";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";
import { createNotification } from "@/lib/notifications";
import { emailNotify } from "@/lib/emailNotify";
import { createSystemLog } from "@/lib/systemLog";

/* ── Distance badge ──────────────────────────────────────────────────────── */
function DistanceBadge({ km }) {
  const close = km <= 2;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
      close ? "bg-resolved-light text-resolved-strong" : "bg-slate-100 text-text-secondary"
    )}>
      <MapPin className="h-3 w-3" />
      {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`}
    </span>
  );
}

/* ── Single nearby emergency card ────────────────────────────────────────── */
function NearbyCard({ emergency, onAccept, accepted }) {
  const [accepting, setAccepting] = useState(false);
  const sevMeta = SEVERITY_BADGE[emergency.severity] ?? SEVERITY_BADGE.medium;

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept(emergency);
    setAccepting(false);
  };

  return (
    <motion.div variants={staggerItem} layout>
      <Card className={cn(
        "overflow-hidden transition-shadow hover:shadow-md",
        accepted && "opacity-70"
      )}>
        <div className={cn("h-1 w-full", {
          "bg-primary":  emergency.severity === "high",
          "bg-pending":  emergency.severity === "medium",
          "bg-resolved": emergency.severity === "low",
        })} />

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  emergency.categoryColor
                )}>
                  {emergency.categoryLabel}
                </span>
                {emergency.distance_km != null && (
                  <DistanceBadge km={emergency.distance_km} />
                )}
              </div>
              <p className="text-sm font-medium text-text leading-snug line-clamp-2">
                {emergency.description}
              </p>
            </div>
            <StatusBadge status={sevMeta.status} className="shrink-0">
              {sevMeta.label}
            </StatusBadge>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {emergency.address || "Location not specified"}
            </span>
            <span className="shrink-0">{emergency.time}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-text-secondary">
              Reported by{" "}
              <span className="font-medium text-text">
                {emergency.reportedBy || "Anonymous"}
              </span>
            </p>
            {accepted ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-resolved-strong">
                <CheckCircle2 className="h-4 w-4" />
                Accepted
              </span>
            ) : (
              <Button size="sm" variant="primary" loading={accepting} onClick={handleAccept}>
                {accepting ? "Accepting…" : "Accept task"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ── Map placeholder ─────────────────────────────────────────────────────── */
function MapPlaceholder() {
  return (
    <div className="relative flex h-full min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right,#cbd5e1 1px,transparent 1px),linear-gradient(to bottom,#cbd5e1 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {[
        { top: "28%", left: "38%", color: "bg-primary" },
        { top: "55%", left: "60%", color: "bg-pending" },
        { top: "42%", left: "22%", color: "bg-info" },
      ].map((pin, i) => (
        <motion.span
          key={i}
          className={cn("absolute flex h-5 w-5 items-center justify-center rounded-full", pin.color)}
          style={{ top: pin.top, left: pin.left }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0.5, 0.9] }}
          transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="h-2 w-2 rounded-full bg-white" />
        </motion.span>
      ))}
      <div className="relative flex flex-col items-center gap-2 text-center">
        <MapPin className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-400">Map will load here</p>
        <p className="text-xs text-slate-400">Live emergency pins coming soon</p>
      </div>
    </div>
  );
}

/* ── Card skeletons ──────────────────────────────────────────────────────── */
function NearbySkeletons() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-1 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-3 w-2/3" />
            <div className="flex justify-between pt-2 border-t border-border">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function NearbyEmergenciesPage() {
  const { user }  = useShell();
  const toast     = useToast();

  const [maxKm, setMaxKm]           = useState(10);
  const [emergencies, setEmergencies] = useState([]);
  const [accepted, setAccepted]     = useState(new Set());   // emergency UUIDs accepted this session
  const [loading, setLoading]       = useState(true);
  const [locErr, setLocErr]         = useState("");
  const [volunteerPos, setVolPos]   = useState(null); // {lat, lng}

  // 1. Get volunteer location from browser, then fetch emergencies.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocErr("Geolocation is not supported by your browser. Showing all open emergencies.");
      fetchEmergencies(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setVolPos(loc);
        // Save to profile silently so future pages have it.
        const supabase = createClient();
        supabase.from("profiles").update({ lat: loc.lat, lng: loc.lng }).eq("id", user.id);
        fetchEmergencies(loc);
      },
      () => {
        setLocErr("Location permission denied. Showing all open emergencies without distance.");
        fetchEmergencies(null);
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchEmergencies = useCallback(async (loc) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("emergencies")
      .select(`
        id, victim_id, description, severity, address, lat, lng, created_at,
        emergency_categories(name),
        victim:profiles!victim_id(name)
      `)
      .eq("status", "Reported")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load emergencies", { description: error.message });
      setLoading(false);
      return;
    }

    const rows = (data ?? []).map((row) => {
      const distKm =
        loc && row.lat != null && row.lng != null
          ? haversineKm(loc.lat, loc.lng, row.lat, row.lng)
          : null;
      const catName = row.emergency_categories?.name ?? "Other";
      return {
        id:            row.id,
        victimId:      row.victim_id ?? null,
        categoryLabel: catName,
        categoryColor: getCategoryColor(catName),
        severity:      dbSeverityToUi(row.severity),
        description:   row.description,
        address:       row.address,
        time:          timeAgo(row.created_at),
        reportedBy:    row.victim?.name ?? "Anonymous",
        distance_km:   distKm,
        lat:           row.lat,
        lng:           row.lng,
      };
    });

    // Sort nearest first; nulls go to the end.
    rows.sort((a, b) => {
      if (a.distance_km == null && b.distance_km == null) return 0;
      if (a.distance_km == null) return 1;
      if (b.distance_km == null) return -1;
      return a.distance_km - b.distance_km;
    });

    setEmergencies(rows);
    setLoading(false);
  }, [toast]);

  // 2. Accept a task: INSERT task row + UPDATE emergency status.
  const handleAccept = async (emergency) => {
    const supabase = createClient();

    const { error: taskErr } = await supabase.from("tasks").insert({
      emergency_id: emergency.id,
      volunteer_id: user.id,
      status:       "Accepted",
    });

    if (taskErr) {
      toast.error("Could not accept task", { description: taskErr.message });
      return;
    }

    const { error: emErr } = await supabase
      .from("emergencies")
      .update({ status: "In Progress" })
      .eq("id", emergency.id)
      .eq("status", "Reported"); // guard: only update if still open

    if (emErr) {
      toast.error("Task accepted but emergency status not updated", { description: emErr.message });
    }

    /* Notify victim that help is coming */
    if (emergency.victimId) {
      const msg = `A volunteer has accepted your emergency${emergency.address ? ` at ${emergency.address}` : ""} and is heading to your location.`;
      await createNotification(emergency.victimId, "task", "Help is on the way", msg);
      emailNotify([emergency.victimId], "Help is on the way — ResQNet", msg);
    }

    createSystemLog(user.id, `Task accepted for emergency ${emergency.id.slice(0, 8).toUpperCase()}.`, "info");

    setAccepted((prev) => new Set([...prev, emergency.id]));
    toast.success("Task accepted", {
      description: "Added to your task list. Head to My Tasks to update status.",
    });
  };

  // 3. Filter list by distance.
  const filtered = emergencies.filter((e) =>
    e.distance_km == null || e.distance_km <= maxKm
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Heading */}
      <motion.div
        variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-text-secondary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Nearby Emergencies</h1>
            <p className="text-sm text-text-secondary">
              {loading
                ? "Loading…"
                : `${filtered.length} report${filtered.length !== 1 ? "s" : ""} within ${maxKm} km`}
            </p>
          </div>
        </div>

        {/* Distance filter pills */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-text-secondary" />
          <div className="flex flex-wrap gap-1.5">
            {DISTANCE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setMaxKm(f.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  maxKm === f.value
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-text-secondary hover:bg-slate-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Location warning */}
      {locErr && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-pending/30 bg-pending-light px-4 py-2.5 text-sm text-pending-strong"
        >
          <Navigation className="h-4 w-4 shrink-0" />
          {locErr}
        </motion.div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* List */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="skel" exit={{ opacity: 0 }}>
                <NearbySkeletons />
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <EmptyState
                  icon={MapPin}
                  title="No emergencies in this range"
                  description="Try widening the distance filter above."
                />
              </motion.div>
            ) : (
              <motion.div
                key={maxKm}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filtered.map((em) => (
                  <NearbyCard
                    key={em.id}
                    emergency={em}
                    accepted={accepted.has(em.id)}
                    onAccept={handleAccept}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map */}
        <motion.div
          variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
          className="w-full lg:sticky lg:top-24 lg:w-96 xl:w-110"
        >
          <MapPlaceholder />
          <p className="mt-2 text-center text-xs text-text-secondary">
            {volunteerPos
              ? `Showing emergencies within ${maxKm} km of your location`
              : "Enable location to see distance-sorted results"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
