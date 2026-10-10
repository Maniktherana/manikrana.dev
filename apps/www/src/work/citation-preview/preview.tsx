import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import { useWatching } from "@/work/use-watching";
import { ANSWER_MS, Answer } from "./answer";
import { CitationPreview } from "./citation-preview";
import { sources } from "./content";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * The answer arrives, then a cursor rests on one chip and another,
 * and each one's card opens above it as the real tooltip would.
 * The tile is inert and the real tooltip renders in a portal
 * outside it, so the card here is drawn on the board.
 *
 *     0ms   an empty board
 *   300ms   the question sends, y 8 → 0 (180ms)
 *  1000ms   the answer streams, a word every 46ms, the chips
 *           landing among the words; settled by 3358ms
 *  3958ms   cursor fades in and glides to the PromCon chip
 *  4708ms   hover: the chip fills
 *  4828ms   the card opens, after the chip's 120ms delay
 *  7358ms   cursor glides to the shadcn/ui chip; the card closes
 *  8108ms   hover
 *  8228ms   the card opens
 * 10758ms   cursor fades out; the card closes
 * 11458ms   the board fades out (300ms)
 * 11858ms   loop
 *
 * The beats after the answer follow its length. Off screen the
 * loop pauses where it is. With reduced motion the tile holds the
 * finished answer with the shadcn/ui card open.
 * ───────────────────────────────────────────────────────── */

const settled = 1000 + ANSWER_MS;

const TIMING = {
  rest: 0, // empty board
  sent: 300, // question bubble sends
  answered: 1000, // answer starts streaming
  enter: settled + 600, // cursor fades in, glides to PromCon
  hoverFirst: settled + 1350, // PromCon chip fills
  openFirst: settled + 1470, // its card opens
  move: settled + 4000, // cursor glides to shadcn/ui
  hoverSecond: settled + 4750, // shadcn/ui chip fills
  openSecond: settled + 4870, // its card opens
  leave: settled + 7400, // cursor fades out
  cleared: settled + 8100, // board fades out
  loop: settled + 8500, // next round
} satisfies Record<Stage | "loop", number>;

type Target = "promcon" | "shadcn";

type Shot = {
  sent: boolean;
  answered: boolean;
  at: Target | "away";
  visible: boolean;
  hovered?: Target;
  open?: Target;
  cleared?: boolean;
};

// Every shot after the answer starts streaming.
const ANSWERED = { sent: true, answered: true } as const;

const SHOTS = {
  rest: { sent: false, answered: false, at: "away", visible: false },
  sent: { sent: true, answered: false, at: "away", visible: false },
  answered: { ...ANSWERED, at: "away", visible: false },
  enter: { ...ANSWERED, at: "promcon", visible: true },
  hoverFirst: { ...ANSWERED, at: "promcon", visible: true, hovered: "promcon" },
  openFirst: { ...ANSWERED, at: "promcon", visible: true, hovered: "promcon", open: "promcon" },
  move: { ...ANSWERED, at: "shadcn", visible: true },
  hoverSecond: { ...ANSWERED, at: "shadcn", visible: true, hovered: "shadcn" },
  openSecond: { ...ANSWERED, at: "shadcn", visible: true, hovered: "shadcn", open: "shadcn" },
  leave: { ...ANSWERED, at: "away", visible: false },
  cleared: { ...ANSWERED, at: "away", visible: false, cleared: true },
} satisfies Record<string, Shot>;

type Stage = keyof typeof SHOTS;

const STAGES = Object.keys(SHOTS) as Stage[];
const STILL: Shot = SHOTS.openSecond;

// The board is the answer at its natural size, 320×304, drawn smaller where the
// tile is: tan(atan2(a, b)) is a / b.
const BOARD = { width: 320, height: 304 };
const FIT = `min(tan(atan2(100cqw - 32px, ${BOARD.width}px)), tan(atan2(100cqh - 32px, ${BOARD.height}px)), 1)`;

// The tooltip's card: w-80 at 16:9, 8px off the chip.
const CARD = { width: 320, height: 180, offset: 8 };

// Off the board's bottom-right corner, where the cursor comes from and goes.
const AWAY = { x: BOARD.width + 16, y: BOARD.height + 24 };

// What :hover paints on a chip, for the one under the cursor.
const HOVERED = "bg-foreground text-background [--favicon-surface:var(--foreground)]";

const CURSOR = {
  glide: { type: "spring", visualDuration: 0.7, bounce: 0.1 },
  fade: { duration: 0.2 },
} satisfies Record<string, Transition>;

// The board fades out before the loop starts over.
const CLEAR = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } satisfies Transition;

// tw-animate's enter and exit, as the shared tooltip runs them: 150ms with CSS's ease.
const POP = { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] } satisfies Transition;

type Box = { left: number; top: number; width: number; height: number };

