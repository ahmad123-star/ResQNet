import { cn } from "@/lib/utils";

/**
 * Avatar — user/entity image with graceful fallback to initials.
 *
 * If `src` is provided it renders the image; otherwise (or while you only
 * have a name) it shows initials derived from `name` on a soft red tint.
 *
 * Props:
 *  - src   : image URL (optional)
 *  - name  : full name, used for initials + alt text
 *  - size  : "sm" | "md" | "lg"
 */
const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ src, name = "", size = "md", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-primary-light font-semibold text-primary",
        "ring-1 ring-inset ring-primary/10",
        SIZES[size],
        className
      )}
      {...props}
    >
      {src ? (
        // Plain <img> keeps the component simple and avatar URLs are often
        // remote/dynamic; swap for next/image where domains are configured.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
}
