import { useSyncExternalStore } from "react";

// The one tile that shares its view-transition name with an item page: the
// tile being opened, or the one whose page we are coming back from. Naming
// every tile would leave the rest as card-colored boxes over the page while it
// transitions, since they have nothing to morph into.
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
