/**
 * Dummy data for Victim pages.
 * All hardcoded — no database calls. Replace with real Supabase queries later.
 */

/* ── Emergency category metadata ───────────────────────────────────────────── */
export const CATEGORIES = [
  { value: "flood",      label: "Flood",       color: "bg-info-light text-info-strong" },
  { value: "fire",       label: "Fire",        color: "bg-critical-light text-critical-strong" },
  { value: "earthquake", label: "Earthquake",  color: "bg-pending-light text-pending-strong" },
  { value: "accident",   label: "Accident",    color: "bg-pending-light text-pending-strong" },
  { value: "medical",    label: "Medical",     color: "bg-critical-light text-critical-strong" },
  { value: "other",      label: "Other",       color: "bg-slate-100 text-text-secondary" },
];

export function getCategoryMeta(value) {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[5];
}

/* ── Severity options ───────────────────────────────────────────────────────── */
export const SEVERITY_OPTIONS = [
  { value: "low",    label: "Low — situation is manageable" },
  { value: "medium", label: "Medium — needs attention soon" },
  { value: "high",   label: "High — immediate danger" },
];

/* ── Dashboard stat cards ───────────────────────────────────────────────────── */
export const DASHBOARD_STATS = [
  {
    id: "active",
    label: "Active Emergencies",
    value: "2",
    sub: "1 critical, 1 in progress",
    status: "critical",
  },
  {
    id: "resolved",
    label: "Resolved",
    value: "7",
    sub: "Last 30 days",
    status: "resolved",
  },
  {
    id: "nearby",
    label: "Volunteers Nearby",
    value: "14",
    sub: "Within 5 km",
    status: "info",
  },
];

/* ── Recent activity feed (dashboard) ──────────────────────────────────────── */
export const RECENT_ACTIVITY = [
  {
    id: "act-1",
    text: "A volunteer was assigned to your flood report.",
    time: "10 min ago",
    status: "pending",
  },
  {
    id: "act-2",
    text: "Emergency #1042 has been marked In Progress.",
    time: "35 min ago",
    status: "pending",
  },
  {
    id: "act-3",
    text: "Emergency #1039 resolved — medical assistance provided.",
    time: "2 hrs ago",
    status: "resolved",
  },
  {
    id: "act-4",
    text: "NGO \"Relief Pakistan\" accepted your request.",
    time: "Yesterday",
    status: "info",
  },
  {
    id: "act-5",
    text: "Emergency #1035 resolved — fire extinguished.",
    time: "2 days ago",
    status: "resolved",
  },
];

