import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useWatching } from "@manikrana/ui/hooks/use-watching";
import { DotMatrix } from "./dot-matrix";
import { PATTERNS } from "./showcase";

const LOOPS = 2;

const CELL = 18;

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const { pattern } = PATTERNS[index];

  useEffect(() => {
    if (!watching || reducedMotion) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % PATTERNS.length),
      pattern.period * LOOPS * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [pattern, reducedMotion, watching]);

  return (
    <div ref={ref} className="@container flex size-full items-center justify-center">
      <DotMatrix
        pattern={pattern}
        cell={CELL}
        gapRatio={0.2}
        paused={!watching}
        className="w-[min(100cqw_-_4rem,21.6rem)]"
      />
    </div>
  );
}
