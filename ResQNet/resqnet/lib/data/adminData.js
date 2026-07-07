/**
 * Dummy data for Admin pages.
 * All hardcoded — replace with Supabase queries later.
 */

/* ── Dashboard KPIs ─────────────────────────────────────────────────────────── */
export const ADMIN_KPIS = [
  { id: "users",       label: "Total Users",         value: "1,284", sub: "+23 this week",          status: "info" },
  { id: "emergencies", label: "Active Emergencies",  value: "17",    sub: "5 critical right now",   status: "critical" },
  { id: "ngos",        label: "Partner NGOs",        value: "52",    sub: "8 pending approval",     status: "pending" },
  { id: "donations",   label: "Total Donations",     value: "₨ 2.4M", sub: "Across 148 campaigns", status: "resolved" },
];

/* ── System status checks ───────────────────────────────────────────────────── */
export const SYSTEM_CHECKS = [
  { id: "db",    label: "Database",       ok: true },
  { id: "auth",  label: "Auth Service",   ok: true },
  { id: "notif", label: "Notifications",  ok: true },
  { id: "store", label: "File Storage",   ok: true },
  { id: "cdn",   label: "CDN / Delivery", ok: true },
];

/* ── Users ──────────────────────────────────────────────────────────────────── */
export const INITIAL_USERS = [
  { id: "u-1",  name: "Ayesha Malik",   email: "ayesha@example.com",   role: "victim",    status: "active" },
  { id: "u-2",  name: "Hamza Raza",     email: "hamza@example.com",    role: "volunteer", status: "active" },
  { id: "u-3",  name: "Relief PK NGO", email: "relief@ngo.pk",        role: "ngo",       status: "active" },
  { id: "u-4",  name: "Sara Khan",      email: "sara@example.com",     role: "volunteer", status: "active" },
  { id: "u-5",  name: "Ahmed Donor",    email: "ahmed@example.com",    role: "donor",     status: "blocked" },
  { id: "u-6",  name: "Nadia Saleem",   email: "nadia@example.com",    role: "victim",    status: "active" },
  { id: "u-7",  name: "Bilal Rashid",   email: "bilal@example.com",    role: "volunteer", status: "active" },
  { id: "u-8",  name: "Fatima Noor",    email: "fatima@example.com",   role: "volunteer", status: "blocked" },
  { id: "u-9",  name: "Zara Hussain",   email: "zara@ngo.com",         role: "ngo",       status: "active" },
  { id: "u-10", name: "Usman Shah",     email: "usman@example.com",    role: "donor",     status: "active" },
];

export const ROLE_BADGE = {
  victim:    { badge: "critical", label: "Victim" },
  volunteer: { badge: "pending",  label: "Volunteer" },
  ngo:       { badge: "info",     label: "NGO" },
  donor:     { badge: "resolved", label: "Donor" },
  admin:     { badge: "info",     label: "Admin" },
};

/* ── Categories ─────────────────────────────────────────────────────────────── */
export const INITIAL_CATEGORIES = [
  { id: "cat-1", name: "Flood",       icon: "🌊", description: "Flash floods, river overflow, waterlogging",   active: true },
  { id: "cat-2", name: "Fire",        icon: "🔥", description: "Building fires, wildfires, gas explosions",    active: true },
  { id: "cat-3", name: "Earthquake",  icon: "🏔️", description: "Seismic events and structural damage",         active: true },
  { id: "cat-4", name: "Medical",     icon: "🏥", description: "Medical emergencies requiring urgent care",    active: true },
  { id: "cat-5", name: "Accident",    icon: "🚗", description: "Road accidents and industrial incidents",      active: true },
  { id: "cat-6", name: "Other",       icon: "⚠️", description: "Emergencies that don't fit other categories",  active: false },
];

export const EMPTY_CATEGORY = { name: "", icon: "", description: "", active: true };

/* ── Donations ──────────────────────────────────────────────────────────────── */
export const DONATIONS = [
  { id: "DON-101", donor: "Ahmed Raza",   type: "monetary", amount: "₨ 25,000", item: null,           status: "completed",  date: "3 Jun 2026" },
  { id: "DON-102", donor: "Relief PK",    type: "in-kind",  amount: null,        item: "50 Blankets",  status: "completed",  date: "3 Jun 2026" },
  { id: "DON-103", donor: "Sara Hussain", type: "monetary", amount: "₨ 10,000", item: null,           status: "pending",    date: "2 Jun 2026" },
  { id: "DON-104", donor: "Tech Corp",    type: "monetary", amount: "₨ 100,000",item: null,           status: "completed",  date: "1 Jun 2026" },
  { id: "DON-105", donor: "Bilal Ahmed",  type: "in-kind",  amount: null,        item: "100 Water Btls",status:"processing", date: "31 May 2026"},
  { id: "DON-106", donor: "Nadia Khan",   type: "monetary", amount: "₨ 5,000",  item: null,           status: "failed",     date: "30 May 2026" },
  { id: "DON-107", donor: "Zara Group",   type: "in-kind",  amount: null,        item: "20 Tents",     status: "completed",  date: "29 May 2026" },
  { id: "DON-108", donor: "Usman Ali",    type: "monetary", amount: "₨ 15,000", item: null,           status: "pending",    date: "28 May 2026" },
];

