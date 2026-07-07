"use client";

import { forwardRef, useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkbox — accessible checkbox with an optional inline label.
 *
 * The real <input> is visually hidden but still receives focus/clicks; a
 * styled box sits on top and shows a check icon when selected. Pass `label`
 * for the inline text, or use it bare and pair with your own <Label>.
 *
 * Controlled (`checked` + `onChange`) or uncontrolled (`defaultChecked`).
 */
const Checkbox = forwardRef(function Checkbox(
  { label, className, id, disabled, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-2.5 text-sm text-text",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-border bg-surface transition-colors checked:border-primary checked:bg-primary hover:border-slate-300 checked:hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
          {...props}
        />
        {/* Check mark — only visible when the peer input is checked. */}
        <Check
          className="pointer-events-none h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      {label && <span className="select-none">{label}</span>}
    </label>
  );
});

export default Checkbox;
