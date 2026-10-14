"use client";

import * as React from "react";

import { cn } from "@manikrana/ui/lib/utils";
import { orbFragment } from "./orb-renderer";
import {
  clamp,
  settleToward,
  stateBlend,
  useOrb,
  type OrbTuning,
  type OrbVariant,
} from "./use-orb";
import { followVoice, type VoiceEnvelope } from "./voice-response";

export type GeminiOrbAudioMode = "user" | "assistant" | "muted";

export type GeminiOrbProps = Omit<React.ComponentProps<"span">, "children"> & {
  variant?: OrbVariant;
  size?: number;
  speed?: number;
  brilliance?: number;
  paused?: boolean;
  audioLevel?: number | { readonly current: number };
  audioBands?: readonly number[] | { readonly current: readonly number[] };
  audioMode?: GeminiOrbAudioMode;
  tuning?: OrbTuning<GeminiOrbAudioMode, GeminiTuning>;
  transition?: number;
};

const FRAGMENT = orbFragment(`
uniform float voice;
uniform float voiceBand0;
uniform float voiceBand1;
uniform float voiceBand2;
uniform float voiceBand3;
uniform float assistantMix;
uniform float userPresence;
uniform float exposure;
uniform float voiceStrength;
uniform float clipLift;
uniform float clipSoftness;
uniform float blueDiffusion;
uniform float colorFlowSpeed;
uniform float colorLayerMix;
uniform float voiceAmplitude;
uniform float voiceHarmonic;
uniform float restingWave;
uniform float restingSway;

const vec3 geminiBlue = vec3(0.24, 0.45, 0.96);
const vec3 geminiPale = vec3(0.57, 0.73, 0.93);
const vec3 geminiHalo = vec3(0.2, 0.36, 0.78);
const vec3 hueViolet = vec3(0.52, 0.4, 0.82);
const vec3 hueRose = vec3(0.68, 0.46, 0.66);
const vec3 hueTeal = vec3(0.22, 0.62, 0.66);
const vec3 hueCyan = vec3(0.3, 0.7, 0.94);

float softRamp(float d, float knee) { return 0.5 * (d + sqrt(d * d + knee * knee)); }

float edgeGlow(float d, float tail, float knee) {
  return exp(-softRamp(d, knee) / max(tail, 0.01));
}

const vec3 modeFrequency = vec3(3.14159, 6.28318, 9.42478);
const vec3 modeWeight = vec3(1.0, 0.65, 0.25);

vec3 voiceModes() {
  float level = clamp(voice * voiceStrength, 0.0, 1.0);
  float drive = level + restingWave * userPresence * (1.0 - level);
  vec3 synthetic = drive * (0.55 + 0.45 * sin(time * vec3(1.4, 2.1, 3.0) + vec3(0.4, 2.2, 4.5)));
  vec3 bands = clamp(vec3(0.5 * (voiceBand0 + voiceBand1), voiceBand2, voiceBand3), 0.0, 1.0);
  float strongest = max(bands.x, max(bands.y, bands.z));
  vec3 relative = bands / max(strongest, 0.05);
  float supplied = step(0.001, strongest);
  return synthetic * mix(vec3(1.0), 0.6 + 0.8 * relative, 0.5 * supplied);
}

vec3 modePhase() {
  float t = time;
  vec3 wander = vec3(0.45, 0.6, 0.8) * (1.0 + search * 1.6) * (1.0 - focus * 0.85);
  vec3 rest = mix(vec3(1.5708, 2.5, 0.4), vec3(1.5708), focus * 0.85);
  return rest + wander * sin(t * vec3(0.37, 0.53, 0.71) + vec3(0.0, 2.1, 4.2));
}

float voiceEdge(float x, float level, vec3 modes, vec3 phase) {
  vec3 harmonic = vec3(1.0, voiceHarmonic, voiceHarmonic);
  vec3 shape = sin(modeFrequency * x + phase) * modeWeight * harmonic * modes;
  float center = exp(-x * x * 0.9);
  float crest = (shape.x + shape.y + shape.z) * 0.24 * center;
  crest /= 1.0 + max(crest, 0.0) * 3.5;
  float floorHeight = mix(-0.12, 0.22, userPresence);
  return floorHeight + clipLift + voiceAmplitude * (0.22 * level * (0.7 + 0.3 * center) + crest);
}

float ambientEdge(float x, float speech) {
  float t = time * colorFlowSpeed;
  float sway = (0.04 * restingSway + 0.05 * speech) * sin(3.14 * x + t * 0.6)
    + 0.02 * (restingSway + speech) * sin(5.8 * x - t * 0.83 + 1.3);
  return mix(-0.12, 0.24 + clipLift, activity) + 0.14 * speech + sway;
}

vec3 assistantHue(float x, float v) {
  float t = time * colorFlowSpeed;
  float field = sin(1.2 * x - t * 0.3) + 0.5 * sin(2.1 * x + t * 0.4 + 2.0) + 0.6 * v;
  float k = fract(field * 0.18 + t * 0.03);
  vec3 a = mix(hueViolet, hueRose, smoothstep(0.0, 0.25, k));
  a = mix(a, hueTeal, smoothstep(0.3, 0.55, k));
  a = mix(a, hueCyan, smoothstep(0.6, 0.8, k));
  return mix(a, hueViolet, smoothstep(0.85, 1.0, k));
}

vec4 paint(vec2 uv, float rr, float edge) {
  float v = (uv.y + 1.0) * 0.5;
  float x = uv.x;
  float level = clamp(voice * voiceStrength, 0.0, 1.0) * activity;
  vec3 modes = voiceModes() * activity;
  vec3 phase = modePhase();

  float speech = sqrt(level) * assistantMix;
  float ambientD = v - ambientEdge(x, speech);
  float ambient = edgeGlow(ambientD, 0.12 * blueDiffusion, 0.08);
  float depthShade = mix(0.82, 1.0, smoothstep(0.35, 0.0, v));
  vec3 color = geminiBlue * ambient * depthShade * (1.0 + 0.18 * speech);

  float band = exp(-pow((ambientD + 0.06) / 0.16, 2.0));
  float t = time * colorFlowSpeed;
  float patches = smoothstep(-0.2, 0.9, sin(2.2 * x - t * 0.42) + 0.5 * sin(3.7 * x + t * 0.31 + 1.1));
  float hueAmount = assistantMix * colorLayerMix * band * patches * (0.6 + 0.35 * speech) * activity;
  color = mix(color, assistantHue(x, v) * ambient, hueAmount);

  float userVoice = max(level, userPresence) * (1.0 - assistantMix);
  float voiceD = v - voiceEdge(x, level, modes, phase);
  float halo = edgeGlow(voiceD - 0.02, 0.11 * blueDiffusion, 0.08) * smoothstep(0.0, 0.08, userVoice);
  color = mix(color, geminiHalo, halo * 0.75);
  float knee = max(0.03, clipSoftness * 0.3);
  float pale = edgeGlow(voiceD, 0.07 * blueDiffusion, knee) * smoothstep(0.0, 0.12, userVoice);
  color = mix(color, geminiPale, pale);

  return vec4(color * exposure * mix(0.92, 1.06, brilliance), edge);
}
`);

