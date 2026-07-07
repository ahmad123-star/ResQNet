import { cn } from "@/lib/utils";

/**
 * Spinner — a simple rotating ring.
 *
 * Pure CSS (Tailwind's `animate-spin`), so it works in Server or Client
 * components. `currentColor` is used for the moving arc, so colour follows
 * the surrounding text colour (e.g. white inside a primary Button).
 *
 * Props:
 *  - size: "sm" | "md" | "lg"   (default "md")
 *  - className: extra classes (e.g. text-primary to tint it)
 */
const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
};

export default function Spinner({ size = "md", className, ...props }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
