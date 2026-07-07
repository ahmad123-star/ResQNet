/**
 * Dummy data for NGO pages.
 * All hardcoded — replace with real Supabase queries later.
 */

/* ── KPI values ─────────────────────────────────────────────────────────────── */
export const NGO_KPIS = [
  { id: "open",      label: "Open Requests",       value: "14", sub: "3 critical",           status: "critical" },
  { id: "resources", label: "Resources Available",  value: "38", sub: "6 types tracked",      status: "info" },
  { id: "assigned",  label: "Volunteers Assigned",  value: "21", sub: "Across 9 operations",  status: "pending" },
  { id: "resolved",  label: "Resolved This Week",   value: "11", sub: "+4 vs last week",       status: "resolved" },
];

/* ── Emergency requests ─────────────────────────────────────────────────────── */
// status: "open" | "in_progress" | "resolved"
export const REQUESTS = [
  { id: "REQ-1042", category: "Flood",      categoryColor: "bg-info-light text-info-strong",           location: "North Nazimabad, Karachi", severity: "high",   time: "12 min ago",  status: "open",        assignedVolunteer: null,         reportedBy: "Ayesha M." },
  { id: "REQ-1041", category: "Medical",    categoryColor: "bg-critical-light text-critical-strong",   location: "Gulshan-e-Iqbal, Karachi", severity: "high",   time: "1 hr ago",    status: "in_progress", assignedVolunteer: "Hamza R.",    reportedBy: "Imran K." },
  { id: "REQ-1040", category: "Fire",       categoryColor: "bg-critical-light text-critical-strong",   location: "Defence Phase 5",          severity: "medium", time: "2 hrs ago",   status: "open",        assignedVolunteer: null,         reportedBy: "Sara A." },
  { id: "REQ-1039", category: "Accident",   categoryColor: "bg-pending-light text-pending-strong",     location: "Shahrah-e-Faisal",         severity: "medium", time: "3 hrs ago",   status: "in_progress", assignedVolunteer: "Fatima N.",   reportedBy: "Bilal R." },
  { id: "REQ-1038", category: "Earthquake", categoryColor: "bg-pending-light text-pending-strong",     location: "Saddar Town",              severity: "low",    time: "5 hrs ago",   status: "resolved",    assignedVolunteer: "Ali M.",      reportedBy: "Hina B." },
  { id: "REQ-1037", category: "Flood",      categoryColor: "bg-info-light text-info-strong",           location: "Landhi Industrial Area",   severity: "high",   time: "6 hrs ago",   status: "open",        assignedVolunteer: null,         reportedBy: "Nadia S." },
  { id: "REQ-1036", category: "Medical",    categoryColor: "bg-critical-light text-critical-strong",   location: "Clifton Block 9",          severity: "low",    time: "Yesterday",   status: "resolved",    assignedVolunteer: "Usman S.",    reportedBy: "Noman F." },
  { id: "REQ-1035", category: "Other",      categoryColor: "bg-slate-100 text-text-secondary",         location: "Korangi Town",             severity: "low",    time: "2 days ago",  status: "resolved",    assignedVolunteer: "Sara K.",     reportedBy: "Tariq B." },
];

export const REQUEST_STATUS_META = {
  open:        { badge: "critical", label: "Open" },
  in_progress: { badge: "pending",  label: "In Progress" },
  resolved:    { badge: "resolved", label: "Resolved" },
  cancelled:   { badge: "info",     label: "Cancelled" },
};

export const SEVERITY_META = {
  high:   { badge: "critical", label: "High" },
  medium: { badge: "pending",  label: "Medium" },
  low:    { badge: "info",     label: "Low" },
};

