"use client";

import * as React from "react";

import { cn } from "@manikrana/ui/lib/utils";
import { orbFragment } from "./orb-renderer";
import { PALETTES, type OrbPalette } from "./palettes";
import {
  clamp,
  settleToward,
  stateBlend,
  useOrb,
  type OrbTuning,
  type OrbVariant,
} from "./use-orb";

export type DiffusionOrbState = "thinking" | "listening" | "idle";

export type DiffusionOrbProps = Omit<React.ComponentProps<"span">, "children"> & {
  state?: DiffusionOrbState;
  tuning?: OrbTuning<DiffusionOrbState, DiffusionTuning>;
  transition?: number;
  variant?: OrbVariant;
  palette?: OrbPalette;
  size?: number;
  speed?: number;
  brilliance?: number;
  paused?: boolean;
};

// Adapted from thinking-orbs (MIT; see THINKING-ORBS-LICENSE).
const FRAGMENT = orbFragment(`
uniform float compact;
uniform vec3 midColor;
uniform vec3 lightColor;
uniform float projectionTilt;
uniform float yaw;
uniform float rotation;
uniform float waveAmplitude;
uniform float waveCount;
uniform float secondaryWave;
uniform float phaseSkew;
uniform float bandOffset;
uniform float innerDiffusion;
uniform float outerDiffusion;
uniform float diffusionPower;
uniform float rearOpacity;
uniform float exposure;
uniform float highlight;
uniform float searchTiltAngle;
uniform float lightAmount;
uniform float searchTiltPhase;
uniform float wavePhase;
uniform float secondaryWavePhase;
uniform float lightPhase;

vec4 lightField(vec3 p, float back) {
  p.xz = rotate(yaw * 0.017453293) * p.xz;
  p.xy = rotate(rotation * 0.017453293) * p.xy;
  float tilt = projectionTilt + search * searchTiltAngle * sin(searchTiltPhase) * activity;
  p.yz = rotate(tilt * 0.017453293) * p.yz;
  float a = atan(p.y, p.x);
  float offset = p.z / max(0.08, length(p.xy));
  float wave = (0.16 * sin(a * waveCount - wavePhase + offset * phaseSkew)
    + 0.16 * secondaryWave * sin(a * (waveCount + 2.0) + secondaryWavePhase)) * activity;
  wave *= waveAmplitude * (1.0 - focus * 0.35);
  float c = (offset - wave - bandOffset) / (1.0 + compact * 0.16);
  float width = c < 0.0 ? outerDiffusion : innerDiffusion;
  float density = exp(-pow(abs(c) / width, diffusionPower) * 1.4);
  vec3 color = mix(midColor, lightColor, pow(density, 2.0) * highlight);
  float travelingLight = 1.0 - lightAmount + lightAmount * sin(a - lightPhase) * activity;
  float alpha = density * travelingLight * mix(1.0, rearOpacity, back);
  color *= exposure * mix(0.85, 1.12, brilliance);
  return vec4(color, alpha);
}

vec4 paint(vec2 uv, float rr, float edge) {
  float depth = sqrt(1.0 - rr);
  vec4 front = lightField(vec3(uv, depth), 0.0);
  vec4 back = lightField(vec3(uv, -depth), 1.0);
  float alpha = front.a + back.a * (1.0 - front.a);
  vec3 color = (front.rgb * front.a + back.rgb * back.a * (1.0 - front.a)) / max(alpha, 0.001);
  return vec4(color, alpha * edge);
}
`);

// Angles are in degrees; speeds are in radians per second, so 6.28 is one cycle a second.
const DIFFUSION_THINKING = {
  waveSpeed: 2.47,
  secondaryWaveSpeed: 1.6,
  lightAmount: 0.06,
  lightSpeed: 0.7,
  searchTiltAngle: 12.6,
  searchTiltSpeed: 0.4,
  variantMix: 1,
  projectionTilt: 49,
  yaw: 0,
  rotation: -23,
  waveAmplitude: 1,
  waveCount: 3,
  secondaryWave: 0.44,
  phaseSkew: 2.93,
  bandOffset: 0,
  innerDiffusion: 0.64,
  outerDiffusion: 0.64,
  diffusionPower: 2,
  rearOpacity: 0.1,
  exposure: 1.2,
  highlight: 0.22,
};

const DIFFUSION_LISTENING = {
  ...DIFFUSION_THINKING,
  variantMix: 0,
  projectionTilt: 0,
  rotation: 0,
  secondaryWave: 0,
};

export type DiffusionTuning = typeof DIFFUSION_THINKING;

export const DIFFUSION_STATES = {
  thinking: DIFFUSION_THINKING,
  listening: DIFFUSION_LISTENING,
  idle: { ...DIFFUSION_LISTENING, waveAmplitude: 0 },
} satisfies Record<DiffusionOrbState, DiffusionTuning>;

// Where the old shared clock started, so the first frame matches.
const START_PHASE = {
  wavePhase: 4.44,
  secondaryWavePhase: 2.87,
  lightPhase: 1.25,
  searchTiltPhase: 0.72,
};

const COMPACT_SIZE = 24;

function DiffusionOrb({
  state = "thinking",
  tuning,
  transition = 0.5,
  variant = "weave",
  palette = "opal",
  size = 64,
  speed = 1,
  brilliance = 0.65,
  paused = false,
  className,
  style,
  ...props
}: DiffusionOrbProps) {
  const target = { ...DIFFUSION_STATES[state], ...tuning?.[state] };
  const tuned = React.useRef({ ...target });
  const phase = React.useRef({ ...START_PHASE });

  const { canvasRef, wake } = useOrb({
    fragment: FRAGMENT,
    size,
    speed,
    variant,
    brilliance,
    paused,
    step: ({ dt, motionReduced }) => {
      settleToward(tuned.current, target, stateBlend(dt, transition, motionReduced));
      if (motionReduced) return;
      const advance = dt * clamp(speed, 0.25, 3);
      const current = tuned.current;
      phase.current.wavePhase += advance * current.waveSpeed;
      phase.current.secondaryWavePhase += advance * current.secondaryWaveSpeed;
      phase.current.lightPhase += advance * current.lightSpeed;
      phase.current.searchTiltPhase += advance * current.searchTiltSpeed;
    },
    uniforms: ({ search, focus }) => {
      const [, midColor, lightColor] = PALETTES[palette];
      return {
        ...tuned.current,
        ...phase.current,
        search: search * tuned.current.variantMix,
        focus: focus * tuned.current.variantMix,
        compact: size <= COMPACT_SIZE ? 1 : 0,
        midColor,
        lightColor,
      };
    },
  });

  React.useEffect(() => {
    wake();
  }, [wake, state, tuning, palette]);

  return (
    <span
      {...props}
      data-slot="diffusion-orb"
      data-state={state}
      data-variant={variant}
      data-palette={palette}
      aria-hidden="true"
      className={cn("relative inline-flex size-(--orb-size) shrink-0 align-middle", className)}
      style={{ "--orb-size": `${size}px`, ...style } as React.CSSProperties}
    >
      <canvas ref={canvasRef} className="relative block size-full" aria-hidden="true" />
    </span>
  );
}

export { DiffusionOrb };
