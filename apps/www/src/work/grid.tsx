import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { Link } from "@tanstack/react-router";
import { previews } from "@/work/previews";
import { tileAspects, work, type Filter, type Work } from "@/work/registry";
import { setTransitionTarget, useTransitionTarget } from "@/work/transition";

// A masonry of work tiles, after lab.anishfn.ink. Row tracks are 4px and each
// tile spans its own height, so dense auto-placement drops every tile into the
// shortest column: masonry from plain CSS grid. A column is at least 17rem and
// at least a quarter of the grid, less its three gaps, so there are never more
// than four.
export function WorkGrid({ filter }: { filter: Filter }) {
  return (
    <ul className="mx-auto grid w-[calc(100%-40px)] max-w-work grid-flow-row-dense auto-rows-[--spacing(1)] grid-cols-[repeat(auto-fill,minmax(max(17rem,calc((100%_-_--spacing(9))/4)),1fr))] gap-x-3">
      {work.map((item) => (
        <WorkTile key={item.slug} item={item} hidden={filter !== "all" && item.kind !== filter} />
      ))}
    </ul>
  );
}

// A tile's height follows its column's width, so it measures itself to span as
// many 4px rows as that height plus the 12px gap. Until it has, it spans what
// it would in the widest column: a quarter of the 90rem grid, less the gaps.
const ROW = 4;
const GAP = 12;
const WIDEST_COLUMN = (1440 - 3 * GAP) / 4;

function WorkTile({ item, hidden }: { item: Work; hidden: boolean }) {
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
      hidden={hidden}
      style={{ "--span": span, "--aspect": aspect } as CSSProperties}
      className="group relative self-start [grid-row:span_var(--span)/span_var(--span)]"
    >
      {/* When it is the transition target, it shares its view-transition name
          with the stage on the item's page, so opening it morphs it into the stage. */}
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
        state={{ fromGrid: true }}
        onClick={() => setTransitionTarget(item.slug)}
        aria-label={`Open ${item.title}`}
        className="absolute inset-0 z-10 rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute start-3 bottom-3 z-20 flex h-6 translate-y-1 items-center rounded-xl bg-popover px-2.5 text-xs leading-none text-control-foreground opacity-0 shadow-raised transition-[opacity,translate] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-has-focus-visible:translate-y-0 group-has-focus-visible:opacity-100"
      >
        {item.title}
      </span>
    </li>
  );
}

// The 4px rows a tile spans for its measured height; undefined until measured.
function useRowSpan(ref: RefObject<HTMLElement | null>) {
  const [span, setSpan] = useState<number>();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setSpan(Math.ceil((node.offsetHeight + GAP) / ROW));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return span;
}

// Slugs whose previews have mounted this session. Coming back to the grid,
// those mount straight away instead of waiting on the observer, so the tiles
// never show empty.
const seen = new Set<string>();

// True once the element comes within half a screen of the viewport. It stays
// true, so a preview mounts once and keeps its state while scrolled past.
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
      { rootMargin: "50% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, key]);
  return near;
}
