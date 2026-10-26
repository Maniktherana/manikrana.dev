import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import {
  animate,
  AnimatePresence,
  cancelFrame,
  frame,
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { onAudible, play } from "@/lib/sounds";

type Chapter = { id: string; title: string };

const LANDING = 96;
/** Matches each tick row's h-1.25. */
const TICK_PITCH = 5;
/** How far a scrub drags to move one chapter. */
const SCRUB_STEP = 56;
/** Half the h-7 tick window: ticks fade out linearly from its center to this far. */
const TICK_REACH = 14;
/** No heading slug can match it. */
const INTRO = ":intro";

const SPRING = { type: "spring", bounce: 0.1, visualDuration: 0.15 } as const;
/** Bounce on a close would undershoot the 40px circle into a wobble. */
const CLOSE_SPRING = { type: "spring", bounce: 0.03, visualDuration: 0.15 } as const;
/** Dynamic island's crossfade, with its y offsets mirrored for a bottom anchor. */
/** Fades ride the surface's springs so the content tracks the shape; the blur lingers a beat. */
const FADE_IN = { ...SPRING, filter: { ...SPRING, visualDuration: 0.2 } };
const FADE_OUT = { ...CLOSE_SPRING, filter: { ...CLOSE_SPRING, visualDuration: 0.2 } };
const CONTENT_HIDDEN = { scale: 0.9, opacity: 0, filter: "blur(6px)" };
const CONTENT_SHOWN = { scale: 1, opacity: 1, filter: "blur(0px)", transition: FADE_IN };

/** Even sizes keep the centered content on whole pixels as the surface resizes. */
const even = (value: number) => Math.round(value / 2) * 2;

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
  const rail = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hovered, setHovered] = useState<{ id: string; top: number } | null>(null);
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());
  const [current, setCurrent] = useState(0);
  const position = useMotionValue(0);
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const aim = useRef(0);
  const measure = useRef(() => {});
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

  const hover = useCallback((chapter: Chapter, element: HTMLElement) => {
    const box = rail.current?.getBoundingClientRect();
    if (!box) return;
    setHovered({ id: chapter.id, top: element.getBoundingClientRect().top - box.top });
  }, []);

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
      <div className="pointer-events-none absolute inset-y-0 right-full z-50 me-24 hidden lg:block">
        <nav aria-label="Sections" className="sticky top-24">
          <div
            ref={rail}
            className="pointer-events-auto flex w-6 flex-col py-1"
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
                  className="group/chapter flex h-2.5 w-6 cursor-pointer items-center justify-start outline-none"
                >
                  <span
                    className={cn(
                      "h-0.5 rounded-full transition-[width,background-color,opacity] duration-150 ease-out group-focus-visible/chapter:bg-ring",
                      distance === 0
                        ? "w-6"
                        : distance === 1
                          ? "w-4.5"
                          : distance === 2
                            ? "w-4"
                            : "w-3",
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
              className="pointer-events-none absolute top-(--top) left-9 w-max max-w-64 -translate-y-1/4 rounded-xl bg-popover px-3 py-2 text-sm leading-5 text-foreground shadow-raised"
            >
              {hoveredChapter.title}
            </div>
          ) : null}
        </nav>
      </div>
    </>
  );
}

