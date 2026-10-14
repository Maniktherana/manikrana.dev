import { useDialKit, type DialConfig } from "dialkit";
import { DIFFUSION_STATES } from "./diffusion-orb";
import { FOLD_STATES } from "./fold-orb";
import { GEMINI_STATES } from "./gemini-orb";
import { GEMINI_LOOKS, type OrbDials } from "./orbs";

// Temporary: every orb prop and per-state tuning value on the dev DialKit panel.

const ANGLE = [-180, 180, 1] as const;

const RANGES: Record<string, readonly [number, number, number]> = {
  pace: [0, 3, 0.05],
  variantMix: [0, 1, 0.01],
  hold: [0, 1, 0.01],
  swayAngle: [0, 90, 0.1],
  swaySpeed: [0, 6.28, 0.01],
  searchSwayAngle: [0, 90, 0.1],
  searchSwaySpeed: [0, 6.28, 0.01],
  wobbleAngle: [0, 90, 0.1],
  wobbleSpeed: [0, 6.28, 0.01],
  waveSpeed: [-6.28, 6.28, 0.01],
  secondaryWaveSpeed: [-6.28, 6.28, 0.01],
  lightAmount: [0, 1, 0.01],
  lightSpeed: [-6.28, 6.28, 0.01],
  searchTiltAngle: [0, 90, 0.1],
  searchTiltSpeed: [0, 6.28, 0.01],
  projectionTilt: ANGLE,
  yaw: ANGLE,
  rotation: ANGLE,
  waveAmplitude: [0, 2, 0.01],
  waveCount: [0, 8, 0.1],
  secondaryWave: [0, 1.5, 0.01],
  phaseSkew: [0, 6.28, 0.01],
  bandOffset: [-1, 1, 0.01],
  innerDiffusion: [0.05, 2, 0.01],
  outerDiffusion: [0.05, 2, 0.01],
  diffusionPower: [0.5, 4, 0.05],
  rearOpacity: [0, 1, 0.01],
  exposure: [0, 3, 0.01],
  highlight: [0, 1, 0.01],
  foldTwist: [0, 3, 0.01],
  foldDensity: [0, 3, 0.01],
  foldThickness: [0.1, 3, 0.01],
  foldSurfaceLight: [0, 3, 0.01],
  pulse: [0, 2, 0.01],
  pulseSpeed: [-20, 20, 0.1],
  pulseSpacing: [0, 3, 0.01],
  pulseRibbon: [0, 1, 0.01],
  voiceStrength: [0, 3, 0.01],
  clipLift: [-0.5, 0.5, 0.01],
  clipSoftness: [0, 1, 0.01],
  blueDiffusion: [0.1, 3, 0.01],
  colorFlowSpeed: [0, 4, 0.01],
  colorLayerMix: [0, 1, 0.01],
  voiceAmplitude: [0, 3, 0.01],
  voiceHarmonic: [0, 2, 0.01],
  restingWave: [0, 1, 0.01],
  restingSway: [0, 2, 0.01],
};

function sliders(values: Record<string, number>): DialConfig {
  const config: DialConfig = { _collapsed: true };
  for (const [key, value] of Object.entries(values)) {
    const [min, max, step] = RANGES[key] ?? [0, Math.max(1, value * 2), 0.01];
    config[key] = [value, min, max, step];
  }
  return config;
}

function states(tables: Record<string, Record<string, number>>): DialConfig {
  return Object.fromEntries(
    Object.entries(tables).map(([state, values]) => [state, sliders(values)]),
  );
}

const select = (options: string[], value: string) => ({
  type: "select" as const,
  options,
  default: value,
});

const PROPS = {
  variant: select(["weave", "search", "focus"], "weave"),
  speed: [1, 0.25, 3, 0.05],
  brilliance: [0.65, 0, 1, 0.01],
  transition: [0.5, 0.05, 2, 0.05],
} satisfies DialConfig;

const PALETTE = { palette: select(["opal", "ember", "tide"], "opal") };

const lookDials = ({ audioMode, audioLevel }: { audioMode: string; audioLevel: number }) => ({
  audioMode: select(["user", "assistant", "muted"], audioMode),
  audioLevel: [audioLevel, 0, 1, 0.01] as [number, number, number, number],
});

const GEMINI_BUTTONS = {
  _collapsed: true,
  userButton: lookDials(GEMINI_LOOKS.listening),
  assistantButton: lookDials(GEMINI_LOOKS.thinking),
} satisfies DialConfig;

function split(values: Record<string, unknown>, tables: Record<string, unknown>) {
  const props: Record<string, unknown> = {};
  const tuning: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key in tables) tuning[key] = value;
    else props[key] = value;
  }
  return { ...props, tuning };
}

// DialKit re-registers a panel whenever its config or options change, so both stay module constants.
const DIFFUSION_CONFIG = { ...PROPS, ...PALETTE, ...states(DIFFUSION_STATES) };
const FOLD_CONFIG = { ...PROPS, ...PALETTE, ...states(FOLD_STATES) };
const GEMINI_CONFIG = { ...PROPS, buttons: GEMINI_BUTTONS, ...states(GEMINI_STATES) };

const DIFFUSION_OPTIONS = { id: "thinking-orb-diffusion", persist: true };
const FOLD_OPTIONS = { id: "thinking-orb-fold", persist: true };
const GEMINI_OPTIONS = { id: "thinking-orb-gemini", persist: true };

export function useOrbDials(): OrbDials {
  const diffusion = useDialKit("Diffusion orb", DIFFUSION_CONFIG, DIFFUSION_OPTIONS);
  const fold = useDialKit("Fold orb", FOLD_CONFIG, FOLD_OPTIONS);
  const gemini = useDialKit("Gemini orb", GEMINI_CONFIG, GEMINI_OPTIONS);

  const { buttons, ...geminiProps } = gemini;
  return {
    diffusion: split(diffusion, DIFFUSION_STATES),
    fold: split(fold, FOLD_STATES),
    gemini: {
      ...split(geminiProps, GEMINI_STATES),
      looks: { listening: buttons.userButton, thinking: buttons.assistantButton },
    },
  } as OrbDials;
}
