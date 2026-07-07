import { cn } from "@/lib/utils";

/**
 * Label — form field label.
 *
 * Pass `required` to append a red asterisk. Use `htmlFor` to bind it to the
 * matching input id (always do this for accessibility).
 */
export default function Label({ children, required = false, className, ...props }) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium text-text",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-primary" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
