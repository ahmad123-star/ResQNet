import { cn } from "@/lib/utils";

/**
 * StatusBadge — a pill that colours itself from a `status` prop.
 *
 *   <StatusBadge status="critical" />        -> "Critical"
 *   <StatusBadge status="pending">Queued</StatusBadge>
 *
 * Supported statuses: critical | pending | resolved | info.
 * Each maps to a light tinted background + an accessible (darkened) text
 * colour + a matching dot. Unknown statuses fall back to a neutral grey.
 *
 * Props:
 *  - status : one of the keys above
 *  - dot    : show the leading status dot (default true)
 *  - children : custom label; defaults to a sensible label per status
 */
const STATUS_STYLES = {
  critical: {
    label: "Critical",
    className: "bg-critical-light text-critical-strong",
    dot: "bg-critical",
  },
  pending: {
    label: "Pending",
    className: "bg-pending-light text-pending-strong",
    dot: "bg-pending",
  },
  resolved: {
    label: "Resolved",
    className: "bg-resolved-light text-resolved-strong",
    dot: "bg-resolved",
  },
  info: {
    label: "Info",
    className: "bg-info-light text-info-strong",
    dot: "bg-info",
  },
};

const NEUTRAL = {
  label: "Unknown",
  className: "bg-slate-100 text-text-secondary",
  dot: "bg-slate-400",
};

export default function StatusBadge({
  status,
  dot = true,
  className,
  children,
  ...props
}) {
  const style = STATUS_STYLES[status] || NEUTRAL;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        style.className,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", style.dot)}
          aria-hidden="true"
        />
      )}
      {children || style.label}
    </span>
  );
}
