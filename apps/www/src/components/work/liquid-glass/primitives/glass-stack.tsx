import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  motionValue,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { cssTime } from "./css-time";
import { GlassRim } from "./glass";
import { GlassButton } from "./glass-button";
import { useReducedMotion } from "./magnetic";

type GlassStackProps<T extends { id: string }> = {
  children: (item: T, state: { front: boolean; open: boolean }) => ReactNode;
  className?: string;
  clearLabel?: string;
  collapseLabel?: string;
  defaultOpen?: boolean;
  itemLabel?: (item: T, others: number) => string;
  items: readonly T[];
  onDismiss?: (ids: string[]) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

const CARD = 58;
const WIDTH = 328;
const GAP = 8;
const PEEK = 12;
const HEAD = 36;
const INSET = 12;
const DEPTH = 3;
const RISE = 80;
const SLOP = 3;
const ELASTIC = 0.05;
const SHOW = 44;
const REVEAL = 84;
const PILL = REVEAL - GAP;
const RADIUS = 18;
const GOO = 3.5;
const STACK = "stack";
const FADE = [1, 0.6, 0.36];
const SNAP = { type: "spring", duration: 0.45, bounce: 0 } as const;
const VANISH = { duration: 0.12, ease: [0, 0, 0.58, 1] } as const;
const AWAY = { type: "spring", visualDuration: 0.4, bounce: 0 } as const;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

// Fades whatever passes half a card width left of the lane, gone by three quarters.
function exitMask(lane: number, span: number) {
  return `linear-gradient(to right, transparent ${lane - span * 0.75}px, black ${lane - span * 0.5}px)`;
}

function wait(name: string) {
  return cssTime(document.documentElement, name) || 250;
}

function GlassStack<T extends { id: string }>({
  children,
  className,
  clearLabel = "Clear",
  collapseLabel = "Show less",
  defaultOpen = false,
  itemLabel,
  items: list,
  onDismiss,
  onOpenChange,
  open: openProp,
}: GlassStackProps<T>) {
  const reduceMotion = useReducedMotion();
  const moved = useRef(false);
  const settling = useRef(0);
  const offsets = useRef(new Map<string, MotionValue<number>>());
  const contents = useRef(new Map<string, HTMLSpanElement>());
  const stack = useRef<HTMLDivElement>(null);
  const reveal = useMotionValue(0);
  const vanish = useMotionValue(1);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = openProp ?? localOpen;
  const items = list.slice(0, DEPTH);
  const order = items.map((item) => item.id).join(" ");
  const [known, setKnown] = useState(items);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [entering, setEntering] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<T[]>([]);
  const [clearing, setClearing] = useState<string[]>([]);
  const gone = useRef(new Set<string>());
  const [active, setActive] = useState<{ id: string | null } | null>(null);
  const [shown, setShown] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [parting, setParting] = useState<"clear" | "close" | null>(null);
  const [span, setSpan] = useState(WIDTH);
  if (!active && parting) setParting(null);

  if (known.length !== items.length || known.some((item, index) => item.id !== items[index]?.id)) {
    const ids = new Set(items.map((item) => item.id));
    const fresh = items[0] && !known.some((item) => item.id === items[0]!.id) ? items[0] : null;
    const dropped = known.filter((item) => !ids.has(item.id) && !gone.current.has(item.id));
    setKnown(items);
    if (fresh) setEntering(fresh.id);
    if (dropped.length > 0) setLeaving((current) => [...current, ...dropped]);
  }

  function setOpen(next: boolean) {
    setLocalOpen(next);
    onOpenChange?.(next);
  }

  const offset = (key: string) => {
    let value = offsets.current.get(key);
    if (!value) {
      value = motionValue(0);
      offsets.current.set(key, value);
    }
    return value;
  };
  const size = (id: string) => heights[id] ?? CARD;
  const top = items[0] ? size(items[0].id) : CARD;
  const total = items.reduce((sum, note) => sum + size(note.id), 0);
  const height =
    items.length === 0
      ? CARD
      : open
        ? HEAD + total + (items.length - 1) * GAP
        : top + (items.length - 1) * PEEK;

  useLayoutEffect(() => {
    const measure = () => {
      const next: Record<string, number> = {};
      for (const [id, node] of contents.current) next[id] = node.offsetHeight + INSET * 2;
      setHeights(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const node of contents.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [order, leaving]);

  useLayoutEffect(() => setReady(true), []);

  // The swipe geometry follows the stack's real width, so a narrower stack still lines up.
  useLayoutEffect(() => {
    const node = stack.current;
    if (!node) return;
    const measure = () => setSpan(node.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useLayoutEffect(() => {
    if (!entering) return;
    void contents.current.get(entering)?.offsetWidth;
    setEntering(null);
  }, [entering]);

  useEffect(() => {
    if (leaving.length === 0) return;
    const id = window.setTimeout(() => setLeaving([]), wait("--stack-close") + 60);
    return () => window.clearTimeout(id);
  }, [leaving]);

  const finish = useEffectEvent(() => {
    const left = items.filter((note) => !clearing.includes(note.id));
    for (const key of clearing) {
      offsets.current.delete(key);
      gone.current.add(key);
    }
    offset(STACK).set(0);
    reveal.set(0);
    onDismiss?.(clearing);
    setClearing([]);
    setSweeping(false);
    setActive(null);
    setShown(false);
    if (left.length === 0) close();
  });

  useEffect(() => {
    if (clearing.length === 0) return;
    const id = window.setTimeout(finish, AWAY.visualDuration * 1000);
    return () => window.clearTimeout(id);
  }, [clearing]);

  function settle(key: string | null, to: number) {
    const value = offset(key ?? STACK);
    if (reduceMotion) {
      value.set(to);
      reveal.set(to);
    } else {
      animate(value, to, SNAP);
      if (to !== 0) animate(reveal, to, SNAP);
    }
    setShown(to !== 0);
    if (to !== 0) return;
    const token = ++settling.current;
    if (reduceMotion) setActive(null);
    else
      void animate(reveal, 0, SNAP).then(() => {
        if (settling.current === token) setActive(null);
      });
  }

  // A collapsed stack swipes as one: the cards under the top one are scaled down, so their
  // offset is divided by that scale to cover the same distance.
  const follow = [
    offset(STACK),
    useTransform(offset(STACK), (value) => value / (1 - 0.06)),
    useTransform(offset(STACK), (value) => value / (1 - 0.12)),
  ];
  const cardMask = useTransform(() => {
    if (!active) return "none";
    return exitMask(-offset(active.id ?? STACK).get(), span);
  });

  const full = () => span + GAP;

  function clear(key: string | null) {
    const leavingIds = key === null ? items.map((note) => note.id) : [key];
    const value = offset(key ?? STACK);
    // The card carries the swipe's speed out of the lane while Clear fades where it stands.
    animate(value, -2 * full(), { ...AWAY, velocity: value.getVelocity() });
    if (active) setSweeping(true);
    setParting("clear");
    animate(vanish, 0, VANISH);
    setClearing((current) => [...current, ...leavingIds]);
  }

  function close() {
    if (active) {
      setParting("close");
      animate(vanish, 0, VANISH);
      settle(active.id, 0);
    }
    setOpen(false);
  }

  function press(event: PointerEvent<HTMLElement>, id: string) {
    if (event.button !== 0 || sweeping) return;
    const key = open ? id : null;
    if (active && active.id !== key) settle(active.id, 0);
    const value = offset(key ?? STACK);
    settling.current += 1;
    value.stop();
    reveal.stop();
    const from = active?.id === key ? value.get() : 0;
    const opened = from <= -REVEAL / 2;
    const edge = full();
    const least = opened ? -edge : -REVEAL;
    const start = event.clientX;
    moved.current = false;
    const stop = () => {
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
    const follow = (next: globalThis.PointerEvent) => {
      const dx = next.clientX - start;
      if (!moved.current && Math.abs(dx) < SLOP) return;
      if (!moved.current) {
        vanish.set(1);
        setParting(null);
        setActive({ id: key });
      }
      moved.current = true;
      const reach = from + dx;
      if (opened && reach <= -edge) {
        stop();
        value.set(-edge);
        reveal.set(-edge);
        setSweeping(true);
        return clear(key);
      }
      const x =
        reach > 0 ? reach * ELASTIC : reach < least ? least + (reach - least) * ELASTIC : reach;
      value.set(x);
      reveal.set(x);
      setShown(x < -SHOW);
    };
    const release = () => {
      stop();
      if (moved.current) settle(key, value.get() < -REVEAL / 2 ? -REVEAL : 0);
    };
    window.addEventListener("pointermove", follow);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
  }

  function place(note: T, depth: number) {
    const above = items.slice(0, depth).reduce((sum, item) => sum + size(item.id), 0);
    const y = open ? HEAD + above + depth * GAP : depth * PEEK;
    if (note.id === entering) {
      return {
        y: (open ? HEAD : 0) - RISE,
        scale: 0.97,
        fade: 0,
        blur: 2,
        clip: "-16px",
        card: size(note.id),
        phase: "enter",
      };
    }
    if (depth >= DEPTH) {
      return {
        y: DEPTH * PEEK,
        scale: 1 - 0.06 * DEPTH,
        fade: 0,
        blur: 2,
        clip: "-16px",
        card: top,
        phase: "leave",
      };
    }
    if (clearing.includes(note.id)) {
      const swiped = active && (active.id === note.id || (active.id === null && depth === 0));
      return {
        y,
        scale: open ? 1 : 1 - 0.06 * depth,
        fade: swiped ? 1 : 0,
        blur: swiped ? 0 : 2,
        clip: "-16px",
        card: open || depth === 0 ? size(note.id) : top,
        phase: "clear",
      };
    }
    if (open) return { y, scale: 1, fade: 1, blur: 0, clip: "-16px", card: size(note.id) };
    return {
      y,
      scale: 1 - 0.06 * depth,
      fade: FADE[depth] ?? 0,
      blur: 0,
      clip: depth === 0 ? "-16px" : `calc(100% - ${PEEK / (1 - 0.06 * depth) + 0.5}px)`,
      card: depth === 0 ? size(note.id) : top,
    };
  }

  const cards = [
    ...items.map((note, depth) => ({ note, depth })),
    ...leaving.map((note) => ({ note, depth: DEPTH })),
  ];
  const row = active?.id ? items.findIndex((note) => note.id === active.id) : -1;
  const lane = active
    ? row < 0
      ? { y: 0, height: top }
      : {
          y: HEAD + items.slice(0, row).reduce((sum, item) => sum + size(item.id), 0) + row * GAP,
          height: size(items[row]!.id),
        }
    : null;

  return (
    <motion.div
      ref={stack}
      style={{ "--height": `${height}px` } as MotionStyle}
      data-open={open || undefined}
      data-pending={!ready || undefined}
      data-animated={animated || undefined}
      className={cn(
        "group/stack relative w-82 font-[family-name:system-ui] text-(--glass-ink) subpixel-antialiased not-data-animated:[&_*]:transition-none!",
        className,
      )}
    >
      <GlassButton
        magnetic={{ grow: 1.06 }}
        inert={!open}
        onClick={close}
        className="absolute top-0 right-0 z-10 h-7 px-3 text-[12px] font-semibold opacity-0 blur-[4px] transition-[opacity,filter] duration-200 ease-out group-data-open/stack:opacity-100 group-data-open/stack:blur-none"
      >
        {collapseLabel}
      </GlassButton>
      <motion.div
        style={{ "--rest": `${(items.length - 1) * PEEK}px` } as MotionStyle}
        className="relative h-(--height) touch-pan-y group-data-pending/stack:grid group-data-pending/stack:h-auto group-data-pending/stack:pb-(--rest) [transition:height_var(--stack-open)_var(--stack-ease)] motion-reduce:transition-none"
      >
        {lane && active && (
          <SwipeBody
            key={`${active.id ?? STACK} ${lane.height}`}
            card={offset(active.id ?? STACK)}
            vanish={vanish}
            parting={parting}
            span={span}
            reveal={reveal}
            y={lane.y}
            height={lane.height}
            layer={DEPTH - Math.max(row, 0)}
            label={clearLabel}
            interactive={shown && !sweeping && !parting}
            onClear={() => clear(active.id)}
          />
        )}
        {cards.map(({ note, depth }) => {
          const spot = place(note, depth);
          const front = depth === 0;
          const swiping =
            active &&
            parting !== "close" &&
            (active.id === note.id || (active.id === null && front));
          return (
            <motion.button
              key={note.id}
              type="button"
              inert={depth >= DEPTH || spot.phase === "clear"}
              aria-expanded={front ? open : undefined}
              aria-label={
                open || front ? itemLabel?.(note, open ? 0 : items.length - 1) : undefined
              }
              aria-keyshortcuts="Delete"
              tabIndex={open || front ? 0 : -1}
              data-phase={spot.phase}
              data-flat={!open && depth < Math.min(items.length, DEPTH) - 1 ? "" : undefined}
              data-swiping={swiping ? "" : undefined}
              onPointerDown={(event) => press(event, note.id)}
              onKeyDown={(event) => {
                if (event.key === "Delete" || event.key === "Backspace")
                  clear(open ? note.id : null);
              }}
              onClick={() => {
                if (moved.current) return;
                if (active) settle(active.id, 0);
                else setOpen(true);
              }}
              style={
                {
                  x: open ? offset(note.id) : (follow[depth] ?? 0),
                  "--z": DEPTH - depth,
                  "--y": `${spot.y}px`,
                  "--scale": spot.scale,
                  "--fade": spot.fade,
                  "--blur": `${spot.blur}px`,
                  "--clip": spot.clip,
                  "--card": `${spot.card}px`,
                  maskImage: swiping ? cardMask : undefined,
                } as MotionStyle
              }
              className={cn(
                "group absolute inset-x-0 top-0 isolate z-(--z) flex h-(--card) group-data-pending/stack:relative group-data-pending/stack:[grid-area:1/1] group-data-pending/stack:h-auto group-data-pending/stack:py-3 translate-y-(--y) scale-(--scale) cursor-pointer items-center gap-3 overflow-hidden rounded-[18px] bg-(image:--glass-fill) px-3 text-start opacity-(--fade) shadow-[var(--glass-contact),var(--glass-lift)] blur-(--blur) data-flat:shadow-[var(--glass-contact),0_0_0_rgb(0_0_0/0),0_0_0_rgb(0_0_0/0)] will-change-[transform,translate,scale,opacity,filter] [clip-path:inset(var(--clip)_-16px_-16px_-16px)] [backdrop-filter:var(--glass-backdrop)] select-none data-swiping:bg-none data-swiping:shadow-none data-swiping:data-flat:shadow-none data-swiping:transition-none data-swiping:[backdrop-filter:none] [transition:translate_var(--stack-open)_var(--stack-ease),scale_var(--stack-open)_var(--stack-ease),opacity_var(--stack-open)_var(--stack-ease),filter_var(--stack-open)_var(--stack-ease),height_var(--stack-open)_var(--stack-ease),clip-path_var(--stack-open)_var(--stack-ease),box-shadow_var(--stack-open)_var(--stack-ease)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[phase=clear]:[transition:opacity_var(--stack-close)_var(--stack-ease),filter_var(--stack-close)_var(--stack-ease)] data-[phase=enter]:[transition:none] data-[phase=leave]:[transition:translate_var(--stack-close)_var(--stack-ease),scale_var(--stack-close)_var(--stack-ease),opacity_var(--stack-close)_var(--stack-ease),filter_var(--stack-close)_var(--stack-ease)] motion-reduce:transition-none",
                front || depth >= DEPTH ? "origin-center" : "origin-bottom",
              )}
            >
              <GlassRim />
              <span
                ref={(node) => {
                  if (node) contents.current.set(note.id, node);
                  else contents.current.delete(note.id);
                }}
                aria-hidden="true"
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3 transition-[opacity,filter] duration-200 ease-out",
                  !front &&
                    "group-data-pending/stack:max-h-0 opacity-0 blur-[4px] group-data-open/stack:opacity-100 group-data-open/stack:blur-none",
                )}
              >
                {children(note, { front, open })}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function SwipeBody({
  card,
  height,
  interactive,
  label,
  layer,
  onClear,
  parting,
  reveal,
  span,
  vanish,
  y,
}: {
  card: MotionValue<number>;
  height: number;
  interactive: boolean;
  label: string;
  layer: number;
  onClear: () => void;
  parting: "clear" | "close" | null;
  span: number;
  reveal: MotionValue<number>;
  vanish: MotionValue<number>;
  y: number;
}) {
  const id = useId().replace(/[^\w-]/g, "");
  const width = useTransform(reveal, (value) => Math.max(PILL, -value - GAP));
  const pill = useTransform(width, (wide) => span - wide);
  const cardX = useTransform(card, (value) => value + span);
  const pillX = useTransform(pill, (value) => value + span);
  // Clear keeps its own rim, cut where the card still covers it so the joined edge stays one surface.
  const covered = useTransform([card, pill], ([value, left]: number[]) =>
    Math.max(0, value! + span + GAP - left!),
  );
  const rimClip = useMotionTemplate`inset(0 0 0 ${covered}px)`;
  const trail = exitMask(span, span);
  const fill = useMotionTemplate`url(#${id}-mask), ${trail}`;
  const fade = useTransform(reveal, (value) => clamp((-value - 24) / (PILL - 24)));
  const cardShape = (
    <motion.rect x={cardX} y={0} width={span} height={height} rx={RADIUS} fill="white" />
  );
  const pillShape = (
    <motion.rect x={pillX} y={0} width={width} height={height} rx={RADIUS} fill="white" />
  );
  // Once the swipe ends, Clear leaves the goo so it can fade on its own without taking the card.
  const shapes = parting ? (
    parting === "clear" && cardShape
  ) : (
    <>
      {cardShape}
      {pillShape}
    </>
  );

  return (
    <div
      style={
        {
          "--y": `${y}px`,
          "--h": `${height}px`,
          "--z": layer,
        } as CSSProperties
      }
      className="pointer-events-none absolute inset-x-0 top-0 z-(--z) h-(--h) translate-y-(--y)"
    >
      <div className="absolute inset-y-0 -left-full w-[calc(200%+--spacing(16))]">
        <motion.svg
          aria-hidden="true"
          style={{ maskImage: trail }}
          className="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            <filter id={`${id}-goo`} colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation={GOO} result="blur" />
              <feColorMatrix
                in="blur"
                values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 20 -9.5"
                result="goo"
              />
              <feMerge>
                <feMergeNode in="goo" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id={`${id}-shade`}
              x="-10%"
              y="-40%"
              width="120%"
              height="220%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation={GOO} result="blur" />
              <feColorMatrix
                in="blur"
                values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 20 -9.5"
                result="goo"
              />
              <feMerge result="shape">
                <feMergeNode in="goo" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
              <feFlood style={{ floodColor: "var(--glass-shade)" }} result="shade-tone" />
              <feComposite in="shade-tone" in2="shape" operator="in" result="shade-shape" />
              <feOffset in="shade-shape" dy="1" result="shade-drop" />
              <feGaussianBlur in="shade-drop" stdDeviation="1" result="shade-blur" />
              <feFlood style={{ floodColor: "var(--glass-ring)" }} result="ring-tone" />
              <feMorphology in="shape" operator="dilate" radius="1" result="ring-wide" />
              <feComposite in="ring-tone" in2="ring-wide" operator="in" result="ring" />
              <feFlood style={{ floodColor: "var(--glass-lift-shade)" }} result="lift-tone" />
              <feMorphology in="shape" operator="erode" radius="8" result="lift-core" />
              <feOffset in="lift-core" dy="10" result="lift-drop" />
              <feComposite in="lift-tone" in2="lift-drop" operator="in" result="lift-shape" />
              <feGaussianBlur in="lift-shape" stdDeviation="16" result="lift" />
              <feMerge result="shadows">
                <feMergeNode in="lift" />
                <feMergeNode in="shade-blur" />
                <feMergeNode in="ring" />
              </feMerge>
              <feComposite in="shadows" in2="shape" operator="out" />
            </filter>
            <mask id={`${id}-mask`} maskUnits="userSpaceOnUse">
              <g filter={`url(#${id}-goo)`}>{shapes}</g>
              {parting && <motion.g style={{ opacity: vanish }}>{pillShape}</motion.g>}
            </mask>
          </defs>
          <g filter={`url(#${id}-shade)`}>{shapes}</g>
          {parting && (
            <motion.g filter={`url(#${id}-shade)`} style={{ opacity: vanish }}>
              {pillShape}
            </motion.g>
          )}
        </motion.svg>
        <motion.div
          aria-hidden="true"
          style={{ maskImage: fill, maskComposite: "intersect" }}
          className="absolute inset-0 bg-(image:--glass-fill) [backdrop-filter:var(--glass-backdrop)]"
        >
          <motion.span
            style={{ x: pillX, width, clipPath: rimClip }}
            className="absolute inset-y-0 left-0 rounded-[18px]"
          >
            <GlassRim />
          </motion.span>
        </motion.div>
      </div>
      <motion.button
        type="button"
        inert={!interactive}
        onClick={onClear}
        style={{ x: pill, width, opacity: vanish }}
        className="pointer-events-auto absolute inset-y-0 left-0 grid cursor-pointer place-items-center rounded-[18px] text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <motion.span style={{ opacity: fade }}>{label}</motion.span>
      </motion.button>
    </div>
  );
}

export { GlassStack };
export type { GlassStackProps };
