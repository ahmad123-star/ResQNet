"use client";

import { MotionConfig } from "framer-motion";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * App-wide client providers.
 *
 * - MotionConfig reducedMotion="user": every Framer Motion animation in the
 *   app automatically respects the OS "reduce motion" setting, so we don't
 *   have to branch on it inside each component.
 * - ToastProvider: exposes the global useToast() hook + renders the toast
 *   stack viewport.
 */
export default function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
