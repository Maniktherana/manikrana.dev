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

export type FoldOrbState = "thinking" | "listening" | "idle";

export type FoldOrbProps = Omit<React.ComponentProps<"span">, "children"> & {
  state?: FoldOrbState;
  tuning?: OrbTuning<FoldOrbState, FoldTuning>;
  transition?: number;
  variant?: OrbVariant;
  palette?: OrbPalette;
  size?: number;
  speed?: number;
  brilliance?: number;
  paused?: boolean;
};

const FRAGMENT = orbFragment(`
uniform vec3 deepColor;
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
uniform float foldTwist;
uniform float foldDensity;
uniform float foldThickness;
uniform float foldSurfaceLight;
uniform float swayAngle;
uniform float searchSwayAngle;
uniform float wobbleAngle;
uniform float swayPhase;
uniform float searchSwayPhase;
uniform float wobblePhase;
uniform float wavePhase;
uniform float secondaryWavePhase;
uniform float pulsePhase;
uniform float pulse;
uniform float pulseSpacing;
uniform float pulseRibbon;

vec4 paint(vec2 uv, float rr, float edge) {
  float depth = sqrt(max(0.0, 1.0 - rr));
  vec3 normal = vec3(uv, depth);
  float sway = activity * 0.017453293
    * (swayAngle * sin(swayPhase) + search * searchSwayAngle * sin(searchSwayPhase));
  vec2 lens = uv * (0.86 + 0.14 * rr);
  vec3 sum = vec3(0.0);
  float opacity = 0.0;
  for (int i = 0; i < 28; i++) {
    float z = mix(depth, -depth, (float(i) + 0.5) / 28.0);
    vec3 p = vec3(lens, z);
    p.xz = rotate(yaw * 0.017453293) * p.xz;
    p.xy = rotate(rotation * 0.017453293 - 0.22 + sway) * p.xy;
    p.yz = rotate((projectionTilt + wobbleAngle * activity * sin(wobblePhase)) * 0.017453293 - 0.30) * p.yz;
    float wave = activity * waveAmplitude * (0.23 * sin(p.x * (waveCount + 0.5) * foldTwist + wavePhase + phaseSkew - 2.93) + 0.18 * (secondaryWave / 0.44) * sin(p.z * (waveCount + 1.0) * foldTwist + secondaryWavePhase));
    float sheet = p.y - wave - bandOffset - 0.18 * sin(p.x * 3.0 - p.z * 2.0);
    float ribbon = exp(-abs(sheet) * (16.0 - focus * 4.0) / foldThickness);
    float inner = exp(-abs(sheet + 0.19) * 25.0) * 0.35;
    float envelope = 1.0 - smoothstep(0.25, 1.03, length(p));
    float gathering = mix(1.0, exp(-dot(p.xz, p.xz) * 2.7) * 1.8, focus * 0.72);
    float beat = 1.0 + pulse * sin(float(i) * pulseSpacing - pulsePhase);
    float density = (ribbon * mix(1.0, beat, pulseRibbon) + inner * beat) * envelope * gathering * 0.24 * foldDensity;
    vec3 hue = mix(deepColor, midColor, smoothstep(-0.65, 0.5, p.x + p.z * 0.5));
    hue = mix(hue, lightColor, smoothstep(0.08, 0.7, p.z - p.x * 0.35));
    float hot = pow(ribbon, 3.0) * (0.35 + 0.65 * max(0.0, p.z)) * (0.3 + brilliance * 0.5);
    vec3 emission = hue * (1.5 + brilliance * 1.4) + vec3(0.82, 0.94, 1.0) * hot;
    sum += (1.0 - opacity) * emission * density;
    opacity += (1.0 - opacity) * density * 0.72;
  }
  vec3 base = mix(deepColor * 0.12, midColor * 0.27, depth);
  base += lightColor * 0.07 * pow(max(0.0, -uv.y), 1.5);
  vec3 color = base * foldSurfaceLight + sum;
  float fresnel = pow(1.0 - depth, 3.0);
  float rim = pow(max(0.0, dot(normalize(vec3(-0.65, 0.8, 0.3)), normal)), 3.0);
  color += mix(midColor, lightColor, rim) * fresnel * (0.25 + rim * 0.9) * foldSurfaceLight;
  float reflection = pow(max(0.0, dot(normal, normalize(vec3(-0.35, 0.65, 0.75)))), 32.0);
  color += vec3(0.76, 0.91, 1.0) * reflection * (0.12 + brilliance * 0.25) * foldSurfaceLight;
  float lowerRim = exp(-pow((length(uv * vec2(1.0, 0.95)) - 0.94) * 45.0, 2.0));
  color += lightColor * lowerRim * max(0.0, -uv.y) * 0.17 * foldSurfaceLight;
  color = vec3(1.0) - exp(-color * 1.35);
  return vec4(pow(color, vec3(0.83)), edge);
}
`);