/* ── Resources ─────────────────────────────────────────────────────────────── */
// status: "available" | "deployed" | "low"
export const INITIAL_RESOURCES = [
  { id: "r-1", name: "First Aid Kits",    category: "Medical",    quantity: 45, status: "available", unit: "kits" },
  { id: "r-2", name: "Drinking Water",    category: "Supplies",   quantity: 200, status: "available", unit: "litres" },
  { id: "r-3", name: "Blankets",          category: "Shelter",    quantity: 120, status: "deployed",  unit: "pcs" },
  { id: "r-4", name: "Emergency Rations", category: "Food",       quantity: 8,   status: "low",       unit: "boxes" },
  { id: "r-5", name: "Stretchers",        category: "Medical",    quantity: 12,  status: "available", unit: "pcs" },
  { id: "r-6", name: "Tents",             category: "Shelter",    quantity: 0,   status: "low",       unit: "pcs" },
];

export const RESOURCE_STATUS_META = {
  available: { badge: "resolved", label: "Available" },
  deployed:  { badge: "pending",  label: "Deployed" },
  low:       { badge: "critical", label: "Low Stock" },
};

export const RESOURCE_CATEGORIES = [
  "Medical", "Supplies", "Shelter", "Food", "Transport", "Equipment", "Other"
];

export const RESOURCE_STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "deployed",  label: "Deployed" },
  { value: "low",       label: "Low Stock" },
];

/* ── Volunteers (for assign page) ───────────────────────────────────────────── */
export const VOLUNTEERS = [
  { id: "v-1", name: "Hamza Raza",   skills: ["First Aid", "Rescue"], available: true,  taskCount: 2 },
  { id: "v-2", name: "Fatima Noor",  skills: ["Medical", "Driving"],  available: true,  taskCount: 1 },
  { id: "v-3", name: "Ali Mahmood",  skills: ["Rescue", "Shelter"],   available: false, taskCount: 3 },
  { id: "v-4", name: "Sara Khan",    skills: ["First Aid"],           available: true,  taskCount: 0 },
  { id: "v-5", name: "Usman Shah",   skills: ["Logistics"],           available: true,  taskCount: 1 },
  { id: "v-6", name: "Nadia Saleem", skills: ["Counselling", "Comms"],available: false, taskCount: 2 },
];

/* ── Reports summary ────────────────────────────────────────────────────────── */
export const REPORT_SUMMARY = [
  { id: "total",      label: "Total Emergencies",    value: "67",  sub: "All time",            status: "info" },
  { id: "resolved",   label: "Resolved",             value: "49",  sub: "73% resolution rate", status: "resolved" },
  { id: "volunteers", label: "Volunteer Hours",      value: "312", sub: "This month",          status: "pending" },
  { id: "resources",  label: "Resources Deployed",   value: "154", sub: "Units dispatched",    status: "info" },
];

/* ── Status options for manage page ────────────────────────────────────────── */
export const MANAGE_STATUS_OPTIONS = [
  { value: "reported",    label: "Reported" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved" },
];

export const MANAGE_STATUS_META = {
  reported:    { badge: "info",     label: "Reported" },
  in_progress: { badge: "pending",  label: "In Progress" },
  resolved:    { badge: "resolved", label: "Resolved" },
};

/* ── DB ↔ UI mapping helpers ────────────────────────────────────────────────── */

// DB emergency status → requests/assign page key ('open'|'in_progress'|'resolved')
export function dbEmergencyStatusToUi(s) {
  if (s === "Resolved")    return "resolved";
  if (s === "In Progress") return "in_progress";
  if (s === "Cancelled")   return "cancelled";
  return "open";
}

// DB emergency status → manage page key
export function dbStatusToManage(s) {
  if (s === "Resolved")    return "resolved";
  if (s === "In Progress") return "in_progress";
  if (s === "Cancelled")   return "cancelled";
  return "reported";
}

// Manage page key → DB value
export function manageStatusToDb(s) {
  if (s === "resolved")    return "Resolved";
  if (s === "in_progress") return "In Progress";
  return "Reported";
}

// DB severity → UI lowercase key
export function dbSeverityToUi(s) {
  return s?.toLowerCase() ?? "medium";
}

// Category name → colour chip Tailwind classes
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