/* ── Full emergency list (my-emergencies) ───────────────────────────────────── */
//
// status: "active" | "in_progress" | "resolved"
// severity: "low" | "medium" | "high"
// timeline: ordered steps with done flag
//
export const MY_EMERGENCIES = [
  {
    id: "1042",
    category: "flood",
    severity: "high",
    description: "Ground floor flooding due to heavy rain. Water level rising.",
    location: "Block 4, North Nazimabad, Karachi",
    time: "2 hrs ago",
    date: "2026-06-03T10:15:00",
    status: "active",
    assignedVolunteer: "Hamza Raza",
    timeline: [
      { label: "Reported",    done: true,  time: "10:15 AM" },
      { label: "In Progress", done: true,  time: "10:47 AM" },
      { label: "Resolved",    done: false, time: null },
    ],
  },
  {
    id: "1041",
    category: "medical",
    severity: "high",
    description: "Elderly resident collapsed, needs urgent medical attention.",
    location: "House 12, Gulshan-e-Iqbal, Karachi",
    time: "5 hrs ago",
    date: "2026-06-03T07:30:00",
    status: "in_progress",
    assignedVolunteer: "Sara Khan",
    timeline: [
      { label: "Reported",    done: true,  time: "7:30 AM" },
      { label: "In Progress", done: true,  time: "7:52 AM" },
      { label: "Resolved",    done: false, time: null },
    ],
  },
  {
    id: "1039",
    category: "fire",
    severity: "medium",
    description: "Kitchen fire, small area. Contained with help from neighbours.",
    location: "Flat 6B, Defence Phase 2, Karachi",
    time: "2 days ago",
    date: "2026-06-01T14:00:00",
    status: "resolved",
    assignedVolunteer: "Ali Mahmood",
    timeline: [
      { label: "Reported",    done: true, time: "2:00 PM" },
      { label: "In Progress", done: true, time: "2:18 PM" },
      { label: "Resolved",    done: true, time: "3:05 PM" },
    ],
  },
  {
    id: "1035",
    category: "accident",
    severity: "medium",
    description: "Road accident at main chowk, two injured.",
    location: "Shahrah-e-Faisal, Karachi",
    time: "4 days ago",
    date: "2026-05-30T09:20:00",
    status: "resolved",
    assignedVolunteer: "Fatima Noor",
    timeline: [
      { label: "Reported",    done: true, time: "9:20 AM" },
      { label: "In Progress", done: true, time: "9:35 AM" },
      { label: "Resolved",    done: true, time: "10:10 AM" },
    ],
  },
  {
    id: "1033",
    category: "earthquake",
    severity: "low",
    description: "Minor tremor felt, checking for structural damage.",
    location: "Landhi Industrial Area, Karachi",
    time: "5 days ago",
    date: "2026-05-29T06:05:00",
    status: "resolved",
    assignedVolunteer: "Usman Shah",
    timeline: [
      { label: "Reported",    done: true, time: "6:05 AM" },
      { label: "In Progress", done: true, time: "6:30 AM" },
      { label: "Resolved",    done: true, time: "7:45 AM" },
    ],
  },
];

/* ── Status → StatusBadge prop mapping ─────────────────────────────────────── */
export const STATUS_MAP = {
  active:      { badge: "critical", label: "Active" },
  in_progress: { badge: "pending",  label: "In Progress" },
  resolved:    { badge: "resolved", label: "Resolved" },
  cancelled:   { badge: "info",     label: "Cancelled" },
};

// Maps DB status values → UI keys above.
export function dbStatusToUi(dbStatus) {
  if (dbStatus === "Resolved")    return "resolved";
  if (dbStatus === "In Progress") return "in_progress";
  if (dbStatus === "Cancelled")   return "cancelled";
  return "active"; // 'Reported'
}

// Maps DB severity ('Low' | 'Medium' | 'High') → lowercase UI key.
export function dbSeverityToUi(dbSeverity) {
  return dbSeverity?.toLowerCase() ?? "medium";
}

// Maps UI severity ('low' | 'medium' | 'high') → DB value.
export function uiSeverityToDb(uiSeverity) {
  if (!uiSeverity) return "Medium";
  return uiSeverity.charAt(0).toUpperCase() + uiSeverity.slice(1);
}

// Builds the timeline from a DB status string.
export function buildTimeline(dbStatus, createdAt) {
  const fmt = (d) => d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
  if (dbStatus === "Cancelled") {
    return [
      { label: "Reported",  done: true, time: fmt(createdAt) },
      { label: "Cancelled", done: true, time: "—" },
    ];
  }
  const inProgress = dbStatus === "In Progress" || dbStatus === "Resolved";
  const resolved   = dbStatus === "Resolved";
  return [
    { label: "Reported",    done: true,        time: fmt(createdAt) },
    { label: "In Progress", done: inProgress,   time: inProgress ? "—" : null },
    { label: "Resolved",    done: resolved,     time: resolved ? "—" : null },
  ];
}

// Category name → colour chip (matches seed.sql names, case-insensitive).
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

/* ── Severity colour chips ──────────────────────────────────────────────────── */
export const SEVERITY_MAP = {
  low:    { label: "Low",    className: "bg-resolved-light text-resolved-strong" },
  medium: { label: "Medium", className: "bg-pending-light text-pending-strong" },
  high:   { label: "High",   className: "bg-critical-light text-critical-strong" },
};
