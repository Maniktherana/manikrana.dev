import { useSyncExternalStore } from "react";
import { featured, type WorkList } from "@/components/work/registry";

// Only one tile is named: unmatched named tiles show as blank boxes over the page mid-transition.
// A home tile morphs only into its page; closing a page always morphs into its tile on /work.
let target: { slug: string; list: WorkList } | undefined;
const listeners = new Set<() => void>();

export function setTransitionTarget(slug: string, list: WorkList) {
  if (target?.slug === slug && target.list === list) return;
  target = { slug, list };
  for (const listener of listeners) listener();
}

/** Whether closing to `pathname` can morph the item back into a tile that page shows. */
export function morphsInto(pathname: string) {
  if (pathname === "/work") return target?.list === "work";
  if (pathname === "/")
    return target?.list === "home" && featured.some((item) => item.slug === target?.slug);
  return false;
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
