import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import type { Chapter } from "@/routes/library/-components/chapter-navigation";

type RailProps = {
  chapters: Chapter[];
  current: number;
  visible: ReadonlySet<string>;
  onJump: (chapter: Chapter) => void;
};

const HOVER_INTENT = 60;
const LEAVE_GRACE = 80;
const SCROLL_SETTLE = 200;

export function ChapterRail({ chapters, current, visible, onJump }: RailProps) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const inside = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const closeAfter = useCallback((delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!inside.current && !nav.current?.querySelector(":focus-visible")) setOpen(false);
    }, delay);
  }, []);

  // A pointer that drifts off mid-scroll stays open until the scroll settles.
  useEffect(() => {
    if (!open) return;
    const hold = () => {
      if (!inside.current) closeAfter(SCROLL_SETTLE);
    };
    // Claims Escape while open, so the page's close shortcut waits for the next press.
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      clearTimeout(timer.current);
      nav.current?.querySelector<HTMLElement>(":focus")?.blur();
      setOpen(false);
    };
    window.addEventListener("scroll", hold, { passive: true });
    window.addEventListener("wheel", hold, { passive: true });
    window.addEventListener("keydown", dismiss, { capture: true });
    return () => {
      window.removeEventListener("scroll", hold);
      window.removeEventListener("wheel", hold);
      window.removeEventListener("keydown", dismiss, { capture: true });
    };
  }, [open, closeAfter]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-full z-50 hidden w-[min(calc((100vw-var(--container-reading))/2-32px),400px)] justify-end pe-20 with-rail:flex">
      <nav
        ref={nav}
        aria-label="Sections"
        data-open={open ? "" : undefined}
        data-instant={instant ? "" : undefined}
        style={
          {
            "--row-step": `${Math.min(68, 204 / Math.max(chapters.length - 2, 1))}ms`,
            "--label-step": `${Math.min(48, 192 / Math.max(chapters.length - 1, 1))}ms`,
          } as CSSProperties
        }
        onPointerEnter={() => {
          inside.current = true;
          setInstant(false);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setOpen(true), HOVER_INTENT);
        }}
        onPointerLeave={() => {
          inside.current = false;
          closeAfter(LEAVE_GRACE);
        }}
        onFocus={(event) => {
          if (!event.target.matches(":focus-visible")) return;
          setInstant(true);
          setOpen(true);
        }}
        onBlur={() => closeAfter(LEAVE_GRACE)}
        className="group/rail pointer-events-auto sticky top-24 -ms-4 mt-1.5 flex h-max w-max max-w-[calc(100%+1rem)] min-w-40 flex-col self-start ps-2 pb-2"
      >
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            type="button"
            aria-current={index === current ? "location" : undefined}
            onClick={() => onJump(chapter)}
            style={{ "--i": index } as CSSProperties}
            className="group/row pointer-events-none relative flex h-6.75 w-full min-w-0 translate-y-[calc(var(--i)*-19.5px)] cursor-pointer items-center rounded-md ps-2 pe-2 text-left text-base leading-6.5 font-normal whitespace-nowrap text-muted-foreground outline-none transition-[translate,color] duration-[220ms,150ms] ease-[cubic-bezier(0.165,0.84,0.44,1)] group-data-instant/rail:transition-none group-data-open/rail:pointer-events-auto group-data-open/rail:translate-y-0 group-data-open/rail:duration-[calc(125ms+(var(--i)-1)*var(--row-step)),150ms] group-data-open/rail:ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=location]:text-foreground motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className="absolute top-1.5 left-2 flex w-3 origin-left transition-[scale,opacity] duration-[240ms,250ms] ease-[cubic-bezier(0.2,0.8,0.2,1),cubic-bezier(0.25,0.1,0.25,1)] group-data-instant/rail:transition-none group-data-open/rail:scale-x-[0.21] group-data-open/rail:opacity-0 group-data-open/rail:duration-[250ms,270ms] group-data-open/rail:ease-[cubic-bezier(0.2,0.8,0.2,1),cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
            >
              <span
                className={cn(
                  "h-0.5 w-full rounded-full transition-[background-color,opacity] duration-150 ease-out",
                  visible.has(chapter.id) ? "bg-foreground" : "bg-foreground/45 opacity-50",
                )}
              />
            </span>
            <span className="-mx-1.5 min-w-0 flex-1 truncate px-1.5 opacity-0 blur-[4px] transition-[opacity,filter,clip-path] duration-50 ease-linear [clip-path:inset(-6px_60%_-6px_-6px)] group-data-instant/rail:transition-none group-data-open/rail:opacity-100 group-data-open/rail:blur-none group-data-open/rail:delay-[calc(47ms+var(--i)*var(--label-step))] group-data-open/rail:duration-[300ms,220ms,90ms] group-data-open/rail:ease-[cubic-bezier(0.25,0.1,0.25,1),cubic-bezier(0.215,0.61,0.355,1),cubic-bezier(0.215,0.61,0.355,1)] group-data-open/rail:[clip-path:inset(-6px_-6px_-6px_-6px)] motion-reduce:transition-none">
              {chapter.title}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
