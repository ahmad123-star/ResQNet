"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dialogPanel, overlay } from "@/lib/motion";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Modal / Dialog — animated, accessible overlay dialog.
 *
 *   <Modal open={open} onClose={() => setOpen(false)} title="Confirm dispatch">
 *     <p>Send the nearest unit to this incident?</p>
 *     <ModalFooter>
 *       <Button variant="ghost" onClick={...}>Cancel</Button>
 *       <Button variant="danger" onClick={...}>Dispatch</Button>
 *     </ModalFooter>
 *   </Modal>
 *
 * - Rendered in a portal on <body>.
 * - Closes on backdrop click and Escape.
 * - Locks body scroll while open.
 * - Animated open/close via AnimatePresence.
 *
 * Props:
 *  - open, onClose
 *  - title       : optional heading (rendered with a close button)
 *  - size        : "sm" | "md" | "lg"
 */
const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, size = "md", className, children }) {
  // Portals need the DOM, so only render once hydrated on the client.
  const mounted = useHydrated();

  // Escape to close + lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || undefined}
            variants={dialogPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 w-full rounded-2xl border border-border bg-surface shadow-lg",
              SIZES[size],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <h2 className="text-lg font-semibold tracking-tight text-text">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ModalFooter({ className, children }) {
  return (
    <div
      className={cn(
        "mt-5 flex items-center justify-end gap-3 border-t border-border px-5 py-4 -mx-5 -mb-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Modal;
