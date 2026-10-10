import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { Link } from "@tanstack/react-router";
import { cn } from "@manikrana/ui/lib/utils";
import { preloadPreviews, previews } from "@/work/previews";
import { tileAspects, work, type Filter, type WorkItem } from "@/work/registry";
import { setTransitionTarget, useTransitionTarget } from "@/work/transition";

export function WorkGrid({ filter }: { filter: Filter }) {
  const [shown, setShown] = useState(filter);
  const [switched, setSwitched] = useState(false);
  if (filter !== shown) {
    setShown(filter);
    setSwitched(true);
  }
  useEffect(() => {
    const id = window.setTimeout(preloadPreviews, 1000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <ul
      style={{ "--tiles": work.filter((item) => item.kind === filter).length } as CSSProperties}
      className="work-grid mx-auto grid grid-flow-row-dense auto-rows-[--spacing(1)] gap-x-3"
    >
      {work.map((item) => (
        <WorkTile key={item.slug} item={item} filter={filter} fade={switched} />
      ))}
    </ul>
  );
}

// Until measured, a tile spans as in the widest column: a quarter of max-w-work (90rem).
const ROW = 4;
const GAP = 12;
const WIDEST_COLUMN = (1440 - 3 * GAP) / 4;

// After a filter switch, tiles fade in as they are unhidden; on mount they are left for the page transition.
function WorkTile({ item, filter, fade }: { item: WorkItem; filter: Filter; fade: boolean }) {
  const tile = useRef<HTMLLIElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const near = useNearViewport(surface, item.slug);
  const aspect = tileAspects[item.tile];
  const span = useRowSpan(tile) ?? Math.ceil((WIDEST_COLUMN / aspect + GAP) / ROW);
  const Preview = previews[item.slug];
  const morphs = useTransitionTarget() === item.slug;
  return (
    <li
      ref={tile}
      id={item.slug}
      hidden={item.kind !== filter}
      style={{ "--span": span, "--aspect": aspect } as CSSProperties}
      className={cn(
        "group relative self-start [grid-row:span_var(--span)/span_var(--span)]",
        fade && "duration-200 ease-out motion-safe:animate-in motion-safe:fade-in",
      )}
    >
      <div
        ref={surface}
        style={morphs ? ({ "--work": `work-${item.slug}` } as CSSProperties) : undefined}
        className="relative aspect-(--aspect) w-full transform-gpu overflow-hidden rounded-3xl bg-card [view-transition-name:var(--work)] [view-transition-class:work] transition-[scale] duration-150 ease-out group-active:scale-[0.985]"
      >
        {near && Preview && (
          <Suspense>
            <div inert className="preview-enter size-full">
              <Preview />
            </div>
          </Suspense>
        )}
      </div>
      <Link
        to="/$slug"
        params={{ slug: item.slug }}
        state={{ grid: filter }}
        onClick={() => setTransitionTarget(item.slug)}
        aria-label={`Open ${item.title}`}
        className="absolute inset-0 z-10 rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute start-3 bottom-3 z-20 flex h-6 translate-y-1 items-center rounded-xl bg-popover px-2.5 text-xs leading-none text-control-foreground opacity-0 shadow-raised transition-[opacity,translate] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-has-focus-visible:translate-y-0 group-has-focus-visible:opacity-100",
          item.kind === "project" && "translate-y-0 opacity-100",
        )}
      >
        {item.title}
        {item.tagline && <span className="ms-1 text-muted-foreground">- {item.tagline}</span>}
      </span>
    </li>
  );
}

// Hidden tiles keep their last span, and a tile a filter switch reveals is measured before the grid paints.
function useRowSpan(ref: RefObject<HTMLElement | null>) {
  const [span, setSpan] = useState<number>();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => node.offsetHeight && Math.ceil((node.offsetHeight + GAP) / ROW);
    const initial = measure();
    if (initial) setSpan(initial);
    const observer = new ResizeObserver(() => {
      const next = measure();
      if (next) flushSync(() => setSpan(next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return span;
}

const seen = new Set<string>();

function useNearViewport(ref: RefObject<HTMLElement | null>, key: string) {
  const [near, setNear] = useState(() => seen.has(key));
  useEffect(() => {
    if (near) seen.add(key);
  }, [near, key]);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen.has(key)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, key]);
  return near;
}
