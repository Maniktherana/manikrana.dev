import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useWatching } from "@manikrana/ui/hooks/use-watching";
import { BotAvatar } from "./bot-avatar";
import { BOT_STATES } from "./choreography";
import type { BotShape } from "./shapes";
import { SHAPE_COLORS } from "./showcase";

const SHAPES: BotShape[] = ["circle", "cloud", "square", "droplet", "bean", "diamond"];

const STATE_MS = 2800;

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const state = BOT_STATES[step % BOT_STATES.length];
  const shape = SHAPES[Math.floor(step / BOT_STATES.length) % SHAPES.length];

  useEffect(() => {
    if (!watching || reducedMotion) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), STATE_MS);
    return () => window.clearTimeout(timer);
  }, [step, watching, reducedMotion]);

  return (
    <div ref={ref} className="@container grid size-full place-items-center">
      <BotAvatar
        state={state}
        shape={shape}
        paused={!watching}
        color={SHAPE_COLORS[shape]}
        eyeColor="var(--color-card)"
        className="size-[min(100cqmin_-_6rem,11rem)]"
      />
    </div>
  );
}
