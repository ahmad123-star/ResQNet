import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Bell,
  User,
  MapPin,
  ClipboardList,
  Package,
  Users,
  BarChart2,
  Settings,
  Activity,
  Heart,
  Tag,
  HandCoins,
  ScrollText,
} from "lucide-react";

/**
 * Navigation configuration keyed by role.
 *
 * Each item: { label, href, icon }
 * The first item is always the role's "home" (Dashboard).
 * `bottomNav` lists the 4 hrefs to surface in the mobile bottom bar;
 * `primaryAction` is the most critical action for that role (shown as
 * the prominent SOS/FAB on mobile).
 */
export const NAV_CONFIG = {
  victim: {
    items: [
      { label: "Dashboard",        href: "/victim/dashboard",      icon: LayoutDashboard },
      { label: "Report Emergency", href: "/victim/report",         icon: AlertTriangle },
      { label: "My Emergencies",   href: "/victim/my-emergencies", icon: FileText },
      { label: "Notifications",    href: "/notifications",         icon: Bell },
      { label: "Profile",          href: "/profile",               icon: User },
    ],
    bottomNav:     ["/victim/dashboard", "/victim/report", "/victim/my-emergencies", "/notifications"],
    primaryAction: { label: "Report Emergency", href: "/victim/report", icon: AlertTriangle },
  },

  volunteer: {
    items: [
      { label: "Dashboard",          href: "/volunteer/dashboard",       icon: LayoutDashboard },
      { label: "Nearby Emergencies", href: "/volunteer/nearby",          icon: MapPin },
      { label: "My Tasks",           href: "/volunteer/my-tasks",        icon: ClipboardList },
      { label: "Notifications",      href: "/notifications",             icon: Bell },
      { label: "Profile",            href: "/profile",                   icon: User },
    ],
    bottomNav:     ["/volunteer/dashboard", "/volunteer/nearby", "/volunteer/my-tasks", "/notifications"],
    primaryAction: { label: "Nearby Emergencies", href: "/volunteer/nearby", icon: MapPin },
  },

  ngo: {
    items: [
      { label: "Dashboard",        href: "/ngo/dashboard", icon: LayoutDashboard },
      { label: "Emergency Reqs",   href: "/ngo/requests",  icon: AlertTriangle },
      { label: "Resources",        href: "/ngo/resources", icon: Package },
      { label: "Assign Volunteers",href: "/ngo/assign",    icon: Users },
      { label: "Reports",          href: "/ngo/reports",   icon: BarChart2 },
      { label: "Notifications",    href: "/notifications", icon: Bell },
      { label: "Profile",          href: "/profile",       icon: User },
    ],
    bottomNav:     ["/ngo/dashboard", "/ngo/requests", "/ngo/resources", "/notifications"],
    primaryAction: { label: "Emergency Requests", href: "/ngo/requests", icon: AlertTriangle },
  },

  admin: {
    items: [
      { label: "Dashboard",          href: "/admin/dashboard",              icon: LayoutDashboard },
      { label: "Users",              href: "/admin/users",                  icon: Users },
      { label: "Categories",         href: "/admin/categories",             icon: Tag },
      { label: "Donations",          href: "/admin/donations",              icon: HandCoins },
      { label: "System Logs",        href: "/admin/logs",                   icon: ScrollText },
      { label: "Reports",            href: "/admin/reports",                icon: BarChart2 },
      { label: "Configure Notifs",   href: "/admin/notifications-config",   icon: Settings },
      { label: "System Performance", href: "/admin/performance",            icon: Activity },
      { label: "Profile",            href: "/profile",                      icon: User },
    ],
    bottomNav:     ["/admin/dashboard", "/admin/users", "/admin/logs", "/admin/reports"],
    primaryAction: { label: "System Logs", href: "/admin/logs", icon: ScrollText },
  },

  donor: {
    items: [
      { label: "Dashboard",    href: "/donor/dashboard",    icon: LayoutDashboard },
      { label: "Donate",       href: "/donor/donate",       icon: Heart },
      { label: "My Donations", href: "/donor/my-donations", icon: HandCoins },
      { label: "Notifications",href: "/notifications",      icon: Bell },
      { label: "Profile",      href: "/profile",            icon: User },
    ],
    bottomNav:     ["/donor/dashboard", "/donor/donate", "/donor/my-donations", "/notifications"],
    primaryAction: { label: "Donate", href: "/donor/donate", icon: Heart },
  },
};

export const ROLES = Object.keys(NAV_CONFIG);
