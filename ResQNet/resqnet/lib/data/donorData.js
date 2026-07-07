/**
 * Dummy data for Donor pages.
 * All hardcoded — replace with Supabase queries later.
 */

/* ── Dashboard stat cards ───────────────────────────────────────────────────── */
export const DONOR_STATS = [
  {
    id: "total",
    label: "Total Donated",
    value: "₨ 55,000",
    sub: "Across 6 contributions",
    status: "resolved",
  },
  {
    id: "active",
    label: "Active Contributions",
    value: "2",
    sub: "Funds being deployed",
    status: "pending",
  },
  {
    id: "impact",
    label: "People Helped",
    value: "143",
    sub: "Estimated beneficiaries",
    status: "info",
  },
];

/* ── Donation history ───────────────────────────────────────────────────────── */
// status: "completed" | "processing" | "pending" | "failed"
export const DONATION_HISTORY = [
  {
    id: "DON-211",
    type: "funds",
    amount: "₨ 25,000",
    item: null,
    target: "Flood Relief — North Nazimabad",
    targetType: "emergency",
    date: "3 Jun 2026",
    status: "completed",
    impact: "Helped 48 people",
  },
  {
    id: "DON-209",
    type: "items",
    amount: null,
    item: "50 Blankets",
    target: "Relief Pakistan NGO",
    targetType: "ngo",
    date: "28 May 2026",
    status: "processing",
    impact: null,
  },
  {
    id: "DON-204",
    type: "funds",
    amount: "₨ 10,000",
    item: null,
    target: "Medical Emergency — Gulshan",
    targetType: "emergency",
    date: "20 May 2026",
    status: "completed",
    impact: "Helped 12 people",
  },
  {
    id: "DON-198",
    type: "funds",
    amount: "₨ 5,000",
    item: null,
    target: "General Relief Fund",
    targetType: "ngo",
    date: "10 May 2026",
    status: "completed",
    impact: "Helped 9 people",
  },
  {
    id: "DON-191",
    type: "items",
    amount: null,
    item: "30 First Aid Kits",
    target: "Zara Group NGO",
    targetType: "ngo",
    date: "1 May 2026",
    status: "completed",
    impact: "Helped 74 people",
  },
  {
    id: "DON-183",
    type: "funds",
    amount: "₨ 15,000",
    item: null,
    target: "Earthquake Response",
    targetType: "emergency",
    date: "22 Apr 2026",
    status: "failed",
    impact: null,
  },
];

export const DONATION_STATUS_META = {
  completed:  { badge: "resolved", label: "Completed" },
  processing: { badge: "info",     label: "Processing" },
  pending:    { badge: "pending",  label: "Pending" },
  failed:     { badge: "critical", label: "Failed" },
};

/* ── Donation targets (for donate form dropdowns) ───────────────────────────── */
export const TARGET_NGOS = [
  { value: "ngo-relief-pk",  label: "Relief Pakistan NGO" },
  { value: "ngo-zara",       label: "Zara Group NGO" },
  { value: "ngo-helping",    label: "Helping Hands Foundation" },
  { value: "ngo-bright",     label: "Bright Future NGO" },
];

export const TARGET_EMERGENCIES = [
  { value: "em-1042", label: "REQ-1042 — Flood, North Nazimabad" },
  { value: "em-1041", label: "REQ-1041 — Medical, Gulshan-e-Iqbal" },
  { value: "em-1040", label: "REQ-1040 — Fire, Defence Phase 5" },
  { value: "em-1037", label: "REQ-1037 — Flood, Landhi Industrial Area" },
];

/* ── Suggested amounts ──────────────────────────────────────────────────────── */
export const SUGGESTED_AMOUNTS = [
  { value: "1000",  label: "₨ 1,000" },
  { value: "5000",  label: "₨ 5,000" },
  { value: "10000", label: "₨ 10,000" },
  { value: "25000", label: "₨ 25,000" },
];
