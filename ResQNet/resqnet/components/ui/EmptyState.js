import { cn } from "@/lib/utils";

/**
 * EmptyState — friendly placeholder when there's no data yet.
 *
 *   <EmptyState
 *     icon={Inbox}
 *     title="No incidents reported"
 *     description="New emergency reports will appear here."
 *     action={<Button>Report incident</Button>}
 *   />
 *
 * Props:
 *  - icon        : a lucide icon component (rendered in a soft red circle)
 *  - title       : heading
 *  - description : supporting text
 *  - action      : optional node (usually a Button)
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      {title && (
        <h3 className="text-base font-semibold text-text">{title}</h3>
      )}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
