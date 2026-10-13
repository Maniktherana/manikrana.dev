import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { DynamicIsland, type IslandView } from "@/components/work/dynamic-island/dynamic-island";

const LOOP: { view: IslandView; ms: number }[] = [
  { view: "idle", ms: 1600 },
  { view: "ring", ms: 2800 },
  { view: "timer", ms: 4200 },
];

export function Preview() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(
      () => setStep((current) => (current + 1) % LOOP.length),
      LOOP[step].ms,
    );
    return () => window.clearTimeout(id);
  }, [reduceMotion, step]);

  return (
    <div className="@container flex size-full items-center justify-center">
      <div className="h-40 w-80 shrink-0 @max-xs:scale-85">
        <DynamicIsland view={reduceMotion ? "timer" : LOOP[step].view} />
      </div>
    </div>
  );
}
