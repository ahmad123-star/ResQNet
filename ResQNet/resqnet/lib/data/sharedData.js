/**
 * Shared dummy data used by pages that work for every role.
 * Replace with real Supabase queries later.
 */

/* ── Demo user profile (one per role for realistic display) ─────────────────── */
export const DEMO_PROFILES = {
  victim:    { name: "Ayesha Malik",    email: "ayesha@example.com",   phone: "+92 300 1234567", location: "Karachi, Pakistan",  avatar: null },
  volunteer: { name: "Hamza Raza",      email: "hamza@example.com",    phone: "+92 321 9876543", location: "Lahore, Pakistan",   avatar: null },
  ngo:       { name: "Relief Pakistan", email: "relief@ngo.pk",        phone: "+92 21 3456789",  location: "Karachi, Pakistan",  avatar: null },
  admin:     { name: "Admin User",      email: "admin@resqnet.pk",     phone: "+92 51 1234567",  location: "Islamabad, Pakistan",avatar: null },
  donor:     { name: "Ahmed Raza",      email: "ahmed@example.com",    phone: "+92 300 8765432", location: "Lahore, Pakistan",   avatar: null },
};

/* ── Notification preference groups ────────────────────────────────────────── */
export const NOTIF_PREFS = [
  { id: "new_emergency",   label: "New emergency reports",          description: "When a new emergency is submitted near you." },
  { id: "task_updates",    label: "Task and status updates",        description: "When your tasks or reports change status." },
  { id: "new_donation",    label: "Donation confirmations",         description: "When a donation you made is confirmed." },
  { id: "system_alerts",   label: "System alerts",                  description: "Important platform announcements." },
  { id: "weekly_digest",   label: "Weekly digest",                  description: "A weekly summary of activity on your account." },
];

/* ── Notifications list ──────────────────────────────────────────────────────── */
// type: "emergency" | "task" | "donation" | "system" | "resolved"
export const NOTIFICATIONS_DATA = [
  {
    id: "n-1",
    type: "emergency",
    title: "New emergency near you",
    message: "A flood emergency has been reported in North Nazimabad, 1.2 km from you.",
    time: "5 min ago",
    read: false,
  },
  {
    id: "n-2",
    type: "task",
    title: "Task accepted",
    message: "Hamza Raza accepted your flood report and is en route.",
    time: "22 min ago",
    read: false,
  },
  {
    id: "n-3",
    type: "resolved",
    title: "Emergency resolved",
    message: "Emergency #REQ-1039 (Fire, Defence Phase 5) has been marked as resolved.",
    time: "2 hrs ago",
    read: false,
  },
  {
    id: "n-4",
    type: "donation",
    title: "Donation confirmed",
    message: "Your donation of ₨ 10,000 to Medical Emergency #REQ-1041 has been confirmed.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n-5",
    type: "system",
    title: "Welcome to ResQNet",
    message: "Your account is verified. You can now report emergencies, volunteer, and donate.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "n-6",
    type: "task",
    title: "Volunteer availability update",
    message: "3 new volunteers are now available in your area.",
    time: "4 days ago",
    read: true,
  },
];

/* ── Single emergency for the detail page ─────────────────────────────────────
   id = "1042" is consistent with dummy data across other pages.              */
export const EMERGENCY_DETAIL = {
  id: "REQ-1042",
  category: "Flood",
  categoryColor: "bg-info-light text-info-strong",
  severity: "high",
  description:
    "Ground floor flooded due to heavy overnight rain. Water level is rising rapidly. A family of five including two young children and an elderly resident are trapped on the first floor. Entry through the main gate is blocked. The family has been without food and water for approximately 6 hours.",
  location: "House 14, Block 4, North Nazimabad, Karachi",
  coordinates: "24.9204° N, 67.0679° E",
  reportedBy: "Ayesha Malik",
  reportedAt: "Today, 10:15 AM",
  lastUpdated: "Today, 10:47 AM",
  status: "in_progress",
  assignedVolunteer: "Hamza Raza",
  assignedNgo: "Relief Pakistan",
  notes: "Coordinate with the family — ground floor entry is blocked. Approach via back lane.",
  timeline: [
    { label: "Reported",    done: true,  time: "10:15 AM",  detail: "Report submitted by Ayesha Malik" },
    { label: "Acknowledged",done: true,  time: "10:32 AM",  detail: "Assigned to Relief Pakistan NGO" },
    { label: "In Progress", done: true,  time: "10:47 AM",  detail: "Volunteer Hamza Raza dispatched" },
    { label: "Resolved",    done: false, time: null,         detail: null },
  ],
};

/* ── Role-aware action configs for detail page ────────────────────────────────
   Each role sees a different set of action buttons.                           */
export const DETAIL_ACTIONS = {
  victim: [
    { id: "track",    label: "Track on map",    variant: "outline",    icon: "MapPin" },
    { id: "share",    label: "Share report",    variant: "ghost",      icon: "Share2" },
  ],
  volunteer: [
    { id: "accept",   label: "Accept task",     variant: "primary",    icon: "CheckCircle2" },
    { id: "navigate", label: "Navigate here",   variant: "outline",    icon: "Navigation" },
    { id: "update",   label: "Update status",   variant: "secondary",  icon: "RefreshCw" },
  ],
  ngo: [
    { id: "assign",   label: "Assign volunteer",variant: "primary",    icon: "Users" },
    { id: "status",   label: "Update status",   variant: "secondary",  icon: "Settings2" },
    { id: "resource", label: "Deploy resource", variant: "outline",    icon: "Package" },
  ],
  admin: [
    { id: "manage",   label: "Manage request",  variant: "primary",    icon: "Settings2" },
    { id: "logs",     label: "View logs",        variant: "outline",    icon: "ScrollText" },
    { id: "delete",   label: "Delete report",   variant: "danger",     icon: "Trash2" },
  ],
  donor: [
    { id: "donate",   label: "Donate to this",  variant: "primary",    icon: "Heart" },
    { id: "share",    label: "Share",            variant: "ghost",      icon: "Share2" },
  ],
};
