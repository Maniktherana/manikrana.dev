import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { NOTE_MS } from "@/components/work/voice-edge/note-analyser";
import { useWatching } from "@manikrana/ui/hooks/use-watching";
import { DemoOrb, hearsNote, type LookName, type OrbId } from "./orbs";
import { useNoteAudio } from "./use-note-audio";

type Stage =
  | "diffusion"
  | "diffusionThinking"
  | "gemini"
  | "geminiListening"
  | "geminiThinking"
  | "dna"
  | "dnaThinking";

const LISTENING = Math.ceil((NOTE_MS + 500) / 100) * 100;

const TIMING = {
  diffusion: 0,
  diffusionThinking: 1400,
  gemini: 3600,
  geminiListening: 5000,
  geminiThinking: 5000 + LISTENING,
  dna: 5000 + LISTENING + 2400,
  dnaThinking: 5000 + LISTENING + 3800,
  loop: 5000 + LISTENING + 6200,
} satisfies Record<Stage | "loop", number>;

const ORDER: OrbId[] = ["diffusion", "gemini", "dna"];

const SHOWING: Record<Stage, { orb: OrbId; look: LookName }> = {
  diffusion: { orb: "diffusion", look: "resting" },
  diffusionThinking: { orb: "diffusion", look: "thinking" },
  gemini: { orb: "gemini", look: "resting" },
  geminiListening: { orb: "gemini", look: "listening" },
  geminiThinking: { orb: "gemini", look: "thinking" },
  dna: { orb: "dna", look: "resting" },
  dnaThinking: { orb: "dna", look: "thinking" },
};

const SLOTS = [
  { x: 0, scale: 1, opacity: 1 },
  { x: 95, scale: 0.6, opacity: 0.4 },
  { x: 190, scale: 0.5, opacity: 0 },
];

const SLIDE = {
  x: { type: "spring", visualDuration: 0.8, bounce: 0.1 },
  scale: { type: "spring", visualDuration: 0.8, bounce: 0.1 },
  opacity: { duration: 0.5, ease: "easeOut" },
} satisfies Transition;

const ORB_SIZE = 152;
const ORB_BOX =
  "col-start-1 row-start-1 flex size-[clamp(4rem,calc((100cqw_-_2.5rem)/2.5),9.5rem)]";

function slotAt(distance: number) {
  const { x, scale, opacity } = SLOTS[Math.min(Math.abs(distance), SLOTS.length - 1)];
  return { x: `${Math.sign(distance) * x}%`, scale, opacity };
}

function useStoryboard(playing: boolean) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("diffusion");
  const [lap, setLap] = useState(0);

  useEffect(() => {
    setStage("diffusion");

    if (!playing || reducedMotion) return undefined;

    const timers: number[] = [];
    const after = (ms: number, step: () => void) => {
      timers.push(window.setTimeout(step, ms));
    };

    after(TIMING.diffusionThinking, () => setStage("diffusionThinking"));
    after(TIMING.gemini, () => setStage("gemini"));
    after(TIMING.geminiListening, () => setStage("geminiListening"));
    after(TIMING.geminiThinking, () => setStage("geminiThinking"));
    after(TIMING.dna, () => setStage("dna"));
    after(TIMING.dnaThinking, () => setStage("dnaThinking"));
    after(TIMING.loop, () => {
      setStage("diffusion");
      setLap((current) => current + 1);
    });

    return () => timers.forEach(window.clearTimeout);
  }, [lap, playing, reducedMotion]);

  const { orb, look } = SHOWING[stage];
  return { look, orb, position: lap * ORDER.length + ORDER.indexOf(orb) };
}

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const { look, orb: active, position } = useStoryboard(useWatching(ref));
  const audio = useNoteAudio(hearsNote(active, look));

  return (
    <div ref={ref} className="@container grid size-full place-items-center">
      {/* Keyed by place in the endless line, so each orb slides instead of swapping. */}
      {[-2, -1, 0, 1, 2].map((distance) => {
        const index = position + distance;
        const id = ORDER[((index % ORDER.length) + ORDER.length) % ORDER.length];

        return (
          <motion.div
            key={index}
            initial={false}
            animate={slotAt(distance)}
            transition={SLIDE}
            className={ORB_BOX}
          >
            <DemoOrb
              id={id}
              size={ORB_SIZE}
              className="size-full"
              look={distance === 0 ? look : "resting"}
              audio={audio}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
