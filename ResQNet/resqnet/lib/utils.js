/**
 * cn — tiny className combiner.
 *
 * Accepts any mix of strings, arrays, and falsy values (false/null/undefined),
 * flattens them and joins with spaces. Lets components write conditional
 * classes inline without pulling in clsx/classnames.
 *
 *   cn("px-3", isActive && "bg-primary", ["text-sm", null])
 *   // -> "px-3 bg-primary text-sm"   (when isActive is true)
 */
export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  if (days  < 7)  return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}
