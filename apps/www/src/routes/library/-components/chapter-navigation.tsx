import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  animate,
  cancelFrame,
  frame,
  useMotionValue,
  type AnimationPlaybackControls,
} from "motion/react";
import { ChapterDock } from "@/routes/library/-components/chapter-dock";
import { ChapterRail } from "@/routes/library/-components/chapter-rail";

export type Chapter = { id: string; title: string };

const LANDING = 96;
/** No heading slug can match it. */
const INTRO = ":intro";

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

export function ChapterNavigation({ article }: { article: RefObject<HTMLElement | null> }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());
  const [current, setCurrent] = useState(0);
  const position = useMotionValue(0);
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const aim = useRef(0);
  const measure = useRef(() => {});

  useEffect(() => {
    const root = article.current;
    if (!root) return;
    const headings = [...root.querySelectorAll<HTMLHeadingElement>("h2[id]")];
    const sections = headings.map((heading) => ({
      id: heading.id,
      title: heading.textContent ?? "",
    }));
    const opening = root.firstElementChild && root.firstElementChild !== headings[0];
    setChapters(opening ? [{ id: INTRO, title: "Intro" }, ...sections] : sections);
  }, [article]);

  const startOf = useCallback(
    (chapter: Chapter) =>
      chapter.id === INTRO ? article.current : document.getElementById(chapter.id),
    [article],
  );

  // Read inside Motion's frame loop so the strip renders in the same frame as the scroll.
  useEffect(() => {
    const root = article.current;
    if (!root || chapters.length === 0) return;
    const read = () => {
      const end = root.getBoundingClientRect().bottom;
      const tops = chapters.map((chapter) => startOf(chapter)?.getBoundingClientRect().top ?? end);
      const next = new Set<string>();
      chapters.forEach((chapter, index) => {
        const top = tops[index]!;
        const bottom = tops[index + 1] ?? end;
        if (bottom > 0 && top < window.innerHeight) next.add(chapter.id);
      });
      setVisible((previous) => (sameSet(previous, next) ? previous : next));
      const mark = window.innerHeight / 3;
      const index = tops.reduce((last, top, at) => (top <= mark ? at : last), 0);
      const start = tops[index]!;
      const span = (tops[index + 1] ?? end) - start;
      setCurrent(index);
      position.set(index + Math.min(1, Math.max(0, (mark - start) / span)));
    };
    const update = () => frame.read(read);
    measure.current = read;
    read();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => {
      cancelFrame(read);
      measure.current = () => {};
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [article, chapters, position, startOf]);

  const jump = useCallback(
    (chapter: Chapter, quick = false) => {
      const start = startOf(chapter);
      if (!start) return;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top =
        chapter.id === INTRO
          ? 0
          : Math.max(0, window.scrollY + start.getBoundingClientRect().top - LANDING);
      glide.current?.stop();
      if (still || !quick) {
        window.scrollTo({ top, behavior: still ? "auto" : "smooth" });
        return;
      }
      glide.current = animate(window.scrollY, top, {
        duration: 0.18,
        ease: [0.23, 1, 0.32, 1],
        onUpdate: (value) => {
          aim.current = value;
          window.scrollTo({ top: value, behavior: "instant" });
          measure.current();
        },
      });
    },
    [startOf],
  );

  if (chapters.length < 2) return null;

  return (
    <>
      <ChapterDock
        chapters={chapters}
        current={current}
        position={position}
        aim={aim}
        onJump={jump}
      />
      <ChapterRail
        chapters={chapters}
        current={current}
        visible={visible}
        position={position}
        onJump={jump}
      />
    </>
  );
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}
