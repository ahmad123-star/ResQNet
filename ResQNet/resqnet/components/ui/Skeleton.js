import { cn } from "@/lib/utils";

/**
 * Skeleton — shimmering placeholder for loading content.
 *
 * Uses the `animate-shimmer` utility defined in globals.css (a light sweep
 * over a grey block). prefers-reduced-motion users get a static grey block.
 *
 * Props:
 *  - className : control size/shape, e.g. "h-4 w-32" or "h-10 w-10 rounded-full"
 */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer rounded-md bg-slate-200/70",
        className
      )}
      {...props}
    />
  );
}
