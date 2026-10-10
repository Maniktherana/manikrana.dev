import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { DynamicIsland, type IslandView } from "@/work/dynamic-island/dynamic-island";

// Idle, then a call comes in (it flips to silent after a second), then a timer
// counts down, then back to idle.
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

  // The island hangs from the top of a fixed 320 by 160 box, as on a phone, so
  // it sits in the same place here and on the stage. Tiles narrower than the
  // box scale all of it down; the island inside never reflows.
  return (
    <div className="@container flex size-full items-center justify-center">
      <div className="h-40 w-80 shrink-0 @max-xs:scale-85">
        <DynamicIsland view={reduceMotion ? "timer" : LOOP[step].view} />
      </div>
    </div>
  );
}
