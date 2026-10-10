import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Toolbar, ToolbarButton } from "@/components/toolbar";
import { useWatching } from "@/work/use-watching";
import { Answer } from "./answer";

const TIMING = {
  sent: 300,
  answered: 1000,
};

const BEATS = ["sent", "answered"] as const;

export function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const reached = reduceMotion ? BEATS.length : step;

  useEffect(() => {
    if (!watching || reduceMotion) return;
    const timers = BEATS.map((beat, index) =>
      window.setTimeout(() => setStep((current) => Math.max(current, index + 1)), TIMING[beat]),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [watching, reduceMotion, run]);

  const replay = () => {
    setStep(0);
    setRun((current) => current + 1);
  };

  return (
    <div ref={ref} className="relative flex size-full items-center justify-center px-6 pb-14">
      <Answer sent={reached >= 1} answered={reached >= 2} className="w-full max-w-xl" />
      <Toolbar aria-label="Citation chips">
        <ToolbarButton onClick={replay}>Replay</ToolbarButton>
      </Toolbar>
    </div>
  );
}
