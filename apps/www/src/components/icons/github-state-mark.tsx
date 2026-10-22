import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { Mark, type MarkProps } from "@/components/icons/mark";

export type PullRequestState = "open" | "merged" | "closed" | "draft";
export type IssueState = "open" | "completed" | "not-planned";

// Octicons (MIT, primer/octicons) redrawn as strokes along the centre of their 1.5px outlines, so
// each part can move on its own.
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const TRANSITION = { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } as const;

type Pose = { x?: number; y?: number; scale?: number; rotate?: number };

/** One part of the icon that eases into `pose` while hovered; the icon never loses a piece. */
function Part({ hovered, pose, children }: { hovered: boolean; pose: Pose; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.g
      initial={false}
      animate={hovered && !reducedMotion ? pose : { x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={TRANSITION}
    >
      {children}
    </motion.g>
  );
}

// ease-in-out-cubic: a stroke leaves its start point gently, so it reads as growing from nothing.
const DRAW = { duration: 0.15, ease: [0.645, 0.045, 0.355, 1] } as const;

/** Counts hovers that start a draw; a hover during a draw doesn't restart it. 0 means at rest.
 *  A layout effect, so the reset lands before the hovered frame paints. */
function useRun(hovered: boolean) {
  const reducedMotion = useReducedMotion();
  const [run, setRun] = useState(0);
  const busy = useRef(false);
  useLayoutEffect(() => {
    if (!hovered || reducedMotion || busy.current) return;
    busy.current = true;
    setRun((count) => count + 1);
    window.setTimeout(() => (busy.current = false), DRAW.duration * 1000);
  }, [hovered, reducedMotion]);
  return run;
}

type Span = { run: number; from?: number; to?: number };

/** Timing for a stroke drawn between `from` and `to` of the run. */
const span = (from: number, to: number) => ({
  ...DRAW,
  delay: from * DRAW.duration,
  duration: (to - from) * DRAW.duration,
});

/** Draws `d` from its first point on each run. Hidden until its turn: round caps would otherwise
 *  leave dots at both ends of the zero-length stroke. */
function Draw({ run, d, from = 0, to = 1 }: Span & { d: string }) {
  const timing = span(from, to);
  return (
    <motion.path
      key={run}
      {...stroke}
      d={d}
      initial={run ? { pathLength: 0, opacity: 0 } : false}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ ...timing, opacity: { delay: timing.delay + 0.01, duration: 0 } }}
    />
  );
}

const WIPES = {
  up: { axis: "scaleY", origin: { originX: 0.5, originY: 1 } },
  right: { axis: "scaleX", origin: { originX: 0, originY: 0.5 } },
  left: { axis: "scaleX", origin: { originX: 1, originY: 0.5 } },
} as const;

/** Reveals its children `toward` the way their line travels, on each run. `box` covers them. */
function Wipe({
  run,
  box: [x, y, width, height],
  toward,
  from = 0,
  to = 1,
  children,
}: Span & {
  box: [number, number, number, number];
  toward: keyof typeof WIPES;
  children: ReactNode;
}) {
  const id = useId();
  const { axis, origin } = WIPES[toward];
  return (
    <>
      <clipPath id={id}>
        <motion.rect
          key={run}
          x={x}
          y={y}
          width={width}
          height={height}
          style={origin}
          initial={run ? { [axis]: 0 } : false}
          animate={{ [axis]: 1 }}
          transition={span(from, to)}
        />
      </clipPath>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
}

function Ring({ x, y }: { x: number; y: number }) {
  return <circle {...stroke} cx={x} cy={y} r="1.5" />;
}

function Rail({ x }: { x: number }) {
  return (
    <>
      <Ring x={x} y={3.25} />
      <path {...stroke} d={`M${x} 5v6`} />
      <Ring x={x} y={12.75} />
    </>
  );
}

export function PullRequestMark({
  state,
  hovered,
  className,
}: MarkProps & { state: PullRequestState }) {
  const run = useRun(hovered);
  return (
    <Mark
      name={`pr-${state}`}
      viewBox="0 0 16 16"
      className={cn("opacity-100 grayscale-0", className)}
    >
      {state === "open" && (
        <>
          <Rail x={3.75} />
          <Wipe run={run} box={[10.25, 10.25, 5, 5]} toward="up" to={0.35}>
            <Ring x={12.75} y={12.75} />
          </Wipe>
          <Draw run={run} d="M12.75 11V5A1.75 1.75 0 0 0 11 3.25H9.75" from={0.3} to={0.8} />
          <Wipe run={run} box={[7, 0.5, 3.25, 5.5]} toward="left" from={0.75}>
            <path d="M7.177 3.073 9.573.677A.25.25 0 0 1 10 .854v4.792a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
          </Wipe>
        </>
      )}
      {state === "merged" && (
        <>
          <Rail x={4.25} />
          <Draw run={run} d="M4.76 5.44A5 5 0 0 0 9.25 8.25H11" to={0.7} />
          <Wipe run={run} box={[10.25, 5.75, 5, 5]} toward="right" from={0.6}>
            <Ring x={12.75} y={8.25} />
          </Wipe>
        </>
      )}
      {state === "closed" && (
        <>
          <Rail x={3.25} />
          <Ring x={12.75} y={12.75} />
          <path {...stroke} d="M12.75 11V7.25" />
          <Part hovered={hovered} pose={{ rotate: 90 }}>
            <path {...stroke} d="m11.25 1.75 3 3m0-3-3 3" />
          </Part>
        </>
      )}
      {state === "draft" && (
        <>
          <Rail x={3.25} />
          <Ring x={12.75} y={12.75} />
          <Part hovered={hovered} pose={{ y: -0.75 }}>
            <circle cx="12.75" cy="7.5" r="1.25" />
            <circle cx="12.75" cy="3.25" r="1.25" />
          </Part>
        </>
      )}
    </Mark>
  );
}

export function IssueMark({ state, hovered, className }: MarkProps & { state: IssueState }) {
  const run = useRun(hovered);
  return (
    <Mark
      name={`issue-${state}`}
      viewBox="0 0 16 16"
      className={cn("opacity-100 grayscale-0", className)}
    >
      <circle {...stroke} cx="8" cy="8" r="7.25" />
      {state === "open" && (
        <Part hovered={hovered} pose={{ scale: 1.35 }}>
          <circle cx="8" cy="8" r="1.5" />
        </Part>
      )}
      {state === "completed" && <Draw run={run} d="M5.25 7.75 7.25 9.75 10.75 6.25" />}
      {state === "not-planned" && (
        <Part hovered={hovered} pose={{ rotate: 180 }}>
          <path {...stroke} d="M10.75 5.25 5.25 10.75" />
        </Part>
      )}
    </Mark>
  );
}
