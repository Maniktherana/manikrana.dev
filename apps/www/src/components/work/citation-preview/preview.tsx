import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import { useWatching } from "@manikrana/ui/hooks/use-watching";
import { ANSWER_MS, Answer } from "./answer";
import { CitationPreview } from "./citation-preview";
import { sources } from "./content";

const settled = 1000 + ANSWER_MS;

const TIMING = {
  rest: 0,
  sent: 300,
  answered: 1000,
  enter: settled + 600,
  hoverFirst: settled + 1350,
  openFirst: settled + 1470,
  move: settled + 4000,
  hoverSecond: settled + 4750,
  openSecond: settled + 4870,
  leave: settled + 7400,
  cleared: settled + 8100,
  loop: settled + 8500,
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

// Matches the board's w-80 h-76. tan(atan2(a, b)) is the unitless ratio a / b.
const BOARD = { width: 320, height: 304 };
const FIT = `min(tan(atan2(100cqw - 32px, ${BOARD.width}px)), tan(atan2(100cqh - 32px, ${BOARD.height}px)), 1)`;

const CARD = { width: 320, height: 180, offset: 8 };

const AWAY = { x: BOARD.width + 16, y: BOARD.height + 24 };

const HOVERED = "bg-foreground text-background [--favicon-surface:var(--foreground)]";

const CURSOR = {
  glide: { type: "spring", visualDuration: 0.7, bounce: 0.1 },
  fade: { duration: 0.2 },
} satisfies Record<string, Transition>;

const CLEAR = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } satisfies Transition;

const POP = { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] } satisfies Transition;

type Box = { left: number; top: number; width: number; height: number };

// The tile is inert and the real tooltip portals outside it, so the card is drawn on the board.
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

  useEffect(() => {
    if (reduceMotion || !watching) return;
    const next = STAGES[(STAGES.indexOf(stage) + 1) % STAGES.length]!;
    const nextAt = next === STAGES[0] ? TIMING.loop : TIMING[next];
    const timer = window.setTimeout(() => setStage(next), nextAt - TIMING[stage]);
    return () => window.clearTimeout(timer);
  }, [watching, reduceMotion, stage]);

  // Re-measured every stage so a late font that rewraps the text is caught.
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
        {/* The viewBox puts the arrow's tip at the box's top-left corner. */}
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

function pointOn(chip: Box) {
  return { x: chip.left + chip.width * 0.6, y: chip.top + chip.height * 0.6 };
}

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
