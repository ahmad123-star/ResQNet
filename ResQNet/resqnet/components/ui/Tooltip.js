"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Tooltip — small label shown on hover/focus of its child.
 *
 *   <Tooltip content="Acknowledge incident" side="top">
 *     <Button variant="ghost" size="sm"><Check /></Button>
 *   </Tooltip>
 *
 * Shows on pointer hover AND keyboard focus (accessibility). `side` controls
 * placement: top | bottom | left | right.
 */
const SIDE_STYLES = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({ content, side = "top", className, children }) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && content && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-text px-2.5 py-1.5 text-xs font-medium text-white shadow-md",
              SIDE_STYLES[side],
              className
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