// Angles are in degrees; speeds are in radians per second, so 6.28 is one cycle a second.
const FOLD_THINKING = {
  swayAngle: 10.3,
  swaySpeed: 0.53,
  searchSwayAngle: 24.1,
  searchSwaySpeed: 0.76,
  wobbleAngle: 9.2,
  wobbleSpeed: 0.6,
  waveSpeed: 0.76,
  secondaryWaveSpeed: -0.87,
  projectionTilt: 49,
  yaw: 0,
  rotation: -23,
  waveAmplitude: 1,
  waveCount: 3,
  secondaryWave: 0.44,
  phaseSkew: 2.93,
  bandOffset: 0,
  foldTwist: 1,
  foldDensity: 1,
  foldThickness: 1,
  foldSurfaceLight: 1,
  pulse: 0,
  pulseSpeed: 6,
  pulseSpacing: 0.9,
  pulseRibbon: 0,
  hold: 0,
};

export type FoldTuning = typeof FOLD_THINKING;

export const FOLD_STATES = {
  thinking: FOLD_THINKING,
  listening: {
    ...FOLD_THINKING,
    swaySpeed: 0,
    searchSwayAngle: 0,
    searchSwaySpeed: 0,
    wobbleSpeed: 0,
    waveSpeed: 0,
    secondaryWaveSpeed: 0,
    pulse: 1.02,
    pulseSpacing: 0.85,
    pulseRibbon: 0.5,
    hold: 1,
  },
  idle: {
    ...FOLD_THINKING,
    swaySpeed: 0.15,
    searchSwaySpeed: 0.22,
    wobbleSpeed: 0.17,
    waveSpeed: 0.22,
    secondaryWaveSpeed: -0.25,
  },
} satisfies Record<FoldOrbState, FoldTuning>;

// The pose that `hold` glides the body into and keeps it at; the beat pulse runs on.
const HOLD_POSE = {
  swayPhase: 0.4646,
  searchSwayPhase: 2.575,
  wobblePhase: 3.0264,
  wavePhase: 2.575,
  secondaryWavePhase: 5.9778,
};

const TAU = Math.PI * 2;

// Where the old shared clock started, so the first frame matches.
const START_PHASE = {
  swayPhase: 0.68,
  searchSwayPhase: 0.97,
  wobblePhase: 0.78,
  wavePhase: 0.97,
  secondaryWavePhase: -1.12,
  pulsePhase: 0,
};

const FOLD_PALETTES = {
  ...PALETTES,
  opal: [
    [0.16, 0.34, 0.98],
    [0.58, 0.32, 0.96],
    [0.48, 0.98, 0.94],
  ],
} as const;

function FoldOrb({
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
}: FoldOrbProps) {
  const target = { ...FOLD_STATES[state], ...tuning?.[state] };
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
      const blend = stateBlend(dt, transition, motionReduced);
      settleToward(tuned.current, target, blend);
      const current = tuned.current;
      if (!motionReduced) {
        const advance = dt * clamp(speed, 0.25, 3);
        phase.current.swayPhase += advance * current.swaySpeed;
        phase.current.searchSwayPhase += advance * current.searchSwaySpeed;
        phase.current.wobblePhase += advance * current.wobbleSpeed;
        phase.current.wavePhase += advance * current.waveSpeed;
        phase.current.secondaryWavePhase += advance * current.secondaryWaveSpeed;
        phase.current.pulsePhase += advance * current.pulseSpeed;
      }
      if (current.hold === 0) return;
      for (const key of Object.keys(HOLD_POSE) as (keyof typeof HOLD_POSE)[]) {
        const from = phase.current[key];
        // The nearest turn of the pose, so the body never travels more than half a cycle.
        const to = from + ((((HOLD_POSE[key] - from) % TAU) + TAU * 1.5) % TAU) - Math.PI;
        phase.current[key] += (to - from) * blend * current.hold;
      }
    },
    uniforms: () => {
      const [deepColor, midColor, lightColor] = FOLD_PALETTES[palette];
      return { ...tuned.current, ...phase.current, deepColor, midColor, lightColor };
    },
  });

  React.useEffect(() => {
    wake();
  }, [wake, state, tuning, palette]);

  return (
    <span
      {...props}
      data-slot="fold-orb"
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

export { FoldOrb };
