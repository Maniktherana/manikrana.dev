/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * A carousel of the three orbs, on a loop that never ends. The orb in the
 * center is the active one: it steps through its states while the other two
 * wait at its sides, smaller and dimmer. When it has shown them all, the
 * carousel slides the next orb into the center. Nothing resolves: the waves
 * never go to zero. After DNA the carousel slides on to Diffusion again, so
 * the loop wraps without a seam.
 *
 *      0ms   Diffusion is in the center, resting: face-on, one slow wave
 *   1400ms   Diffusion thinks: it tilts and carries two waves
 *   3600ms   the carousel slides; Gemini rests: a low pale crest
 *   5000ms   Gemini listens: the voice note plays from its start, and the crest
 *            follows the voice (the note is 4.4s; the whole of it plays, then
 *            half a second of room)
 *   9900ms   Gemini thinks: the assistant takes over, hues drift through the blue
 *  12300ms   the carousel slides; DNA rests: the light sheet drifts
 *  13700ms   DNA thinks: the same sheet at three and a half times the pace
 *  16100ms   the carousel slides back to Diffusion; the loop starts over
 *
 * Reduced motion shows one still frame: Diffusion resting, the others beside it.
 * ───────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { NOTE_MS } from "@/work/voice-edge/note-analyser";
import { useWatching } from "@/work/use-watching";
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

// Gemini listens for the whole voice note and half a second of room after it.
const LISTENING = Math.ceil((NOTE_MS + 500) / 100) * 100;

const TIMING = {
  diffusion: 0, // Diffusion rests in the center
  diffusionThinking: 1400, // Diffusion thinks
  gemini: 3600, // slide to Gemini, resting
  geminiListening: 5000, // Gemini hears the voice note
  geminiThinking: 5000 + LISTENING, // Gemini thinks
  dna: 5000 + LISTENING + 2400, // slide to DNA, resting
  dnaThinking: 5000 + LISTENING + 3800, // DNA thinks
  loop: 5000 + LISTENING + 6200, // slide back to Diffusion; the loop starts over
} satisfies Record<Stage | "loop", number>;

// The orbs in carousel order, and what the center orb shows at each stage.
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

// Where an orb sits by its distance from the center: how far over (percent of
// its own width), how small, how bright. Two away is outside the tile, where
// an orb waits to slide in or has slid out.
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

// An orb as wide as the tile allows, the center at full size and a neighbour
// at 60% on each side with a gap of 15% of the center: 2.5 orbs across, inside
// the tile's 20px margins, up to the orb's drawing size of 9.5rem.
const ORB_SIZE = 152;
const ORB_BOX =
  "col-start-1 row-start-1 flex size-[clamp(4rem,calc((100cqw_-_2.5rem)/2.5),9.5rem)]";

function slotAt(distance: number) {
  const { x, scale, opacity } = SLOTS[Math.min(Math.abs(distance), SLOTS.length - 1)];
  return { x: `${Math.sign(distance) * x}%`, scale, opacity };
}

// Steps the storyboard while `playing`. `position` counts slides forever, so
// the carousel keeps moving the same way when it wraps from DNA to Diffusion.
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
  // The voice note plays from its start whenever the center orb listens to it.
  const audio = useNoteAudio(hearsNote(active, look));

  return (
    <div ref={ref} className="@container grid size-full place-items-center">
      {/* Five orbs, two away on each side, each keyed by its place in the endless line. */}
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
