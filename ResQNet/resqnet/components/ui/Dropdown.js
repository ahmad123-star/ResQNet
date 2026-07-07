"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Dropdown — a click-triggered menu.
 *
 *   <Dropdown trigger={<Button variant="outline">Actions</Button>}>
 *     <DropdownItem onSelect={...}>Edit</DropdownItem>
 *     <DropdownItem icon={Trash} destructive onSelect={...}>Delete</DropdownItem>
 *   </Dropdown>
 *
 * Closes on outside-click and Escape. Menu animates open/closed. Alignment
 * controlled via `align` ("left" | "right", default "left").
 */
export function Dropdown({ trigger, children, align = "left", className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      {/* Wrap the provided trigger so any element opens the menu. */}
      <span onClick={() => setOpen((v) => !v)} className="inline-flex">
        {trigger}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            // Close after a selection bubbles up from a DropdownItem.
            onClick={() => setOpen(false)}
            className={cn(
              "absolute z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({
  icon: Icon,
  destructive = false,
  onSelect,
  className,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        destructive
          ? "text-critical-strong hover:bg-primary-light"
          : "text-text hover:bg-slate-100",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />;
}

export default Dropdown;
