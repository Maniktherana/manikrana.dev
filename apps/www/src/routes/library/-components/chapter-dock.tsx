import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import {
  animate,
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { onAudible, play } from "@/lib/sounds";
import type { Chapter } from "@/routes/library/-components/chapter-navigation";

/** The closed strip's h-1.25 rows. */
const TICK_PITCH = 5;
/** The open ruler's step, matching the desktop rail: four to a 30px row. */
const RULER_PITCH = 7.5;
/** How far a scrub drags to move one chapter. */
const SCRUB_STEP = 56;
/** Half the h-7 tick window: ticks fade out linearly from its center to this far. */
const TICK_REACH = 14;

const SPRING = { type: "spring", bounce: 0.1, visualDuration: 0.15 } as const;
/** Bounce on a close would undershoot the 40px circle into a wobble. */
const CLOSE_SPRING = { type: "spring", bounce: 0.03, visualDuration: 0.15 } as const;
/** Fades ride the surface's springs so the content tracks the shape; the blur lingers a beat. */
const FADE_IN = { ...SPRING, filter: { ...SPRING, visualDuration: 0.2 } };
const FADE_OUT = { ...CLOSE_SPRING, filter: { ...CLOSE_SPRING, visualDuration: 0.2 } };
const CONTENT_HIDDEN = { scale: 0.9, opacity: 0, filter: "blur(6px)" };
const CONTENT_SHOWN = { scale: 1, opacity: 1, filter: "blur(0px)", transition: FADE_IN };

/** Even sizes keep the centered content on whole pixels as the surface resizes. */
const even = (value: number) => Math.round(value / 2) * 2;

export function ChapterDock({
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
  const panel = useRef<HTMLElement>(null);
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

  useEffect(() => {
    if (!expanded) return;
    const row = panel.current?.querySelector<HTMLElement>('[aria-current="location"]');
    row?.focus({ preventScroll: true });
    row?.scrollIntoView({ block: "nearest" });
  }, [expanded]);

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

  const close = () => {
    flushSync(() => setOpen(false));
    trigger.current?.focus({ preventScroll: true });
  };

  const pick = (chapter: Chapter) => {
    play("key-press");
    close();
    onJump(chapter);
  };

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
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

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
            animate={{ scale: scrubbing ? 1.1 : pressed ? 0.96 : 1 }}
            transition={SPRING}
            style={{ width: surfaceWidth, height: surfaceHeight }}
            className="relative rounded-[20px] bg-popover shadow-[var(--edge-raised),inset_0_0_0_1px_oklch(1_0_0/10%),0_2px_6px_oklch(0_0_0/60%),0_12px_40px_oklch(0_0_0/90%)]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
              <div
                ref={measure}
                aria-hidden="true"
                inert
                className="invisible absolute bottom-0 left-1/2 flex max-h-[60svh] w-max min-w-48 max-w-[min(18rem,calc(100vw-40px))] -translate-x-1/2 flex-col p-2"
              >
                <ChapterList chapters={chapters} current={current} strip={strip} onPick={pick} />
              </div>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.nav
                    ref={panel}
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
                    className={cn(
                      "absolute bottom-0 left-1/2 flex origin-bottom max-h-[60svh] w-max min-w-48 max-w-[min(18rem,calc(100vw-40px))] -translate-x-1/2 flex-col p-2",
                      size.scrolls
                        ? "overflow-y-auto overscroll-contain"
                        : "touch-none overflow-hidden",
                    )}
                  >
                    <ChapterList
                      chapters={chapters}
                      current={current}
                      strip={strip}
                      onPick={pick}
                    />
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
                play("key-press");
                setOpen(true);
              }}
              className={cn(
                "absolute inset-x-0 bottom-0 mx-auto flex size-10 touch-none items-center justify-center rounded-full text-foreground outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-ring before:absolute before:-inset-3",
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

function ChapterList({
  chapters,
  current,
  strip,
  onPick,
}: {
  chapters: Chapter[];
  current: number;
  strip: MotionValue<number>;
  onPick: (chapter: Chapter) => void;
}) {
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const centers = useRowCenters(rows, chapters.length);
  const cursor = useTransform(strip, (value) => along(centers, value));
  const ticks = centers.flatMap((center, index) => {
    const next = centers[index + 1];
    const gap = next === undefined ? 0 : next - center;
    const count = next === undefined ? 0 : Math.round(gap / RULER_PITCH) - 1;
    return [
      { y: center, chapter: true },
      ...Array.from({ length: count }, (_, step) => ({
        y: center + ((step + 1) * gap) / (count + 1),
        chapter: false,
      })),
    ];
  });

  return (
    <div className="relative flex flex-col">
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0.5">
        {ticks.map((tick, index) => (
          <RulerTick key={index} y={tick.y} chapter={tick.chapter} cursor={cursor} />
        ))}
      </span>
      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          ref={(row) => {
            rows.current[index] = row;
          }}
          type="button"
          aria-current={index === current ? "location" : undefined}
          onClick={() => onPick(chapter)}
          className="flex min-h-7.5 items-center rounded-xl py-1.25 pr-3 pl-7 text-left text-sm leading-5 font-medium text-pretty text-control-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=location]:text-foreground"
        >
          {chapter.title}
        </button>
      ))}
    </div>
  );
}

function RulerTick({
  y,
  chapter,
  cursor,
}: {
  y: number;
  chapter: boolean;
  cursor: MotionValue<number>;
}) {
  const steps = useTransform(cursor, (value) => Math.abs(value - y) / RULER_PITCH);
  const width = useTransform(
    steps,
    chapter ? [0, 1, 2] : [0, 1, 2, 3],
    chapter ? [18, 13.5, 12] : [18, 11.25, 8.4, 7.5],
  );
  const scaleX = useTransform(width, (value) => value / 18);
  const opacity = useTransform(steps, [0, 1, 2], chapter ? [0.75, 0.4, 0.3] : [0.75, 0.4, 0.15]);
  return (
    <motion.span
      style={{ top: y, scaleX, opacity }}
      className="absolute left-0 h-0.5 w-4.5 origin-left -translate-y-1/2 rounded-full bg-foreground"
    />
  );
}

/** Where the reading position falls on the ruler: a chapter's start sits on its row's tick. */
function along(centers: number[], position: number) {
  if (centers.length === 0) return 0;
  const index = Math.min(centers.length - 1, Math.max(0, Math.floor(position)));
  const start = centers[index]!;
  const end = centers[index + 1] ?? start;
  return start + Math.min(1, Math.max(0, position - index)) * (end - start);
}

function useRowCenters(rows: RefObject<(HTMLElement | null)[]>, count: number) {
  const [centers, setCenters] = useState<number[]>([]);
  useLayoutEffect(() => {
    const read = () =>
      setCenters(
        rows.current.slice(0, count).map((row) => (row ? row.offsetTop + row.offsetHeight / 2 : 0)),
      );
    read();
    const observer = new ResizeObserver(read);
    rows.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, [rows, count]);
  return centers;
}

function useMeasuredSize() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0, scrolls: false });

  useEffect(() => {
    if (!element) return;
    const update = () =>
      setSize({
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrolls: element.scrollHeight > element.clientHeight + 1,
      });
    const observer = new ResizeObserver(update);
    update();
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, size] as const;
}
