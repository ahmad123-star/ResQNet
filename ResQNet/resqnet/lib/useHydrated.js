"use client";

import { useSyncExternalStore } from "react";

// No-op subscription: the hydrated value never changes after mount.
const noopSubscribe = () => () => {};

/**
 * useHydrated — returns false during SSR / first render, true once the
 * component has hydrated on the client.
 *
 * Used to gate `createPortal(..., document.body)` so we don't touch the DOM
 * on the server. Implemented with useSyncExternalStore (rather than a
 * setState-in-useEffect) so it's hydration-safe and doesn't trigger
 * cascading renders.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
