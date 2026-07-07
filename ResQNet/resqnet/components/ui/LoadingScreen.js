"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * LoadingScreen — full-screen branded splash / loading state.
 *
 * Centred ResQNet wordmark sitting inside a softly pulsing red ring that
 * beats like a heartbeat. Use as the app splash, route-level loading.js, or
 * a blocking overlay (`fullscreen` covers the viewport with a fixed layer).
 *
 * Framer Motion drives the pulse, so prefers-reduced-motion users (via the
 * app-wide MotionConfig) automatically get a calm static ring instead.
 *
 * Props:
 *  - label      : small text under the wordmark (default "Loading…")
 *  - fullscreen : fixed full-viewport overlay (default true)
 */
export default function LoadingScreen({
  label = "Loading…",
  fullscreen = true,
  className,
}) {
  // Two concentric rings beating slightly out of phase for a "pulse" feel.
  const ringTransition = {
    duration: 1.6,
    repeat: Infinity,
    ease: "easeInOut",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-6 bg-background",
        fullscreen ? "fixed inset-0 z-70" : "min-h-[60vh] w-full",
        className
      )}
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Outer expanding pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-primary/40"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={ringTransition}
        />
        {/* Inner pulse ring, delayed for the double-beat */}
        <motion.span
          className="absolute inset-2 rounded-full border-2 border-primary/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ ...ringTransition, delay: 0.2 }}
        />
        {/* Solid core that gently beats */}
        <motion.span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-md"
          animate={{ scale: [1, 1.08, 1] }}
          transition={ringTransition}
        >
          {/* Monogram inside the heartbeat core */}
          <span className="text-xl font-bold tracking-tight">R</span>
        </motion.span>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-text">
          Res<span className="text-primary">Q</span>Net
        </span>
        {label && (
          <span className="text-sm text-text-secondary">{label}</span>
        )}
      </div>
    </div>
  );
}
