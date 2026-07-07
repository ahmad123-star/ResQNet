"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { NOTIF_EVENTS, NOTIF_CHANNELS } from "@/lib/data/adminData";

/* ── Toggle switch component ─────────────────────────────────────────────── */
function Toggle({ checked, onChange, id, label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-text">
          {label}
        </label>
        {description && (
          <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        )}
        {children}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          checked ? "bg-primary" : "bg-slate-200"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

/* ── Channel row: per-event per-channel grid ─────────────────────────────── */
function ChannelGrid({ eventId, channels, state, onToggle }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {channels.map((ch) => {
        const on = state[`${eventId}_${ch.id}`] ?? true;
        return (
          <button key={ch.id} type="button"
            onClick={() => onToggle(`${eventId}_${ch.id}`, !on)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-primary",
              on
                ? "border-primary/40 bg-primary-light text-critical-strong"
                : "border-border bg-surface text-text-secondary hover:bg-slate-100"
            )}>
            {on ? "✓ " : ""}{ch.label}
          </button>
        );
      })}
    </div>
  );
}

export default function NotificationsConfigPage() {
  // Per-event enabled toggles
  const [eventEnabled, setEventEnabled] = useState(
    Object.fromEntries(NOTIF_EVENTS.map((e) => [e.id, true]))
  );
  // Per-event per-channel toggles: `${eventId}_${channelId}` → boolean
  const [channelState, setChannelState] = useState({});
  // Global channel toggles
  const [globalChannels, setGlobalChannels] = useState(
    Object.fromEntries(NOTIF_CHANNELS.map((c) => [c.id, c.id !== "sms"]))
  );

  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const toast = useToast();

  const toggleEvent = (id, val) => {
    setEventEnabled((p) => ({ ...p, [id]: val }));
    setSaved(false);
  };
  const toggleChannel = (key, val) => {
    setChannelState((p) => ({ ...p, [key]: val }));
    setSaved(false);
  };
  const toggleGlobal = (id, val) => {
    setGlobalChannels((p) => ({ ...p, [id]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      toast.success("Notification settings saved");
    }, 900);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-text-secondary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Configure Notifications</h1>
          <p className="text-sm text-text-secondary">Control which events trigger notifications and via which channels.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Events config — takes 2 cols on desktop */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.07 }}
          className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notification Events</CardTitle>
              <CardDescription>
                Toggle each event on/off, then choose which channels to use per event.
              </CardDescription>
            </CardHeader>
            <CardBody>
              <motion.ul variants={staggerContainer} initial="hidden" animate="visible"
                className="divide-y divide-border">
                {NOTIF_EVENTS.map((ev) => (
                  <motion.li key={ev.id} variants={staggerItem} className="py-4 first:pt-0 last:pb-0">
                    <Toggle id={`ev-${ev.id}`} label={ev.label} description={ev.description}
                      checked={eventEnabled[ev.id]}
                      onChange={(v) => toggleEvent(ev.id, v)}>
                      {eventEnabled[ev.id] && (
                        <ChannelGrid
                          eventId={ev.id}
                          channels={NOTIF_CHANNELS}
                          state={channelState}
                          onToggle={toggleChannel}
                        />
                      )}
                    </Toggle>
                  </motion.li>
                ))}
              </motion.ul>
            </CardBody>
          </Card>
        </motion.div>

        {/* Global channels */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.12 }}
          className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Global Channels</CardTitle>
              <CardDescription>Master switches for each delivery channel.</CardDescription>
            </CardHeader>
            <CardBody>
              <ul className="divide-y divide-border">
                {NOTIF_CHANNELS.map((ch) => (
                  <li key={ch.id} className="py-4 first:pt-0 last:pb-0">
                    <Toggle id={`ch-${ch.id}`} label={ch.label} description={ch.description}
                      checked={globalChannels[ch.id]}
                      onChange={(v) => toggleGlobal(ch.id, v)} />
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Save card */}
          <Card className="border-border">
            <CardBody>
              <AnimatePresence>
                {saved && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="mb-3 flex items-center gap-2 rounded-lg bg-resolved-light px-3 py-2">
                    <CheckCircle2 className="h-4 w-4 text-resolved" />
                    <span className="text-xs font-medium text-resolved-strong">Settings saved.</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mb-3 text-sm text-text-secondary">
                Changes apply immediately to all new notifications. Existing queued notifications are unaffected.
              </p>
              <Button variant="primary" fullWidth loading={saving} onClick={handleSave}>
                {saving ? "Saving…" : "Save settings"}
              </Button>
            </CardBody>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
