import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { Slider } from "@manikrana/ui/components/slider";
import { useWatching } from "@manikrana/ui/hooks/use-watching";

const TIMING = {
  rest: 0,
  enter: 400,
  hover: 850,
  dragRight: 1900,
  pullRight: 3300,
  releaseRight: 4600,
  dragLeft: 5600,
  pullLeft: 7100,
  releaseLeft: 8400,
  press: 9300,
  lift: 9500,
  leave: 10300,
  loop: 11200,
} satisfies Record<Stage | "loop", number>;

const AT = {
  away: { left: 100, top: 170 },
  handle: { left: 50, top: 70 },
  high: { left: 94, top: 70 },
  end: { left: 100, top: 70 },
  pastEnd: { left: 200, top: 70 },
  low: { left: 8, top: 70 },
  pastStart: { left: -100, top: 70 },
};

const CURSOR = {
  fade: { duration: 0.2 },
  pressScale: 0.8,
  pinch: { type: "spring", visualDuration: 0.15, bounce: 0 },
  glide: { type: "spring", visualDuration: 0.7, bounce: 0.1 },
  drag: { type: "spring", visualDuration: 1, bounce: 0, delay: 0.15 },
  pull: { type: "spring", visualDuration: 0.6, bounce: 0 },
} satisfies Record<string, Transition | number>;

type Shot = {
  at: { left: number; top: number };
  travel: Transition;
  visible: boolean;
  hover: boolean;
  down: boolean;
};

const HOVERING = { visible: true, hover: true, down: false };
const HELD = { visible: true, hover: true, down: true };

const SHOTS = {
  rest: { at: AT.away, travel: CURSOR.glide, visible: false, hover: false, down: false },
  enter: { at: AT.handle, travel: CURSOR.glide, visible: true, hover: false, down: false },
  hover: { at: AT.handle, travel: CURSOR.glide, ...HOVERING },
  dragRight: { at: AT.high, travel: CURSOR.drag, ...HELD },
  pullRight: { at: AT.pastEnd, travel: CURSOR.pull, ...HELD },
  releaseRight: { at: AT.end, travel: CURSOR.glide, ...HOVERING },
  dragLeft: { at: AT.low, travel: CURSOR.drag, ...HELD },
  pullLeft: { at: AT.pastStart, travel: CURSOR.pull, ...HELD },
  releaseLeft: { at: AT.handle, travel: CURSOR.glide, ...HOVERING },
  press: { at: AT.handle, travel: CURSOR.glide, ...HELD },
  lift: { at: AT.handle, travel: CURSOR.glide, ...HOVERING },
  leave: { at: AT.away, travel: CURSOR.glide, visible: false, hover: false, down: false },
} satisfies Record<string, Shot>;

type Stage = keyof typeof SHOTS;

const STAGES = Object.keys(SHOTS) as Stage[];
const START_VALUE = 50;
const STILL: Shot = { ...SHOTS.rest, hover: true };
const STILL_VALUE = 60;

export function Preview() {
  const reduceMotion = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const held = useRef(false);
  const watching = useWatching(root);
  const [stage, setStage] = useState<Stage>("rest");
  const shot = reduceMotion ? STILL : SHOTS[stage];

  useEffect(() => {
    if (reduceMotion || !watching) return;
    const next = STAGES[(STAGES.indexOf(stage) + 1) % STAGES.length];
    const nextAt = next === STAGES[0] ? TIMING.loop : TIMING[next];
    const timer = window.setTimeout(() => setStage(next), nextAt - TIMING[stage]);
    return () => window.clearTimeout(timer);
  }, [watching, reduceMotion, stage]);

  useEffect(() => {
    const node = cursor.current;
    if (!slider.current || !node) return;
    hover(slider.current, shot.hover);
    if (shot.down === held.current) return;
    held.current = shot.down;
    pointer(slider.current, shot.down ? "pointerdown" : "pointerup", tipOf(node));
  }, [shot]);

  function follow() {
    const node = cursor.current;
    if (held.current && node && slider.current) pointer(slider.current, "pointermove", tipOf(node));
  }

  return (
    <div ref={root} className="flex size-full items-center justify-center">
      <div className="w-full px-6">
        <div className="relative">
          <Slider
            ref={slider}
            defaultValue={[reduceMotion ? STILL_VALUE : START_VALUE]}
            label="Opacity"
            step={10}
            unit="%"
            className="h-12"
          />
          {/* The arrow's tip must sit at the box's top-left corner: tipOf reads it as the pointer. */}
          <motion.div
            ref={cursor}
            initial={false}
            animate={{
              left: `${shot.at.left}%`,
              top: `${shot.at.top}%`,
              opacity: shot.visible ? 1 : 0,
              scale: shot.down ? CURSOR.pressScale : 1,
            }}
            transition={{
              default: shot.travel,
              opacity: CURSOR.fade,
              scale: CURSOR.pinch,
            }}
            onUpdate={follow}
            className="pointer-events-none absolute z-50 size-5 origin-top-left drop-shadow-sm"
          >
            <svg
              aria-hidden="true"
              viewBox="3.58 3.58 17.9 17.9"
              className="size-full overflow-visible"
            >
              <path
                d="M18.5762 8.94287L4.87859 3.58295C4.06653 3.26519 3.26519 4.06653 3.58295 4.8786L8.94287 18.5762C9.20565 19.2477 10.0713 19.4288 10.5812 18.9189L12.1465 17.3536C12.3417 17.1583 12.6583 17.1583 12.8536 17.3536L16.6465 21.1465C16.8417 21.3417 17.1583 21.3417 17.3536 21.1465L21.1465 17.3536C21.3417 17.1583 21.3417 16.8417 21.1465 16.6465L17.3536 12.8536C17.1583 12.6583 17.1583 12.3417 17.3536 12.1465L18.9189 10.5812C19.4288 10.0713 19.2477 9.20565 18.5762 8.94287Z"
                className="fill-black stroke-white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function tipOf(cursor: HTMLElement) {
  const { left, top } = cursor.getBoundingClientRect();
  return { clientX: left, clientY: top };
}

const TRACK = "[data-slot=slider-track]";

// React derives onMouseEnter/onMouseLeave from mouseout and its relatedTarget.
function hover(slider: HTMLElement, hovered: boolean) {
  const track = slider.querySelector(TRACK);
  if (!track) return;
  const [from, to] = hovered ? [slider, track] : [track, slider];
  from.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: to }));
}

function pointer(
  slider: HTMLElement,
  type: "pointerdown" | "pointermove" | "pointerup",
  tip: ReturnType<typeof tipOf>,
) {
  slider.querySelector(TRACK)?.dispatchEvent(
    new PointerEvent(type, {
      ...tip,
      bubbles: true,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
    }),
  );
}
