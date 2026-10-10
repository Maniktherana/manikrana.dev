"use client";

import * as React from "react";

import { cn } from "@manikrana/ui/lib/utils";
import { orbFragment } from "./orb-renderer";
import { PALETTES, type OrbPalette } from "./palettes";
import { useOrb, type OrbVariant } from "./use-orb";

export type DiffusionOrbState = "thinking" | "listening";

export type DiffusionOrbProps = Omit<React.ComponentProps<"span">, "children"> & {
  state?: DiffusionOrbState;
  variant?: OrbVariant;
  palette?: OrbPalette;
  size?: number;
  speed?: number;
  brilliance?: number;
  paused?: boolean;
};

// Great-circle projection and two traveling waves, adapted from thinking-orbs
// (MIT; see THINKING-ORBS-LICENSE).
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

vec4 lightField(vec3 p, float back) {
  p.xz = rotate(yaw * 0.017453293) * p.xz;
  p.xy = rotate(rotation * 0.017453293) * p.xy;
  float tilt = projectionTilt * 0.017453293 + search * 0.22 * sin(time * 0.4) * activity;
  p.yz = rotate(tilt) * p.yz;
  float a = atan(p.y, p.x);
  float offset = p.z / max(0.08, length(p.xy));
  float t = time * 1.45;
  float wave = (0.16 * sin(a * waveCount - t * 1.7 + offset * phaseSkew)
    + 0.16 * secondaryWave * sin(a * (waveCount + 2.0) + t * 1.1)) * activity;
  wave *= waveAmplitude * (1.0 - focus * 0.35);
  float c = (offset - wave - bandOffset) / (1.0 + compact * 0.16);
  float width = c < 0.0 ? outerDiffusion : innerDiffusion;
  float density = exp(-pow(abs(c) / width, diffusionPower) * 1.4);
  vec3 color = mix(midColor, lightColor, pow(density, 2.0) * highlight);
  float travelingLight = 0.94 + 0.06 * sin(a - t * 0.48) * activity;
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

const DIFFUSION_TUNING = {
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

const STATE_TRANSITION = 0.5;
const COMPACT_SIZE = 24;

function DiffusionOrb({
  state = "thinking",
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
  const listening = React.useRef(state === "listening" ? 1 : 0);

  const { canvasRef, wake } = useOrb({
    fragment: FRAGMENT,
    size,
    speed,
    variant,
    brilliance,
    paused,
    step: ({ dt, motionReduced }) => {
      const target = state === "listening" ? 1 : 0;
      const blend = motionReduced ? 1 : 1 - Math.exp((-dt * 7) / STATE_TRANSITION);
      listening.current += (target - listening.current) * blend;
      if (Math.abs(target - listening.current) < 0.00001) listening.current = target;
    },
    uniforms: ({ search, focus }) => {
      const morph = listening.current;
      // Listening is the same painter with zero angles and no secondary wave.
      const settle = (value: number) => (morph === 1 ? 0 : value * (1 - morph));
      const [, midColor, lightColor] = PALETTES[palette];
      return {
        ...DIFFUSION_TUNING,
        projectionTilt: settle(DIFFUSION_TUNING.projectionTilt),
        yaw: settle(DIFFUSION_TUNING.yaw),
        rotation: settle(DIFFUSION_TUNING.rotation),
        secondaryWave: settle(DIFFUSION_TUNING.secondaryWave),
        search: search * (1 - morph),
        focus: focus * (1 - morph),
        compact: size <= COMPACT_SIZE ? 1 : 0,
        midColor,
        lightColor,
      };
    },
  });

  React.useEffect(() => {
    wake();
  }, [wake, state, palette]);

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
