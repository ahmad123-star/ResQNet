"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Toast — transient success/error/info/warning messages.
 *
 * Usage:
 *  1. <ToastProvider> wraps the app (already wired in app/providers.js).
 *  2. Call the hook anywhere inside a Client Component:
 *
 *       const toast = useToast();
 *       toast.success("Incident dispatched");
 *       toast.error("Could not reach the server");
 *       toast.show({ title: "Heads up", description: "...", variant: "info" });
 *
 * Toasts stack bottom-right, animate in/out, and auto-dismiss (default 4s).
 */

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, accent: "text-resolved", ring: "ring-resolved/20" },
  error: { icon: XCircle, accent: "text-critical", ring: "ring-primary/20" },
  info: { icon: Info, accent: "text-info", ring: "ring-info/20" },
  warning: { icon: AlertTriangle, accent: "text-pending", ring: "ring-pending/30" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const mounted = useHydrated();
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ title, description, variant = "info", duration = 4000 }) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, title, description, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  // Convenience helpers — toast.success("..."), toast.error("..."), etc.
  const api = {
    show,
    dismiss,
    success: (title, opts) => show({ title, variant: "success", ...opts }),
    error: (title, opts) => show({ title, variant: "error", ...opts }),
    info: (title, opts) => show({ title, variant: "info", ...opts }),
    warning: (title, opts) => show({ title, variant: "warning", ...opts }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed bottom-0 right-0 z-60 flex w-full max-w-sm flex-col gap-3 p-4">
            <AnimatePresence initial={false}>
              {toasts.map((t) => (
                <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onClose }) {
  const variant = VARIANTS[toast.variant] || VARIANTS.info;
  const Icon = variant.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-lg ring-1",
        variant.ring
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", variant.accent)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-sm font-medium text-text">{toast.title}</p>
        )}
        {toast.description && (
          <p className="mt-0.5 text-sm text-text-secondary">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="rounded-md p-0.5 text-text-secondary transition-colors hover:bg-slate-100 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/** Access the toast API from any Client Component below <ToastProvider>. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}