const GEMINI_TUNING = {
  pace: 1,
  exposure: 1,
  voiceStrength: 1,
  clipLift: 0,
  clipSoftness: 0.22,
  blueDiffusion: 1,
  colorFlowSpeed: 1,
  colorLayerMix: 1,
  voiceAmplitude: 1,
  voiceHarmonic: 1,
  // Motion with no audio; 0 keeps the orb still until a voice moves it.
  restingWave: 0,
  restingSway: 0,
};

export type GeminiTuning = typeof GEMINI_TUNING;

export const GEMINI_STATES = {
  user: GEMINI_TUNING,
  assistant: GEMINI_TUNING,
  muted: GEMINI_TUNING,
} satisfies Record<GeminiOrbAudioMode, GeminiTuning>;

const VOICE_ATTACK = 0.3;
const VOICE_RELEASE = 0.55;
const BAND_COUNT = 4;

type Voice = {
  assistantMix: number;
  userPresence: number;
  level: VoiceEnvelope;
  bands: VoiceEnvelope[];
};

function GeminiOrb({
  variant = "weave",
  size = 64,
  speed = 1,
  brilliance = 0.65,
  paused = false,
  audioLevel = 0,
  audioBands,
  audioMode = "user",
  tuning,
  transition = 0.5,
  className,
  style,
  ...props
}: GeminiOrbProps) {
  const voice = React.useRef<Voice>({
    assistantMix: audioMode === "assistant" ? 1 : 0,
    userPresence: audioMode === "user" ? 1 : 0,
    level: { level: 0, velocity: 0 },
    bands: Array.from({ length: BAND_COUNT }, () => ({ level: 0, velocity: 0 })),
  });

  const target = { ...GEMINI_STATES[audioMode], ...tuning?.[audioMode] };
  const tuned = React.useRef({ ...target });

  const { canvasRef } = useOrb({
    fragment: FRAGMENT,
    size,
    speed,
    variant,
    brilliance,
    paused,
    pace: () => tuned.current.pace,
    step: ({ dt, motionReduced }) => {
      const blend = stateBlend(dt, transition, motionReduced);
      settleToward(tuned.current, target, blend);
      const current = voice.current;
      const input = typeof audioLevel === "number" ? audioLevel : audioLevel.current;
      current.assistantMix += ((audioMode === "assistant" ? 1 : 0) - current.assistantMix) * blend;
      current.userPresence += ((audioMode === "user" ? 1 : 0) - current.userPresence) * blend;
      const listening = !motionReduced && audioMode !== "muted";
      followVoice(
        current.level,
        listening ? clamp(input, 0, 1) : 0,
        dt,
        VOICE_ATTACK,
        VOICE_RELEASE,
      );
      const bands = audioBands && "current" in audioBands ? audioBands.current : audioBands;
      current.bands.forEach((band, i) => {
        const inputBand = bands?.[i] ?? 0;
        const target = listening && Number.isFinite(inputBand) ? clamp(inputBand, 0, 1) : 0;
        followVoice(band, target, dt, VOICE_ATTACK, VOICE_RELEASE);
      });
    },
    uniforms: () => {
      const current = voice.current;
      return {
        ...tuned.current,
        voice: current.level.level,
        voiceBand0: current.bands[0].level,
        voiceBand1: current.bands[1].level,
        voiceBand2: current.bands[2].level,
        voiceBand3: current.bands[3].level,
        assistantMix: current.assistantMix,
        userPresence: current.userPresence,
      };
    },
  });

  return (
    <span
      {...props}
      data-slot="gemini-orb"
      data-variant={variant}
      aria-hidden="true"
      className={cn("relative inline-flex size-(--orb-size) shrink-0 align-middle", className)}
      style={{ "--orb-size": `${size}px`, ...style } as React.CSSProperties}
    >
      <canvas ref={canvasRef} className="relative block size-full" aria-hidden="true" />
    </span>
  );
}

export { GeminiOrb };
