import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export type StepPlaybackOptions = {
  step: number;
  count: number;
  messageDelay: number;
  hold: number;
  paused: boolean;
  onComplete: () => void;
};

export function useStepPlayback({
  step,
  count,
  messageDelay,
  hold,
  paused,
  onComplete,
}: StepPlaybackOptions) {
  // The server cannot know the preference, so it applies once mounted, after hydration.
  const [mounted, setMounted] = useState(false);
  const instant = useReducedMotion() === true && mounted;
  const [playback, setPlayback] = useState({ step, shown: 0 });
  const clock = useRef({ step, elapsed: 0, completed: false });
  const latest = useRef(onComplete);

  if (playback.step !== step) setPlayback({ step, shown: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    latest.current = onComplete;
  });

  useEffect(() => {
    if (instant) return;

    const current = clock.current;
    if (current.step !== step) Object.assign(current, { step, elapsed: 0, completed: false });
    if (paused || current.completed) return;

    const total = count * messageDelay + hold;
    const startedAt = performance.now();
    const timers: number[] = [];

    for (let shown = 1; shown <= count; shown++) {
      timers.push(
        window.setTimeout(
          () =>
            setPlayback((previous) =>
              previous.step === step && previous.shown >= shown ? previous : { step, shown },
            ),
          Math.max(0, shown * messageDelay - current.elapsed),
        ),
      );
    }

    timers.push(
      window.setTimeout(
        () => {
          current.elapsed = total;
          current.completed = true;
          latest.current();
        },
        Math.max(0, total - current.elapsed),
      ),
    );

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      if (!current.completed) current.elapsed += performance.now() - startedAt;
    };
  }, [instant, step, count, messageDelay, hold, paused]);

  return { shown: instant ? count : playback.shown };
}
