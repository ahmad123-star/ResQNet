"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

/**
 * Button — the primary interactive control.
 *
 * Variants:
 *  - primary   : solid red, the main call to action / critical action
 *  - secondary : light-grey surface, neutral actions
 *  - danger     : solid red emphasised for destructive/emergency confirmations
 *  - ghost     : transparent, low-emphasis (toolbars, icon buttons)
 *  - outline   : bordered, medium emphasis
 *
 * Sizes: sm | md | lg.
 *
 * Other props:
 *  - loading   : shows a spinner, hides label, disables the button
 *  - fullWidth : stretches to container width
 *  - as / href : standard <button> by default; pass type as needed
 *
 * A small scale-on-press (Framer Motion) gives tactile feedback; it respects
 * prefers-reduced-motion globally via MotionConfig.
 */

const VARIANTS = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "bg-slate-100 text-text hover:bg-slate-200 focus-visible:outline-slate-400",
  danger:
    "bg-primary text-white shadow-sm ring-1 ring-inset ring-primary-hover/30 hover:bg-primary-hover focus-visible:outline-primary",
  ghost:
    "bg-transparent text-text hover:bg-slate-100 focus-visible:outline-slate-400",
  outline:
    "bg-surface text-text border border-border hover:bg-slate-50 focus-visible:outline-slate-400",
};

const SIZES = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled = false,
    className,
    children,
    type = "button",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      // Subtle press feedback — skipped automatically when disabled.
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl font-medium",
        "transition-colors duration-150 select-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {/* Keep label width while loading by overlaying the spinner. */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size === "lg" ? "md" : "sm"} />
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-2",
          loading && "invisible"
        )}
      >
        {children}
      </span>
    </motion.button>
  );
});

export default Button;
