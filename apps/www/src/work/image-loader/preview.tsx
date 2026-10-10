import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useWatching } from "@/work/use-watching";
import { PATTERNS, Showcase, TILE_FIT, useCycle } from "./demo";

// Steps through the patterns, each for 4.8s. It pauses off screen, and under
// reduced motion it holds still on the first pattern's frozen frame.
export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reducedMotion = useReducedMotion();
  const cycle = useCycle(watching && !reducedMotion, 4800);

  return (
    <Showcase
      ref={ref}
      cycle={cycle}
      grid={PATTERNS[cycle % PATTERNS.length]!.grid}
      fit={TILE_FIT}
    />
  );
}
