import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Input — single-line text field.
 *
 * Props:
 *  - error    : boolean | string — red border (and message if a string)
 *  - leftIcon : node rendered inside the field on the left (e.g. a lucide icon)
 *
 * Works as a Server or Client component; it's an uncontrolled/controlled
 * <input> like any other.
 */
const Input = forwardRef(function Input(
  { error, leftIcon, className, type = "text", ...props },
  ref
) {
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-secondary">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          aria-invalid={hasError || undefined}
          className={cn(
            "h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-text",
            "placeholder:text-text-secondary/70",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
            leftIcon && "pl-10",
            hasError
              ? "border-primary focus-visible:outline-primary"
              : "border-border hover:border-slate-300",
            className
          )}
          {...props}
        />
      </div>
      {typeof error === "string" && error && (
        <p className="mt-1.5 text-xs text-critical-strong">{error}</p>
      )}
    </div>
  );
});

export default Input;
