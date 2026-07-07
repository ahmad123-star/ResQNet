"use client";

import { createContext, useContext, useId, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Tabs — accessible tabbed interface with an animated active indicator.
 *
 *   <Tabs defaultValue="active">
 *     <TabsList>
 *       <TabsTrigger value="active">Active</TabsTrigger>
 *       <TabsTrigger value="resolved">Resolved</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="active"> ... </TabsContent>
 *     <TabsContent value="resolved"> ... </TabsContent>
 *   </Tabs>
 *
 * Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 * The sliding underline uses Framer Motion's shared `layoutId`.
 */
const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const groupId = useId();
  const isControlled = value !== undefined;
  const active = isControlled ? value : internal;

  const setActive = (v) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ active, setActive, groupId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border bg-slate-50 p-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const ctx = useContext(TabsContext);
  const selected = ctx.active === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setActive(value)}
      className={cn(
        "relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        selected ? "text-primary" : "text-text-secondary hover:text-text",
        className
      )}
    >
      {/* Sliding white "pill" behind the active tab. */}
      {selected && (
        <motion.span
          layoutId={`tab-indicator-${ctx.groupId}`}
          className="absolute inset-0 rounded-lg bg-surface shadow-sm"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const ctx = useContext(TabsContext);
  if (ctx.active !== value) return null;

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("mt-4", className)}
    >
      {children}
    </motion.div>
  );
}

export default Tabs;
