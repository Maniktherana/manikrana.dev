import { useSyncExternalStore } from "react";
import type { WorkList } from "@/work/registry";

// Only one tile is named: unmatched named tiles show as blank boxes over the page mid-transition.
// A home tile morphs only into its page; closing a page always morphs into its tile on /work.
let target: { slug: string; list: WorkList } | undefined;
const listeners = new Set<() => void>();

export function setTransitionTarget(slug: string, list: WorkList) {
  if (target?.slug === slug && target.list === list) return;
  target = { slug, list };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTransitionTarget(list: WorkList) {
  return useSyncExternalStore(
    subscribe,
    () => (target?.list === list ? target.slug : undefined),
    () => undefined,
  );
}
