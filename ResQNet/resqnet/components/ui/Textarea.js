import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Textarea — multi-line text field. Mirrors Input's styling and error API.
 */
const Textarea = forwardRef(function Textarea(
  { error, className, rows = 4, ...props },
  ref
) {
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={hasError || undefined}
        className={cn(
          "w-full resize-y rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-text",
          "placeholder:text-text-secondary/70",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70",
          hasError
            ? "border-primary"
            : "border-border hover:border-slate-300",
          className
        )}
        {...props}
      />
      {typeof error === "string" && error && (
        <p className="mt-1.5 text-xs text-critical-strong">{error}</p>
      )}
    </div>
  );
});

export default Textarea;
