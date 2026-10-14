import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@manikrana/ui/lib/utils";

type Chapter = { id: string; title: string };

/** Where a chapter lands when jumped to: this far below the top of the window. */
const LANDING = 96;
/** The chapter for whatever a post says before its first heading; no heading slug can match it. */
const INTRO = ":intro";

/** An id for a heading, from its text. */
export function slugOf(children: ReactNode): string {
  const text = (function flatten(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(flatten).join("");
    if (node && typeof node === "object" && "props" in node)
      return flatten((node.props as { children?: ReactNode }).children);
    return "";
  })(children);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * A rail of short lines beside a post's text, on its left, one per section (each `h2` with an id in
 * `article`, plus an intro for anything before the first).
 * Sections on screen are lit; hovering grows the lines near the pointer and shows the section's
 * title, and clicking scrolls to it.
 */
export function ChapterNavigation({ article }: { article: RefObject<HTMLElement | null> }) {
  const rail = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hovered, setHovered] = useState<{ id: string; top: number } | null>(null);
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());
  const hoveredIndex = hovered ? chapters.findIndex((chapter) => chapter.id === hovered.id) : -1;
  const hoveredChapter = hoveredIndex >= 0 ? chapters[hoveredIndex] : undefined;

  useEffect(() => {
    const root = article.current;
    if (!root) return;
    const headings = [...root.querySelectorAll<HTMLHeadingElement>("h2[id]")];
    const sections = headings.map((heading) => ({
      id: heading.id,
      title: heading.textContent ?? "",
    }));
    // Paragraphs before the first heading get a chapter of their own.
    const opening = root.firstElementChild && root.firstElementChild !== headings[0];
    setChapters(opening ? [{ id: INTRO, title: "Intro" }, ...sections] : sections);
  }, [article]);

  /** Where a chapter starts: its heading, or for the intro, the top of the post. */
  const startOf = useCallback(
    (chapter: Chapter) =>
      chapter.id === INTRO ? article.current : document.getElementById(chapter.id),
    [article],
  );

  useEffect(() => {
    const root = article.current;
    if (!root || chapters.length === 0) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const end = root.getBoundingClientRect().bottom;
        const tops = chapters.map(
          (chapter) => startOf(chapter)?.getBoundingClientRect().top ?? end,
        );
        const next = new Set<string>();
        chapters.forEach((chapter, index) => {
          const top = tops[index]!;
          const bottom = tops[index + 1] ?? end;
          if (bottom > 0 && top < window.innerHeight) next.add(chapter.id);
        });
        setVisible((current) => (sameSet(current, next) ? current : next));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [article, chapters, startOf]);

  const jump = useCallback(
    (chapter: Chapter) => {
      const start = startOf(chapter);
      if (!start) return;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        // The intro goes back to the top of the page, with the post's title.
        top:
          chapter.id === INTRO
            ? 0
            : Math.max(0, window.scrollY + start.getBoundingClientRect().top - LANDING),
        behavior: still ? "auto" : "smooth",
      });
    },
    [startOf],
  );

  const hover = useCallback((chapter: Chapter, element: HTMLElement) => {
    const box = rail.current?.getBoundingClientRect();
    if (!box) return;
    setHovered({ id: chapter.id, top: element.getBoundingClientRect().top - box.top });
  }, []);

  if (chapters.length < 2) return null;

  return (
    <div className="pointer-events-none absolute inset-y-0 right-full z-50 me-24 hidden lg:block">
      <nav aria-label="Sections" className="sticky top-24">
        <div
          ref={rail}
          className="pointer-events-auto flex w-9 flex-col py-1"
          onPointerLeave={() => setHovered(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHovered(null);
          }}
        >
          {chapters.map((chapter, index) => {
            const distance = hoveredIndex >= 0 ? Math.abs(index - hoveredIndex) : null;
            const lit = distance !== null ? distance === 0 : visible.has(chapter.id);
            return (
              <button
                key={chapter.id}
                type="button"
                aria-label={`Jump to ${chapter.title}`}
                onClick={() => jump(chapter)}
                onFocus={(event) => hover(chapter, event.currentTarget)}
                onPointerEnter={(event) => hover(chapter, event.currentTarget)}
                className="group/chapter flex h-2.5 w-9 cursor-pointer items-center justify-start outline-none"
              >
                <span
                  className={cn(
                    "h-0.5 rounded-full transition-[width,background-color,opacity] duration-150 ease-out group-focus-visible/chapter:bg-ring",
                    distance === 0
                      ? "w-9"
                      : distance === 1
                        ? "w-7"
                        : distance === 2
                          ? "w-6"
                          : "w-5",
                    lit ? "bg-foreground opacity-100" : "bg-foreground/45 opacity-50",
                  )}
                />
              </button>
            );
          })}
        </div>
        {hovered && hoveredChapter ? (
          <div
            style={{ "--top": `${hovered.top}px` } as CSSProperties}
            className="pointer-events-none absolute top-(--top) left-12 w-max max-w-64 -translate-y-1/4 rounded-xl bg-popover px-3 py-2 text-sm leading-5 text-foreground shadow-raised"
          >
            {hoveredChapter.title}
          </div>
        ) : null}
      </nav>
    </div>
  );
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}
