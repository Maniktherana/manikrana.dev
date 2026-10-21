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
import {
  animate,
  AnimatePresence,
  cancelFrame,
  frame,
  motion,
  useMotionValue,
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
const SCRUB_STEP = 40;
/** Half the h-7 tick window: ticks fade out linearly from its center to this far. */
const TICK_REACH = 14;
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
  const rail = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hovered, setHovered] = useState<{ id: string; top: number } | null>(null);
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());
  const [current, setCurrent] = useState(0);
  const position = useMotionValue(0);
  const glide = useRef<AnimationPlaybackControls | null>(null);
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

  // Measured in Motion's frame loop: a separate requestAnimationFrame races Motion's render and
  // lands a frame late at random, which judders on 120Hz screens.
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
      setVisible((current) => (sameSet(current, next) ? current : next));
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
      <ChapterDock chapters={chapters} current={current} position={position} onJump={jump} />
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
  onJump,
}: {
  chapters: Chapter[];
  current: number;
  position: MotionValue<number>;
  onJump: (chapter: Chapter, quick?: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useId();
  const [scrubbing, setScrubbing] = useState(false);
  const press = useRef<{ held: boolean; stop: () => void } | null>(null);
  const scrubbed = useRef(false);
  const [ready, setReady] = useState(false);
  const offset = useTransform(position, (value) => {
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

  // Audio unlocks on a released tap, so the dock waits for it. Scrolling alone may never unlock
  // it on iOS, so a scroll brings the dock in too.
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
      at: current,
      stop: () => {},
    };
    const timer = window.setTimeout(() => {
      state.held = true;
      setOpen(false);
      setScrubbing(true);
      play("key-press");
    }, 150);
    const move = (moved: PointerEvent) => {
      if (moved.pointerId !== pointerId) return;
      // A thumb can't cover this much between two events; iOS sometimes reports one that does.
      if (Math.abs(moved.clientY - state.last) > 160) return;
      state.last = moved.clientY;
      const delta = moved.clientY - state.y;
      if (!state.held) {
        if (Math.abs(delta) > 8) release();
        return;
      }
      moved.preventDefault();
      // A ratchet: each step takes a full notch from where the last one happened, so a resting
      // thumb can't flicker across a boundary. Past either end the anchor follows the thumb, so
      // turning back takes one notch, not the whole overshoot.
      const steps = Math.trunc(-delta / SCRUB_STEP);
      if (steps === 0) return;
      const reach = state.at + steps;
      const next = Math.min(chapters.length - 1, Math.max(0, reach));
      if (next === reach) state.y -= steps * SCRUB_STEP;
      else state.y = moved.clientY;
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
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-5 lg:hidden">
        <motion.div
          ref={dock}
          inert={!ready}
          initial={false}
          animate={ready ? { y: 0, opacity: 1 } : { y: "200%", opacity: 0 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
          className="pointer-events-auto relative"
        >
          <AnimatePresence>
            {open && (
              <motion.nav
                id={list}
                aria-label="Sections"
                initial={{ opacity: 0, scale: 0.96, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 4 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="absolute bottom-full left-1/2 mb-2 flex max-h-[60svh] w-72 max-w-[calc(100vw-40px)] -translate-x-1/2 origin-bottom flex-col gap-0.5 overflow-y-auto rounded-2xl bg-popover p-1 shadow-[var(--edge-raised),0_12px_32px_oklch(0_0_0/50%)]"
              >
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    type="button"
                    aria-current={index === current ? "location" : undefined}
                    onClick={() => {
                      setOpen(false);
                      onJump(chapter);
                    }}
                    className="flex min-h-8 shrink-0 transform-gpu items-center rounded-xl px-3 py-1.5 text-left text-sm leading-5 text-control-foreground outline-none transition-[background-color,color,scale] duration-150 ease-out select-none active:scale-[0.96] hover:bg-control hover:text-foreground active:bg-control active:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=location]:bg-control-selected aria-[current=location]:text-foreground"
                  >
                    {chapter.title}
                  </button>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
          <button
            ref={trigger}
            type="button"
            aria-expanded={open}
            aria-controls={list}
            aria-label="Sections"
            onPointerDown={hold}
            onContextMenu={(event) => event.preventDefault()}
            onClick={() => {
              if (scrubbed.current) {
                scrubbed.current = false;
                return;
              }
              setOpen((value) => !value);
            }}
            className={cn(
              "relative flex size-10 transform-gpu touch-none before:absolute before:-inset-3 items-center justify-center rounded-full bg-popover text-foreground shadow-[var(--edge-raised),inset_0_0_0_1px_oklch(1_0_0/10%),0_2px_6px_oklch(0_0_0/60%),0_12px_40px_oklch(0_0_0/90%)] outline-none transition-[scale] duration-150 ease-out select-none [-webkit-touch-callout:none] focus-visible:ring-3 focus-visible:ring-ring/50",
              scrubbing ? "scale-110" : "active:scale-[0.96]",
            )}
          >
            <span aria-hidden="true" className="relative h-7 w-4 overflow-hidden">
              <motion.span
                style={{ y: offset }}
                className="absolute inset-x-0 top-1/2 flex flex-col"
              >
                {chapters.map((chapter, index) => {
                  const distance = Math.abs(index - current);
                  return (
                    <TickFade key={chapter.id} index={index} position={position}>
                      <span
                        className={cn(
                          "h-0.5 rounded-full bg-foreground",
                          "transition-[width,opacity] duration-150 ease-out",
                          distance === 0
                            ? "w-4"
                            : distance === 1
                              ? "w-3 opacity-70"
                              : distance === 2
                                ? "w-2.5 opacity-50"
                                : "w-2 opacity-30",
                        )}
                      />
                    </TickFade>
                  );
                })}
              </motion.span>
            </span>
          </button>
        </motion.div>
      </div>
    </>
  );
}

function TickFade({
  index,
  position,
  children,
}: {
  index: number;
  position: MotionValue<number>;
  children: ReactNode;
}) {
  const opacity = useTransform(position, (value) =>
    Math.max(0, 1 - (Math.abs(index - value) * TICK_PITCH) / TICK_REACH),
  );
  return (
    <motion.span style={{ opacity }} className="flex h-1.25 items-center justify-center">
      {children}
    </motion.span>
  );
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}
