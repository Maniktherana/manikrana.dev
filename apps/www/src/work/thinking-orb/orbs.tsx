import type { ComponentProps } from "react";
import { DiffusionOrb, type DiffusionOrbProps } from "./diffusion-orb";
import { DnaOrb, type DnaOrbProps } from "./dna-orb";
import { GeminiOrb, type GeminiOrbProps } from "./gemini-orb";
import type { NoteAudio } from "./use-note-audio";

export type LookName = "resting" | "listening" | "thinking";
export type OrbId = "diffusion" | "gemini" | "dna";

export const ORBS: Record<OrbId, { name: string }> = {
  diffusion: { name: "Diffusion" },
  gemini: { name: "Gemini" },
  dna: { name: "DNA" },
};

const DIFFUSION_LOOKS = {
  resting: { state: "listening" },
  listening: { state: "listening" },
  thinking: { state: "thinking" },
} satisfies Record<LookName, DiffusionOrbProps>;

const GEMINI_LOOKS = {
  resting: { audioMode: "user", audioLevel: 0 },
  listening: { audioMode: "user" },
  thinking: { audioMode: "assistant", audioLevel: 0.3 },
} satisfies Record<LookName, GeminiOrbProps>;

const DNA_LOOKS = {
  resting: { speed: 0.4 },
  listening: { speed: 0.4 },
  thinking: { speed: 1.4 },
} satisfies Record<LookName, DnaOrbProps>;

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