export const DONATION_STATUS = {
  completed:  { badge: "resolved", label: "Completed" },
  pending:    { badge: "pending",  label: "Pending" },
  processing: { badge: "info",     label: "Processing" },
  failed:     { badge: "critical", label: "Failed" },
};

/* ── System Logs ────────────────────────────────────────────────────────────── */
export const SYSTEM_LOGS = [
  { id: "log-1",  time: "2026-06-03 12:41:05", user: "system",        action: "Scheduled backup completed successfully.",                 level: "info" },
  { id: "log-2",  time: "2026-06-03 12:38:14", user: "admin@resqnet", action: "User u-5 (Ahmed Donor) blocked.",                        level: "warn" },
  { id: "log-3",  time: "2026-06-03 12:30:00", user: "system",        action: "New emergency REQ-1042 created (Flood — High).",          level: "info" },
  { id: "log-4",  time: "2026-06-03 12:15:22", user: "hamza@example", action: "Volunteer accepted task for REQ-1041.",                   level: "info" },
  { id: "log-5",  time: "2026-06-03 11:59:44", user: "admin@resqnet", action: "Category 'Other' deactivated.",                          level: "warn" },
  { id: "log-6",  time: "2026-06-03 11:45:00", user: "system",        action: "Email notification sent to 14 subscribers.",             level: "info" },
  { id: "log-7",  time: "2026-06-03 11:30:17", user: "relief@ngo.pk", action: "Resource 'Blankets' status set to Deployed.",            level: "info" },
  { id: "log-8",  time: "2026-06-03 11:10:03", user: "system",        action: "Auth token refreshed for 43 active sessions.",           level: "info" },
  { id: "log-9",  time: "2026-06-03 10:55:30", user: "admin@resqnet", action: "New NGO 'Zara Group' approved.",                         level: "info" },
  { id: "log-10", time: "2026-06-03 10:44:12", user: "system",        action: "Database connection pool exhausted — retried.",          level: "error" },
  { id: "log-11", time: "2026-06-03 10:30:01", user: "sara@example",  action: "User registered (role: volunteer).",                     level: "info" },
  { id: "log-12", time: "2026-06-03 10:15:48", user: "system",        action: "Cron job: volunteer proximity check completed.",         level: "info" },
];

export const LOG_LEVEL_META = {
  info:  { dot: "bg-info",     text: "text-info-strong",     badge: "info" },
  warn:  { dot: "bg-pending",  text: "text-pending-strong",  badge: "pending" },
  error: { dot: "bg-primary",  text: "text-critical-strong", badge: "critical" },
};

/* ── Admin reports summary ──────────────────────────────────────────────────── */
export const ADMIN_REPORTS = [
  { id: "total-em",  label: "Total Emergencies",  value: "324", sub: "Since launch",         status: "info" },
  { id: "resolved",  label: "Resolved",           value: "289", sub: "89% resolution rate",  status: "resolved" },
  { id: "users-reg", label: "Users Registered",   value: "1,284",sub: "+23 this week",       status: "info" },
  { id: "donations", label: "Donations Received", value: "148",  sub: "₨ 2.4M total",       status: "resolved" },
];

/* ── Notification events ────────────────────────────────────────────────────── */
export const NOTIF_EVENTS = [
  { id: "new_emergency",   label: "New emergency reported",   description: "When a victim submits a new emergency report." },
  { id: "task_accepted",   label: "Task accepted",            description: "When a volunteer accepts an emergency task." },
  { id: "status_update",   label: "Emergency status updated", description: "When an NGO updates an emergency's status." },
  { id: "new_donation",    label: "New donation received",    description: "When a donor completes a donation." },
  { id: "user_registered", label: "New user registered",      description: "When anyone creates a new account." },
  { id: "volunteer_avail", label: "Volunteer availability change", description: "When a volunteer toggles their availability." },
];

export const NOTIF_CHANNELS = [
  { id: "in_app", label: "In-app",   description: "Bell icon notifications inside the platform." },
  { id: "email",  label: "Email",    description: "Send email to affected users and admins." },
  { id: "sms",    label: "SMS",      description: "Text message alerts (premium, requires config)." },
];

/* ── DB ↔ UI mapping helpers ────────────────────────────────────────────────── */

// DB donation type ('Funds'|'Items') → UI key used by filter chips
export function dbDonationTypeToUi(t) {
  return t === "Items" ? "in-kind" : "monetary";
}

// DB donation status → lowercase UI key matching DONATION_STATUS keys
export function dbDonationStatusToUi(s) {
  return s?.toLowerCase() ?? "pending";
}

/* ── Performance metrics ────────────────────────────────────────────────────── */
export const PERF_METRICS = [
  { id: "uptime",    label: "Uptime",           value: "99.97 %", sub: "Last 30 days",        status: "resolved", trend: "+0.02%" },
  { id: "resp",      label: "Avg Response Time",value: "142 ms",  sub: "API endpoints",       status: "resolved", trend: "-8 ms" },
  { id: "sessions",  label: "Active Sessions",  value: "43",      sub: "Authenticated users", status: "info",     trend: "+5" },
  { id: "errors",    label: "Error Rate",       value: "0.12 %",  sub: "Last 24 hours",       status: "pending",  trend: "+0.02%" },
];
