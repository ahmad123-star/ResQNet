import EmergencyDetail from "./EmergencyDetail";

/**
 * Server component — awaits the dynamic `params` Promise (Next.js 16
 * requirement) and passes `id` as a plain prop to the Client component.
 */
export default async function EmergencyDetailPage({ params }) {
  const { id } = await params;
  return <EmergencyDetail id={id} />;
}
