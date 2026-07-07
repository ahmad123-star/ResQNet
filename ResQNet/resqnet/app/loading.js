import LoadingScreen from "@/components/ui/LoadingScreen";

/**
 * app/loading.js — Next.js App Router loading UI.
 *
 * Shown automatically while a page segment is loading (Suspense boundary).
 * Renders the branded full-screen heartbeat splash from the design system.
 */
export default function AppLoading() {
  return <LoadingScreen label="Loading…" fullscreen />;
}