function ChapterDock({
  chapters,
  current,
  position,
  aim,
  onJump,
}: {
  chapters: Chapter[];
  current: number;
  position: MotionValue<number>;
  aim: RefObject<number>;
  onJump: (chapter: Chapter, quick?: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useId();
  const [scrubbing, setScrubbing] = useState(false);
  const [pressed, setPressed] = useState(false);
  const press = useRef<{ held: boolean; stop: () => void } | null>(null);
  const scrubbed = useRef(false);
  const [ready, setReady] = useState(false);
  const [measure, size] = useMeasuredSize();
  const expanded = open && size.height > 0;
  const width = useMotionValue(40);
  const height = useMotionValue(40);
  const surfaceWidth = useTransform(width, even);
  const surfaceHeight = useTransform(height, even);

  useEffect(() => {
    const spring = expanded ? SPRING : CLOSE_SPRING;
    const controls = [
      animate(width, expanded ? size.width : 40, spring),
      animate(height, expanded ? size.height : 40, spring),
    ];
    return () => controls.forEach((control) => control.stop());
  }, [expanded, size, width, height]);
  // Evens out iOS's uneven scroll readings without a noticeable lag.
  const strip = useSpring(position, { stiffness: 900, damping: 60 });
  const offset = useTransform(strip, (value) => {
    const pixel = globalThis.devicePixelRatio ?? 1;
    return Math.round(-(value + 0.5) * TICK_PITCH * pixel) / pixel;
  });

  useEffect(() => () => press.current?.stop(), []);

  const opened = useRef(open);
  useEffect(() => {
    if (open === opened.current) return;
    opened.current = open;
    play(open ? "expand" : "collapse");
  }, [open]);

  // Audio only unlocks on a released tap, and a scroll may never unlock it on iOS.
  useEffect(() => {
    if (ready) return;
    const show = () => setReady(true);
    const stop = onAudible(show);
    window.addEventListener("scroll", show, { once: true, passive: true });
    return () => {
      stop();
      window.removeEventListener("scroll", show);
    };
  }, [ready]);

  const hold = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    press.current?.stop();
    const { pointerId } = event;
    const state = {
      held: false,
      y: event.clientY,
      last: event.clientY,
      lastAt: event.timeStamp,
      at: current,
      stop: () => {},
    };
    aim.current = window.scrollY;
    setPressed(true);
    const timer = window.setTimeout(() => {
      state.held = true;
      setOpen(false);
      setScrubbing(true);
      play("key-press");
    }, 150);
    const move = (moved: PointerEvent) => {
      if (moved.pointerId !== pointerId) return;
      // Mid-glide, iOS measures touches against the scroll position just requested (corrected
      // here) or, on big jumps, a stale one (off-screen or impossibly fast, so dropped). Left in,
      // either reads as drag and every step's glide makes more, so the scrub runs away.
      const y = moved.clientY - (aim.current - window.scrollY);
      const elapsed = moved.timeStamp - state.lastAt;
      const bogus =
        y < -200 || y > window.innerHeight + 200 || Math.abs(y - state.last) > elapsed * 5 + 8;
      if (bogus) return;
      state.last = y;
      state.lastAt = moved.timeStamp;
      const delta = y - state.y;
      if (!state.held) {
        if (Math.abs(delta) > 8) release();
        return;
      }
      moved.preventDefault();
      // A ratchet: each step needs a full notch from the last, and past either end the anchor
      // follows the thumb so turning back takes one notch.
      const steps = Math.trunc(-delta / SCRUB_STEP);
      if (steps === 0) return;
      const reach = state.at + steps;
      const next = Math.min(chapters.length - 1, Math.max(0, reach));
      if (next === reach) state.y -= steps * SCRUB_STEP;
      else state.y = y;
      if (next === state.at) return;
      for (let step = Math.abs(next - state.at); step > 0; step--) play("key-press");
      state.at = next;
      onJump(chapters[next]!, true);
    };
    const release = (ended?: PointerEvent) => {
      if (ended && ended.pointerId !== pointerId) return;
      state.stop();
      scrubbed.current = state.held;
      press.current = null;
      setPressed(false);
      setScrubbing(false);
    };
    state.stop = () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    press.current = state;
  };

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!dock.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      flushSync(() => setOpen(false));
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const rows = (
    <>
      <p
        aria-hidden="true"
        className="pb-1.5 text-center text-xs leading-4 font-semibold tracking-wide text-muted-foreground"
      >
        Chapters
      </p>
      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          type="button"
          aria-current={index === current ? "location" : undefined}
          onClick={() => {
            setOpen(false);
            onJump(chapter);
          }}
          className="flex min-h-8 shrink-0 transform-gpu items-center rounded-lg px-2.5 py-1.5 text-left text-sm leading-5 text-control-foreground outline-none transition-[background-color,color,scale] duration-150 ease-out select-none active:scale-[0.96] hover:bg-control hover:text-foreground active:bg-control active:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=location]:bg-control-selected aria-[current=location]:text-foreground"
        >
          {chapter.title}
        </button>
      ))}
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-5 lg:hidden">
        <motion.div
          ref={dock}
          inert={!ready}
          initial={false}
          animate={ready ? { y: 0, opacity: 1 } : { y: "200%", opacity: 0 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="pointer-events-auto relative"
        >
          <motion.div
            initial={false}
            animate={{
              scale: scrubbing ? 1.1 : pressed ? 0.96 : 1,
              "--corner": expanded ? 2 : 1,
            }}
            transition={{ ...SPRING, "--corner": expanded ? SPRING : CLOSE_SPRING }}
            style={{ width: surfaceWidth, height: surfaceHeight }}
            className={cn(
              "relative rounded-[20px] bg-popover [corner-shape:superellipse(var(--corner))] supports-[corner-shape:squircle]:rounded-[36px]",
              expanded
                ? "shadow-[var(--edge-raised),0_12px_32px_oklch(0_0_0/50%)]"
                : "shadow-[var(--edge-raised),inset_0_0_0_1px_oklch(1_0_0/10%),0_2px_6px_oklch(0_0_0/60%),0_12px_40px_oklch(0_0_0/90%)]",
            )}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[inherit] [corner-shape:superellipse(var(--corner))]">
              <div
                ref={measure}
                aria-hidden="true"
                inert
                className="invisible absolute bottom-0 left-1/2 flex max-h-[60svh] w-72 max-w-[calc(100vw-40px)] -translate-x-1/2 flex-col px-3 pt-2 pb-3"
              >
                {rows}
              </div>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.nav
                    key="list"
                    id={list}
                    aria-label="Chapters"
                    initial={CONTENT_HIDDEN}
                    animate={CONTENT_SHOWN}
                    exit={{
                      scale: 0.7,
                      y: 7.5,
                      opacity: [1, 0],
                      filter: "blur(6px)",
                      transition: FADE_OUT,
                    }}
                    className="absolute bottom-0 left-1/2 flex origin-bottom max-h-[60svh] w-72 max-w-[calc(100vw-40px)] -translate-x-1/2 flex-col overflow-y-auto px-3 pt-2 pb-3"
                  >
                    {rows}
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              ref={trigger}
              type="button"
              inert={open}
              aria-expanded={open}
              aria-controls={list}
              aria-label="Chapters"
              initial={false}
              animate={
                open
                  ? {
                      scale: 1.4,
                      y: -7.5,
                      opacity: [1, 0],
                      filter: "blur(6px)",
                      transition: FADE_OUT,
                    }
                  : {
                      scale: [0.9, 1],
                      y: 0,
                      opacity: [0, 1],
                      filter: ["blur(6px)", "blur(0px)"],
                      transition: FADE_IN,
                    }
              }
              onPointerDown={hold}
              onContextMenu={(event) => event.preventDefault()}
              onClick={() => {
                if (scrubbed.current) {
                  scrubbed.current = false;
                  return;
                }
                setOpen(true);
              }}
              className={cn(
                "absolute inset-x-0 bottom-0 mx-auto flex size-10 touch-none items-center justify-center rounded-full text-foreground outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-3 focus-visible:ring-ring/50 before:absolute before:-inset-3",
                open && "pointer-events-none",
              )}
            >
              <span aria-hidden="true" className="relative h-7 w-4 overflow-hidden">
                <motion.span
                  style={{ y: offset }}
                  className="absolute inset-x-0 top-1/2 flex flex-col"
                >
                  {chapters.map((chapter, index) => (
                    <Tick key={chapter.id} index={index} position={strip} />
                  ))}
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}

function Tick({ index, position }: { index: number; position: MotionValue<number> }) {
  const distance = useTransform(position, (value) => Math.abs(index - value));
  const width = useTransform(distance, [0, 1, 2, 3], [16, 12, 10, 8]);
  const shade = useTransform(distance, [0, 1, 2, 3], [1, 0.7, 0.5, 0.3]);
  const opacity = useTransform(
    [distance, shade],
    ([away, tone]: number[]) => tone! * Math.max(0, 1 - (away! * TICK_PITCH) / TICK_REACH),
  );
  return (
    <span className="flex h-1.25 items-center justify-center">
      <motion.span style={{ width, opacity }} className="h-0.5 rounded-full bg-foreground" />
    </span>
  );
}

function useMeasuredSize() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!element) return;
    const update = () => setSize({ width: element.offsetWidth, height: element.offsetHeight });
    const observer = new ResizeObserver(update);
    update();
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, size] as const;
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}