export function Preview() {
  const reduceMotion = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const promcon = useRef<HTMLAnchorElement>(null);
  const shadcn = useRef<HTMLAnchorElement>(null);
  const watching = useWatching(root);
  const [stage, setStage] = useState<Stage>("rest");
  const [boxes, setBoxes] = useState<Record<Target, Box>>();
  const shot: Shot = reduceMotion ? STILL : SHOTS[stage];

  // Step to the next stage after the gap between the two. Going off screen
  // clears the timer, and coming back resumes from the same stage.
  useEffect(() => {
    if (reduceMotion || !watching) return;
    const next = STAGES[(STAGES.indexOf(stage) + 1) % STAGES.length]!;
    const nextAt = next === STAGES[0] ? TIMING.loop : TIMING[next];
    const timer = window.setTimeout(() => setStage(next), nextAt - TIMING[stage]);
    return () => window.clearTimeout(timer);
  }, [watching, reduceMotion, stage]);

  // Where the two chips sit on the board, measured at every stage, so a late font that rewraps
  // the text is caught before the cursor sets off.
  useLayoutEffect(() => {
    if (!board.current || !promcon.current || !shadcn.current) return;
    const next = {
      promcon: boxOn(board.current, promcon.current),
      shadcn: boxOn(board.current, shadcn.current),
    };
    setBoxes((current) => (current && sameBoxes(current, next) ? current : next));
  }, [stage, reduceMotion]);

  const cursor = boxes && shot.at !== "away" ? pointOn(boxes[shot.at]) : AWAY;
  const card = boxes && shot.open ? place(boxes[shot.open]) : undefined;

  return (
    <div
      ref={root}
      style={{ "--fit": FIT } as CSSProperties}
      className="@container-size grid size-full place-items-center"
    >
      <motion.div
        ref={board}
        initial={false}
        animate={{ opacity: shot.cleared ? 0 : 1 }}
        transition={shot.cleared ? CLEAR : { duration: 0 }}
        className="relative flex h-76 w-80 shrink-0 scale-(--fit) flex-col justify-end"
      >
        <Answer
          sent={shot.sent}
          answered={shot.answered}
          chip={(id) => ({
            ref: id === "promcon" ? promcon : id === "shadcn" ? shadcn : undefined,
            className: id === shot.hovered ? HOVERED : undefined,
          })}
        />
        <AnimatePresence initial={false}>
          {shot.open && card && (
            <motion.div
              key={shot.open}
              initial={{ opacity: 0, scale: 0.95, y: card.side === "top" ? 8 : -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={reduceMotion ? { duration: 0 } : POP}
              style={{ left: card.left, top: card.top, transformOrigin: card.origin }}
              className="pointer-events-none absolute w-80"
            >
              <CitationPreview source={sources[shot.open]} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* The arrow's tip is the box's top-left corner, so the box's position
            is the pointer's. */}
        <motion.div
          initial={false}
          animate={{ left: cursor.x, top: cursor.y, opacity: shot.visible ? 1 : 0 }}
          transition={
            reduceMotion ? { duration: 0 } : { default: CURSOR.glide, opacity: CURSOR.fade }
          }
          className="pointer-events-none absolute z-10 size-5 drop-shadow-sm"
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
      </motion.div>
    </div>
  );
}

// The chip's box in the board's own pixels: its place on screen, less the board's,
// divided by the scale the board is drawn at.
function boxOn(board: HTMLElement, chip: HTMLElement): Box {
  const frame = board.getBoundingClientRect();
  const rect = chip.getBoundingClientRect();
  const scale = frame.width / board.offsetWidth || 1;
  return {
    left: (rect.left - frame.left) / scale,
    top: (rect.top - frame.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

function sameBoxes(a: Record<Target, Box>, b: Record<Target, Box>) {
  return (["promcon", "shadcn"] as const).every((target) =>
    (["left", "top", "width", "height"] as const).every(
      (side) => Math.abs(a[target][side] - b[target][side]) < 0.5,
    ),
  );
}

// The cursor rests a little right of and below the chip's middle.
function pointOn(chip: Box) {
  return { x: chip.left + chip.width * 0.6, y: chip.top + chip.height * 0.6 };
}

// The card centered over the chip and kept on the board, flipped below it when
// there is no room above, with its transform origin at the chip, as Base UI
// positions it.
function place(chip: Box) {
  const center = chip.left + chip.width / 2;
  const left = Math.min(Math.max(center - CARD.width / 2, 0), BOARD.width - CARD.width);
  const above = chip.top - CARD.offset - CARD.height;
  const below = chip.top + chip.height + CARD.offset;
  const side = above >= 0 || below + CARD.height > BOARD.height ? "top" : "bottom";
  return {
    side,
    left,
    top: side === "top" ? Math.max(above, 0) : below,
    origin: `${center - left}px ${side === "top" ? `calc(100% + ${CARD.offset}px)` : `-${CARD.offset}px`}`,
  };
}
