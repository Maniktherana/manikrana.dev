import { useSyncExternalStore } from "react";

// Only one tile is named: unmatched named tiles show as blank boxes over the page mid-transition.
let target: string | undefined;
const listeners = new Set<() => void>();

export function setTransitionTarget(slug: string) {
  if (target === slug) return;
  target = slug;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTransitionTarget() {
  return useSyncExternalStore(
    subscribe,
    () => target,
    () => undefined,
  );
}
