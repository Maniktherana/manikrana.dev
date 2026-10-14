import type { ComponentProps } from "react";
import { DiffusionOrb, type DiffusionOrbProps } from "./diffusion-orb";
import { FoldOrb, type FoldOrbProps } from "./fold-orb";
import { GeminiOrb, type GeminiOrbProps } from "./gemini-orb";
import type { NoteAudio } from "./use-note-audio";

export type LookName = "idle" | "listening" | "thinking";
export type OrbId = "diffusion" | "gemini" | "fold";

// Gemini has no idle state; it rests as the user look with no voice.
export type GeminiLook = Exclude<LookName, "idle">;

export const geminiLook = (look: LookName): GeminiLook => (look === "idle" ? "listening" : look);

export const ORBS: Record<OrbId, { name: string }> = {
  diffusion: { name: "Diffusion" },
  gemini: { name: "Gemini" },
  fold: { name: "Fold" },
};

const DIFFUSION_LOOKS = {
  idle: { state: "idle" },
  listening: { state: "listening" },
  thinking: { state: "thinking" },
} satisfies Record<LookName, DiffusionOrbProps>;

export const GEMINI_LOOKS = {
  listening: { audioMode: "user", audioLevel: 0 },
  thinking: { audioMode: "assistant", audioLevel: 0.3 },
} satisfies Record<GeminiLook, GeminiOrbProps>;

const FOLD_LOOKS = {
  idle: { state: "idle" },
  listening: { state: "listening" },
  thinking: { state: "thinking" },
} satisfies Record<LookName, FoldOrbProps>;

export type OrbDials = {
  diffusion: DiffusionOrbProps;
  fold: FoldOrbProps;
  gemini: GeminiOrbProps & { looks: Record<GeminiLook, GeminiOrbProps> };
};

export function hearsNote(id: OrbId, look: LookName) {
  return id === "gemini" && look === "listening";
}

type DemoOrbProps = Omit<ComponentProps<"span">, "children"> & {
  id: OrbId;
  look?: LookName;
  size: number;
  paused?: boolean;
  audio?: NoteAudio;
  dials?: OrbDials;
};

export function DemoOrb({ id, look, audio, dials, ...props }: DemoOrbProps) {
  switch (id) {
    case "diffusion":
      return <DiffusionOrb {...props} {...dials?.diffusion} {...(look && DIFFUSION_LOOKS[look])} />;
    case "fold":
      return <FoldOrb {...props} {...dials?.fold} {...(look && FOLD_LOOKS[look])} />;
    case "gemini": {
      const { looks = GEMINI_LOOKS, ...gemini } = dials?.gemini ?? {};
      return (
        <GeminiOrb
          {...props}
          {...gemini}
          {...(look && looks[geminiLook(look)])}
          {...(audio && { audioLevel: audio.level, audioBands: audio.bands })}
        />
      );
    }
  }
}
