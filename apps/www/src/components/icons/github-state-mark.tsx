import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { Mark, type MarkProps } from "@/components/icons/mark";

export type PullRequestState = "open" | "merged" | "closed" | "draft";
export type IssueState = "open" | "completed" | "not-planned";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// Draws the state's accent stroke in again on each hover.
function Accent({ hovered, d }: { hovered: boolean; d: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.path
      {...line}
      d={d}
      initial={false}
      animate={{ pathLength: hovered && !reducedMotion ? [0, 1] : 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    />
  );
}

export function PullRequestMark({
  state,
  hovered,
  className,
}: MarkProps & { state: PullRequestState }) {
  const reducedMotion = useReducedMotion();
  return (
    <Mark
      name={`pr-${state}`}
      viewBox="0 0 16 16"
      className={cn("opacity-100 grayscale-0", className)}
    >
      <circle {...line} cx="4" cy="3.5" r="1.75" />
      <path {...line} d="M4 5.25v5.5" />
      <circle {...line} cx="4" cy="12.5" r="1.75" />
      {state === "merged" ? (
        <>
          <circle {...line} cx="12" cy="9" r="1.75" />
          <Accent hovered={hovered} d="M4 5.25c0 2 1.75 3.75 3.75 3.75h2.5" />
        </>
      ) : (
        <circle {...line} cx="12" cy="12.5" r="1.75" />
      )}
      {state === "open" && (
        <Accent hovered={hovered} d="M12 10.75V6.5a3 3 0 0 0-3-3H7m1.5-1.5L7 3.5 8.5 5" />
      )}
      {state === "closed" && (
        <>
          <path {...line} d="M12 8.25v2.5" />
          <Accent hovered={hovered} d="M10.25 2.75l3.5 3.5m0-3.5-3.5 3.5" />
        </>
      )}
      {state === "draft" &&
        [3.5, 6.5, 9.5].map((cy, index) => (
          <motion.circle
            key={cy}
            cx="12"
            cy={cy}
            r="0.9"
            initial={false}
            animate={{ opacity: hovered && !reducedMotion ? [0.2, 1] : 1 }}
            transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
          />
        ))}
    </Mark>
  );
}

export function IssueMark({ state, hovered, className }: MarkProps & { state: IssueState }) {
  return (
    <Mark
      name={`issue-${state}`}
      viewBox="0 0 16 16"
      className={cn("opacity-100 grayscale-0", className)}
    >
      <circle {...line} cx="8" cy="8" r="6.25" />
      {state === "open" && <circle cx="8" cy="8" r="1.25" />}
      {state === "completed" && <Accent hovered={hovered} d="M5.5 8.25 7.25 10l3.25-3.5" />}
      {state === "not-planned" && <Accent hovered={hovered} d="m3.75 12.25 8.5-8.5" />}
    </Mark>
  );
}
