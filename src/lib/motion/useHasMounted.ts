"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Returns `false` during server rendering and the initial client render,
 * then `true` after hydration. Prefer this over the classic
 * `useState(false)` + `useEffect(() => setMounted(true))` pattern, which
 * triggers React's `set-state-in-effect` warning about cascading renders.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
