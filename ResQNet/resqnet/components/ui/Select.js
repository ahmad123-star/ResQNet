import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Select — native <select>, styled to match Input.
 *
 * Using the native control keeps it accessible and mobile-friendly (the OS
 * picker on phones). Pass <option>s as children, or an `options` array of
 * { value, label }.
 *
 * Props:
 *  - error       : boolean | string
 *  - options     : optional [{ value, label }]
 *  - placeholder : optional disabled first option
 */
const Select = forwardRef(function Select(
  { error, options, placeholder, className, children, ...props },
  ref
) {
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={hasError || undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-surface px-3.5 pr-10 text-sm text-text",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
            hasError
              ? "border-primary"
              : "border-border hover:border-slate-300",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {/* Custom chevron (the native one is hidden via appearance-none). */}
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        />
      </div>
      {typeof error === "string" && error && (
        <p className="mt-1.5 text-xs text-critical-strong">{error}</p>
      )}
    </div>
  );
});

export default Select;
