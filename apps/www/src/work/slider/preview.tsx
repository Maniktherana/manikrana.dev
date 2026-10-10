/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * A cursor works the real slider, at its natural 360px. Every hover, press,
 * drag and release reaches it as the DOM events a mouse would send. The whole
 * composition is drawn smaller where the tile is narrower. The value rests at
 * 50 at both ends of the loop.
 *
 *      0ms   rest: no cursor, the track idles
 *    400ms   cursor fades in below the track and glides up to the handle
 *    850ms   hover: the handle grows in, tick marks (every 10) and text light up
 *   1900ms   press (the cursor pinches), then drag right to 94
 *            the handle slides under the value text and dims
 *   3300ms   keep pulling, off the tile: the track stretches to its limit
 *   4600ms   release: the track springs back; the cursor glides to the end
 *   5600ms   press, then drag left to 8
 *            the handle crosses the clear stretch, then slides under the label
 *   7100ms   keep pulling, off the tile: the track stretches the other way
 *   8400ms   release: springs back; the cursor glides to 50
 *   9300ms   press
 *   9500ms   lift: a click, so the handle springs to 50
 *  10300ms   leave: hover ends, the cursor fades out below the track
 *  11200ms   loop
 * ───────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { Slider } from "@/work/slider/slider";
import { useWatching } from "@/work/use-watching";

const TIMING = {
  rest: 0, // the track idles with no cursor
  enter: 400, // cursor fades in and glides to the handle
  hover: 850, // cursor reaches the track
  dragRight: 1900, // press, then drag toward the value text
  pullRight: 3300, // keep going past the end
  releaseRight: 4600, // let go; cursor glides to the end
  dragLeft: 5600, // press, then drag across the track
  pullLeft: 7100, // keep going past the start
  releaseLeft: 8400, // let go; cursor glides to the handle
  press: 9300, // button down on the handle
  lift: 9500, // button up: a click
  leave: 10300, // cursor fades out below the track
  loop: 11200, // start over
} satisfies Record<Stage | "loop", number>;

// Where the cursor's tip goes, in percent of the track's width and height from
// its top-left corner. The tip sits low on the track so the arrow stays off
// the label and the value. The stretch tops out (at MAX_STRETCH, 8px) once the
// pointer is 232px past an end, so a track's width past it is enough at any
// size, and the tile clips the cursor on the way.
const AT = {
  away: { left: 100, top: 170 }, // below the track, off to the right
  handle: { left: 50, top: 70 }, // on the handle at rest
  high: { left: 94, top: 70 }, // over the value text
  end: { left: 100, top: 70 }, // at the track's right end
  pastEnd: { left: 200, top: 70 }, // a track's width beyond the end
  low: { left: 8, top: 70 }, // over the label
  pastStart: { left: -100, top: 70 }, // a track's width before the start
};

const CURSOR = {
  fade: { duration: 0.2 }, // in and out
  pressScale: 0.8, // the arrow pinches while the button is down
  pinch: { type: "spring", visualDuration: 0.15, bounce: 0 },
  glide: { type: "spring", visualDuration: 0.7, bounce: 0.1 }, // button up
  drag: { type: "spring", visualDuration: 1, bounce: 0, delay: 0.15 }, // pinch, then go
  pull: { type: "spring", visualDuration: 0.6, bounce: 0 }, // past an end
} satisfies Record<string, Transition | number>;

type Shot = {
  at: { left: number; top: number };
  travel: Transition;
  visible: boolean; // the cursor is on show
  hover: boolean; // the pointer is over the track
  down: boolean; // the button is held
};

// Cursor over the track, button up; and button down.
const HOVERING = { visible: true, hover: true, down: false };
const HELD = { visible: true, hover: true, down: true };

// One shot per stage, in the order they play.
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
// Reduced motion holds one frame: hovered, with the handle clear of both texts.
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

  // Step to the next stage after the gap between the two. Going off screen
  // clears the timer, and coming back resumes from the same stage.
  useEffect(() => {
    if (reduceMotion || !watching) return;
    const next = STAGES[(STAGES.indexOf(stage) + 1) % STAGES.length];
    const nextAt = next === STAGES[0] ? TIMING.loop : TIMING[next];
    const timer = window.setTimeout(() => setStage(next), nextAt - TIMING[stage]);
    return () => window.clearTimeout(timer);
  }, [watching, reduceMotion, stage]);

  // Hand the shot to the slider: hover, and press or release where the tip is.
  useEffect(() => {
    const node = cursor.current;
    if (!slider.current || !node) return;
    hover(slider.current, shot.hover);
    if (shot.down === held.current) return;
    held.current = shot.down;
    pointer(slider.current, shot.down ? "pointerdown" : "pointerup", tipOf(node));
  }, [shot]);

  // While the button is held, each frame of the cursor's travel is the pointer
  // moving.
  function follow() {
    const node = cursor.current;
    if (held.current && node && slider.current) pointer(slider.current, "pointermove", tipOf(node));
  }

  return (
    <div ref={root} className="flex size-full items-center justify-center">
      {/* The slider is fluid by design, so it fills the tile with 24px of room
          each side for the cursor, at its own text size and a taller track. */}
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
          {/* The arrow's tip is the box's top-left corner, so the box's position
              is the pointer's. */}
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

// The pointer position a cursor box stands for: its top-left corner, which
// stays put when the arrow pinches.
function tipOf(cursor: HTMLElement) {
  const { left, top } = cursor.getBoundingClientRect();
  return { clientX: left, clientY: top };
}

// The element that carries every mouse and pointer handler of the slider.
const TRACK = "[data-slot=slider-track]";

// React builds onMouseEnter and onMouseLeave from mouseout, which a mouse sends
// when it crosses from one element into another. Crossing between the slider
// and its track enters and leaves the track alone.
function hover(slider: HTMLElement, hovered: boolean) {
  const track = slider.querySelector(TRACK);
  if (!track) return;
  const [from, to] = hovered ? [slider, track] : [track, slider];
  from.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: to }));
}

// A mouse is pointer 1, and its button is down from the press until the
// release.
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
