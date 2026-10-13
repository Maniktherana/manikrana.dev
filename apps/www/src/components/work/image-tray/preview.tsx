import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ANSWER_MS, Chat, type ChatBeat } from "@/components/work/image-tray/chat";
import { images } from "@/components/work/image-tray/images";
import { useWatching } from "@manikrana/ui/hooks/use-watching";

const settled = 1700 + ANSWER_MS;

const TIMING = {
  rest: 0,
  sent: 300,
  found: 1000,
  answered: 1700,
  tap: settled + 600,
  open: settled + 880,
  closed: settled + 3680,
  cleared: settled + 4380,
  loop: settled + 4780,
};

const STAGES = ["rest", "sent", "found", "answered", "tap", "open", "closed", "cleared"] as const;

type Stage = (typeof STAGES)[number];

const STILL: ChatBeat = { sent: true, found: true, answered: true };

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reduceMotion = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const stage: Stage = STAGES[beat % STAGES.length]!;
  const step = STAGES.indexOf(stage);
  const tile = Math.floor(beat / STAGES.length) % 2;

  useEffect(() => {
    if (!watching || reduceMotion) return;
    const next = STAGES[(step + 1) % STAGES.length]!;
    const nextAt = next === "rest" ? TIMING.loop : TIMING[next];
    const id = window.setTimeout(
      () => setBeat((current) => (current + 1) % (STAGES.length * 2)),
      nextAt - TIMING[stage],
    );
    return () => window.clearTimeout(id);
  }, [beat, stage, step, watching, reduceMotion]);

  const at = (moment: Stage) => step >= STAGES.indexOf(moment);
  const chat: ChatBeat = reduceMotion
    ? STILL
    : { sent: at("sent"), found: at("found"), answered: at("answered"), cleared: at("cleared") };
  const image = reduceMotion ? images[0]! : stage === "open" ? images[tile]! : null;

  return (
    <div ref={ref} className="size-full">
      <Chat {...chat} image={image} tap={!reduceMotion && stage === "tap" ? tile : null} />
    </div>
  );
}
