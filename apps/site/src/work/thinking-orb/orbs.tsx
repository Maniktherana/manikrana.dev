import type { ComponentProps } from "react";
import { DiffusionOrb, type DiffusionOrbProps } from "./diffusion-orb";
import { DnaOrb, type DnaOrbProps } from "./dna-orb";
import { GeminiOrb, type GeminiOrbProps } from "./gemini-orb";
import type { NoteAudio } from "./use-note-audio";

// A look only changes props the orb eases or carries on one continuous clock,
// so switching looks never pops.
export type LookName = "resting" | "listening" | "thinking";
export type OrbId = "diffusion" | "gemini" | "dna";

export const ORBS: Record<OrbId, { name: string }> = {
  diffusion: { name: "Diffusion" },
  gemini: { name: "Gemini" },
  dna: { name: "DNA" },
};

// Resting is the look an orb waits in. Diffusion and DNA have no separate
// listening, so they rest there.
const DIFFUSION_LOOKS = {
  resting: { state: "listening" }, // face-on, one slow wave
  listening: { state: "listening" },
  thinking: { state: "thinking" }, // tilted, two traveling waves
} satisfies Record<LookName, DiffusionOrbProps>;

const GEMINI_LOOKS = {
  resting: { audioMode: "user", audioLevel: 0 }, // a quiet room: a low pale crest
  listening: { audioMode: "user" }, // the voice note lifts the crest
  thinking: { audioMode: "assistant", audioLevel: 0.3 }, // the assistant's hues
} satisfies Record<LookName, GeminiOrbProps>;

const DNA_LOOKS = {
  resting: { speed: 0.4 }, // the light sheet drifting
  listening: { speed: 0.4 },
  thinking: { speed: 1.4 }, // the same sheet, three and a half times the pace
} satisfies Record<LookName, DnaOrbProps>;

// Only Gemini's orb reacts to sound, so it alone takes its level from the
// voice note, and only while it listens.
export function hearsNote(id: OrbId, look: LookName) {
  return id === "gemini" && look === "listening";
}

type DemoOrbProps = Omit<ComponentProps<"span">, "children"> & {
  id: OrbId;
  look?: LookName;
  size: number;
  paused?: boolean;
  audio?: NoteAudio;
};

// An orb in one of its looks, or in its defaults when `look` is left out.
export function DemoOrb({ id, look, audio, ...props }: DemoOrbProps) {
  switch (id) {
    case "diffusion":
      return <DiffusionOrb {...props} {...(look && DIFFUSION_LOOKS[look])} />;
    case "dna":
      return <DnaOrb {...props} {...(look && DNA_LOOKS[look])} />;
    case "gemini":
      return (
        <GeminiOrb
          {...props}
          {...(look && GEMINI_LOOKS[look])}
          {...(audio &&
            look &&
            hearsNote(id, look) && { audioLevel: audio.level, audioBands: audio.bands })}
        />
      );
  }
}
