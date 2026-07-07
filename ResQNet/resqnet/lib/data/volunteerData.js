/**
 * Dummy data for Volunteer pages.
 * All hardcoded — replace with real Supabase queries later.
 */

/* ── Dashboard stat cards ───────────────────────────────────────────────────── */
export const VOLUNTEER_STATS = [
  {
    id: "accepted",
    label: "Tasks Accepted",
    value: "8",
    sub: "This month",
    status: "info",
  },
  {
    id: "completed",
    label: "Completed",
    value: "23",
    sub: "All time",
    status: "resolved",
  },
  {
    id: "nearby",
    label: "Nearby Emergencies",
    value: "5",
    sub: "Within 10 km right now",
    status: "critical",
  },
];

/* ── Nearby emergencies (used on /volunteer/nearby) ────────────────────────── */
// distance_km drives the filter control; severity maps to StatusBadge status.
export const NEARBY_EMERGENCIES = [
  {
    id: "n-1001",
    category: "flood",
    categoryLabel: "Flood",
    categoryColor: "bg-info-light text-info-strong",
    severity: "high",
    description: "Ground floor flooded, family with young children needs evacuation.",
    location: "Block 7, North Nazimabad",
    distance_km: 1.2,
    time: "12 min ago",
    reportedBy: "Ayesha M.",
    accepted: false,
  },
  {
    id: "n-1002",
    category: "medical",
    categoryLabel: "Medical",
    categoryColor: "bg-critical-light text-critical-strong",
    severity: "high",
    description: "Elderly man with chest pain, no ambulance available.",
    location: "Gulshan-e-Iqbal Block 3",
    distance_km: 2.3,
    time: "28 min ago",
    reportedBy: "Imran K.",
    accepted: false,
  },
  {
    id: "n-1003",
    category: "fire",
    categoryLabel: "Fire",
    categoryColor: "bg-critical-light text-critical-strong",
    severity: "medium",
    description: "Small kitchen fire, smoke still coming from window.",
    location: "Defence Phase 5",
    distance_km: 3.7,
    time: "45 min ago",
    reportedBy: "Sara A.",
    accepted: false,
  },
  {
    id: "n-1004",
    category: "accident",
    categoryLabel: "Accident",
    categoryColor: "bg-pending-light text-pending-strong",
    severity: "medium",
    description: "Two-vehicle collision, one person trapped inside.",
    location: "Shahrah-e-Faisal near Teen Talwar",
    distance_km: 5.1,
    time: "1 hr ago",
    reportedBy: "Bilal R.",
    accepted: false,
  },
  {
    id: "n-1005",
    category: "earthquake",
    categoryLabel: "Earthquake",
    categoryColor: "bg-pending-light text-pending-strong",
    severity: "low",
    description: "Minor tremor felt, checking for structural damage in old building.",
    location: "Saddar Town",
    distance_km: 7.8,
    time: "2 hrs ago",
    reportedBy: "Hina B.",
    accepted: false,
  },
  {
    id: "n-1006",
    category: "other",
    categoryLabel: "Other",
    categoryColor: "bg-slate-100 text-text-secondary",
    severity: "low",
    description: "Child lost, parents requesting help searching the area.",
    location: "Clifton Block 9",
    distance_km: 9.4,
    time: "3 hrs ago",
    reportedBy: "Nadia S.",
    accepted: false,
  },
];

/* ── My tasks (accepted tasks for /volunteer/my-tasks) ─────────────────────── */
// status: "accepted" | "in_progress" | "completed"
export const MY_TASKS = [
  {
    id: "t-1001",
    emergencyId: "n-1001",
    category: "flood",
    categoryLabel: "Flood",
    categoryColor: "bg-info-light text-info-strong",
    severity: "high",
    description: "Ground floor flooded, family with young children needs evacuation.",
    location: "Block 7, North Nazimabad",
    distance_km: 1.2,
    acceptedAt: "Today, 10:32 AM",
    reportedBy: "Ayesha M.",
    status: "in_progress",
    notes: "Coordinate with the family — ground floor entry is blocked.",
  },
  {
    id: "t-1002",
    emergencyId: "n-1003",
    category: "fire",
    categoryLabel: "Fire",
    categoryColor: "bg-critical-light text-critical-strong",
    severity: "medium",
    description: "Small kitchen fire, smoke still coming from window.",
    location: "Defence Phase 5",
    distance_km: 3.7,
    acceptedAt: "Today, 9:15 AM",
    reportedBy: "Sara A.",
    status: "accepted",
    notes: null,
  },
  {
    id: "t-1003",
    emergencyId: "old-887",
    category: "medical",
    categoryLabel: "Medical",
    categoryColor: "bg-critical-light text-critical-strong",
    severity: "high",
    description: "Diabetic patient needed insulin — delivered and stable.",
    location: "Gulshan Block 13",
    distance_km: 2.1,
    acceptedAt: "Yesterday, 4:00 PM",
    reportedBy: "Noman F.",
    status: "completed",
    notes: "Patient stable, family informed.",
  },
];

/* ── Severity meta ──────────────────────────────────────────────────────────── */
export const SEVERITY_BADGE = {
  high:   { status: "critical", label: "High" },
  medium: { status: "pending",  label: "Medium" },
  low:    { status: "info",     label: "Low" },
};

/* ── Task status config ─────────────────────────────────────────────────────── */
export const TASK_STATUSES = [
  { value: "accepted",    label: "Accepted",    next: "in_progress",  nextLabel: "Start task" },
  { value: "in_progress", label: "In Progress", next: "completed",    nextLabel: "Mark complete" },
  { value: "completed",   label: "Completed",   next: null,           nextLabel: null },
];

export const TASK_STATUS_META = {
  accepted:    { badge: "info",     label: "Accepted" },
  in_progress: { badge: "pending",  label: "In Progress" },
  completed:   { badge: "resolved", label: "Completed" },
};

/* ── Filter distance options ────────────────────────────────────────────────── */
export const DISTANCE_FILTERS = [
  { value: 2,   label: "Within 2 km" },
  { value: 5,   label: "Within 5 km" },
  { value: 10,  label: "Within 10 km" },
  { value: 999, label: "All distances" },
];

/* ── DB ↔ UI mapping helpers ────────────────────────────────────────────────── */

// DB task status ('Accepted'|'In Progress'|'Completed') → UI key
export function dbTaskStatusToUi(s) {
  if (s === "Completed")  return "completed";
  if (s === "In Progress") return "in_progress";
  return "accepted";
}

// UI task status key → DB value
export function uiTaskStatusToDb(s) {
  if (s === "completed")  return "Completed";
  if (s === "in_progress") return "In Progress";
  return "Accepted";
}

// DB severity ('Low'|'Medium'|'High') → lowercase UI key
export function dbSeverityToUi(s) {
  return s?.toLowerCase() ?? "medium";
}

// Category name → colour chip class (matches victimData colours)
const CATEGORY_COLORS = {
  flood:      "bg-info-light text-info-strong",
  fire:       "bg-critical-light text-critical-strong",
  earthquake: "bg-pending-light text-pending-strong",
  accident:   "bg-pending-light text-pending-strong",
  medical:    "bg-critical-light text-critical-strong",
  other:      "bg-slate-100 text-text-secondary",
};

export function getCategoryColor(name) {
  return CATEGORY_COLORS[name?.toLowerCase()] ?? CATEGORY_COLORS.other;
}

/* ── Haversine distance (km) ────────────────────────────────────────────────── */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
