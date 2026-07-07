"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardList, CheckCircle2, AlertTriangle,
  MapPin, ArrowRight, Power,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { createClient } from "@/lib/supabase/client";
import { useShell } from "@/lib/shellContext";

/* ── Stat icon map ───────────────────────────────────────────────────────── */
const STAT_ICONS = {
  active:    { icon: ClipboardList, bg: "bg-info-light",     text: "text-info",     badge: "info" },
  completed: { icon: CheckCircle2,  bg: "bg-resolved-light", text: "text-resolved", badge: "resolved" },
  open:      { icon: AlertTriangle, bg: "bg-critical-light", text: "text-primary",  badge: "critical" },
};

/* ── Animated availability toggle ───────────────────────────────────────── */
function AvailabilityToggle({ available, onChange, saving }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={available}
      disabled={saving}
      onClick={() => onChange(!available)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        saving && "opacity-60 cursor-not-allowed",
        available ? "bg-resolved" : "bg-slate-300"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow",
          available ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function VolunteerDashboard() {
  const { user } = useShell();
  const toast    = useToast();

  const [available,  setAvailable]  = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [counts,     setCounts]     = useState({ active: null, completed: null, open: null });

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();

    Promise.all([
      // Active tasks (Accepted + In Progress)
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", user.id)
        .in("status", ["Accepted", "In Progress"]),

      // Completed tasks (all time)
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("volunteer_id", user.id)
        .eq("status", "Completed"),

      // Open (Reported) emergencies in the system — shown as "available to help"
      supabase
        .from("emergencies")
        .select("*", { count: "exact", head: true })
        .eq("status", "Reported"),

      // Volunteer's current availability
      supabase
        .from("profiles")
        .select("availability_status")
        .eq("id", user.id)
        .single(),
    ]).then(([activeRes, completedRes, openRes, profileRes]) => {
      setCounts({
        active:    activeRes.count    ?? 0,
        completed: completedRes.count ?? 0,
        open:      openRes.count      ?? 0,
      });
      if (profileRes.data) {
        setAvailable(profileRes.data.availability_status === "available");
      }
      setLoading(false);
    });
  }, [user?.id]);

  const handleToggle = async (val) => {
    setAvailable(val);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ availability_status: val ? "available" : "unavailable" })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setAvailable(!val); // revert on failure
      toast.error("Could not update availability", { description: error.message });
    } else {
      toast[val ? "success" : "info"](
        val ? "You are now available" : "You are now unavailable",
        { description: val ? "Nearby requests will be shown to you." : "You won't receive new task requests." }
      );
    }
  };

  const stats = [
    { id: "active",    label: "Active Tasks",         value: counts.active,    sub: "Accepted or in progress" },
    { id: "completed", label: "Completed",             value: counts.completed, sub: "All time" },
    { id: "open",      label: "Open Emergencies",      value: counts.open,      sub: "Waiting for a volunteer" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">

      {/* Heading + availability */}
      <motion.div
        variants={fadeInUp} initial="hidden" animate="visible"
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Volunteer Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Your response summary and current availability.
          </p>
        </div>

        {/* Availability toggle card */}
        <div className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
          available ? "border-resolved/40 bg-resolved-light" : "border-border bg-surface"
        )}>
          <Power className={cn(
            "h-5 w-5 shrink-0",
            available ? "text-resolved" : "text-text-secondary"
          )} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text leading-none">
              {loading ? "Loading…" : available ? "Available" : "Unavailable"}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {available ? "Receiving nearby requests" : "Not receiving requests"}
            </p>
          </div>
          <AvailabilityToggle available={available} onChange={handleToggle} saving={saving} />
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="grid gap-4 sm:grid-cols-3"
      >
        {stats.map((stat) => {
          const meta = STAT_ICONS[stat.id];
          const Icon = meta.icon;
          return (
            <motion.div key={stat.id} variants={staggerItem}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", meta.bg)}>
                    <Icon className={cn("h-5 w-5", meta.text)} />
                  </span>
                  <StatusBadge status={meta.badge} dot={false} />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-9 w-16 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold tracking-tight text-text">{stat.value}</p>
                  )}
                  <p className="text-sm font-medium text-text">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{stat.sub}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Nearby CTA */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary-light p-6">
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-primary/8" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-24 h-24 w-24 rounded-full bg-primary/5" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <MapPin className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-text">
                  {loading ? "…" : counts.open} emergencies waiting
                </h2>
                <p className="mt-0.5 text-sm text-text-secondary">
                  People near you need your help right now.
                </p>
              </div>
            </div>
            <Link
              href="/volunteer/nearby"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              View nearby <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
        className="grid gap-3 sm:grid-cols-2"
      >
        {[
          { href: "/volunteer/my-tasks", icon: ClipboardList, label: "My Tasks",            sub: "View and update your accepted tasks",  bg: "bg-info-light",     text: "text-info" },
          { href: "/volunteer/nearby",   icon: MapPin,        label: "Nearby Emergencies",  sub: "Accept new tasks in your area",        bg: "bg-critical-light", text: "text-primary" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.href} variants={staggerItem}>
              <Link
                href={item.href}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", item.bg)}>
                  <Icon className={cn("h-5 w-5", item.text)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text">{item.label}</p>
                  <p className="text-xs text-text-secondary">{item.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}
