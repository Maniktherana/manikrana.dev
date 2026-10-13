import { Suspense, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@manikrana/ui/lib/utils";
import { preloadPreviews, previews } from "@/components/work/previews";
import {
  components,
  featured,
  projects,
  tileAspects,
  type WorkItem,
  type WorkList,
} from "@/components/work/registry";
import { setTransitionTarget, useTransitionTarget } from "@/components/work/transition";

export function FeaturedGrid() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((item) => (
        <WorkTile key={item.slug} item={item} list="home" aspect={tileAspects.square} />
      ))}
    </ul>
  );
}

export function ProjectGrid({ list }: { list: WorkList }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {projects.map((item) => (
        <WorkTile key={item.slug} item={item} list={list} />
      ))}
    </ul>
  );
}

export function WorkGrid({ list }: { list: WorkList }) {
  useEffect(() => {
    const id = window.setTimeout(preloadPreviews, 1000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <ul
      style={{ "--tiles": components.length } as CSSProperties}
      className="work-grid mx-auto grid grid-flow-row-dense auto-rows-[--spacing(1)] gap-x-3"
    >
      {components.map((item) => (
        <WorkTile key={item.slug} item={item} list={list} />
      ))}
    </ul>
  );
}

function WorkTile({
  item,
  list,
  aspect = tileAspects[item.tile],
}: {
  item: WorkItem;
  list: WorkList;
  aspect?: number;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const near = useNearViewport(surface, item.slug);
  const Preview = previews[item.slug];
  const morphs = useTransitionTarget(list) === item.slug;
  return (
    <li
      id={item.slug}
      style={{ "--aspect": aspect } as CSSProperties}
      className="group relative self-start"
    >
      <div
        ref={surface}
        style={morphs ? ({ "--work": `work-${item.slug}` } as CSSProperties) : undefined}
        data-morph
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
        to="/work/$slug"
        params={{ slug: item.slug }}
        state={{ grid: list }}
        onClick={() => setTransitionTarget(item.slug, list)}
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
