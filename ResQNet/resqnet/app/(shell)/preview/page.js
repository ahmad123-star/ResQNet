import { AlertTriangle, MapPin, Users, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import SkeletonBox from "@/components/ui/Skeleton";

/**
 * /preview — placeholder page for shell testing.
 *
 * Contains enough structure to see the sidebar, header, drawer and bottom nav
 * in context. Resize the browser to test each breakpoint.
 *
 * This is a Server Component (no "use client") — the shell wrapping it
 * supplies all interactivity.
 */

const STAT_CARDS = [
  {
    icon: AlertTriangle,
    label: "Active Incidents",
    value: "12",
    sub: "3 critical · 9 in progress",
    status: "critical",
  },
  {
    icon: MapPin,
    label: "Dispatched Units",
    value: "7",
    sub: "Across 5 sectors",
    status: "pending",
  },
  {
    icon: Users,
    label: "Volunteers On-Duty",
    value: "34",
    sub: "18 available",
    status: "resolved",
  },
  {
    icon: Activity,
    label: "System Status",
    value: "OK",
    sub: "All services nominal",
    status: "info",
  },
];

export default function PreviewPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Shell preview
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Resize the browser to test sidebar (md+), icon rail (tablet), drawer
          + bottom nav (mobile). Switch roles with the ROLE badge in the header.
        </p>
      </div>

      {/* Responsive hint banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">Breakpoints: </span>
        <span className="md:hidden">
          📱 Mobile — drawer + bottom nav active.
        </span>
        <span className="hidden md:inline lg:hidden">
          📟 Tablet — icon-rail sidebar (collapsed by default). Click ›
          to expand.
        </span>
        <span className="hidden lg:inline">
          🖥 Desktop — full sidebar visible. Click Collapse to see the rail.
        </span>
      </div>

      {/* Stat cards grid */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <StatusBadge status={card.status} />
                  </div>
                  <CardTitle>{card.value}</CardTitle>
                  <CardDescription>{card.label}</CardDescription>
                </CardHeader>
                <CardBody>
                  <p className="text-xs text-text-secondary">{card.sub}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent activity (skeleton placeholder) */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text">
          Recent activity
          <span className="ml-2 text-sm font-normal text-text-secondary">
            (skeleton — data loads here)
          </span>
        </h2>
        <Card padded className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonBox className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-3 w-2/3" />
                <SkeletonBox className="h-3 w-1/3" />
              </div>
              <SkeletonBox className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </Card>
      </section>

      {/* Bottom spacer so content isn't hidden behind bottom nav on mobile */}
      <div className="h-4" />
    </div>
  );
}
