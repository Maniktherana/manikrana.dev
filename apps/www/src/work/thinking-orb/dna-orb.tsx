"use client";

import * as React from "react";

import { cn } from "@manikrana/ui/lib/utils";
import { orbFragment } from "./orb-renderer";
import { PALETTES, type OrbPalette } from "./palettes";
import { useOrb, type OrbVariant } from "./use-orb";

export type DnaOrbProps = Omit<React.ComponentProps<"span">, "children"> & {
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

vec4 paint(vec2 uv, float rr, float edge) {
  float depth = sqrt(max(0.0, 1.0 - rr));
  vec3 normal = vec3(uv, depth);
  float t = time * 0.54;
  float sway = activity * (0.18 * sin(t * 0.7) + search * 0.42 * sin(t));
  vec2 lens = uv * (0.86 + 0.14 * rr);
  vec3 sum = vec3(0.0);
  float opacity = 0.0;
  for (int i = 0; i < 28; i++) {
    float z = mix(depth, -depth, (float(i) + 0.5) / 28.0);
    vec3 p = vec3(lens, z);
    p.xz = rotate(yaw * 0.017453293) * p.xz;
    p.xy = rotate(rotation * 0.017453293 - 0.22 + sway) * p.xy;
    p.yz = rotate(projectionTilt * 0.017453293 - 0.30 + 0.16 * activity * sin(t * 0.8)) * p.yz;
    float wave = activity * waveAmplitude * (0.23 * sin(p.x * (waveCount + 0.5) * foldTwist + t + phaseSkew - 2.93) + 0.18 * (secondaryWave / 0.44) * sin(p.z * (waveCount + 1.0) * foldTwist - t * 1.15));
    float sheet = p.y - wave - bandOffset - 0.18 * sin(p.x * 3.0 - p.z * 2.0);
    float ribbon = exp(-abs(sheet) * (16.0 - focus * 4.0) / foldThickness);
    float inner = exp(-abs(sheet + 0.19) * 25.0) * 0.35;
    float envelope = 1.0 - smoothstep(0.25, 1.03, length(p));
    float gathering = mix(1.0, exp(-dot(p.xz, p.xz) * 2.7) * 1.8, focus * 0.72);
    float density = (ribbon + inner) * envelope * gathering * 0.24 * foldDensity;
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

const DNA_TUNING = {
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
};

const DNA_PALETTES = {
  ...PALETTES,
  opal: [
    [0.16, 0.34, 0.98],
    [0.58, 0.32, 0.96],
    [0.48, 0.98, 0.94],
  ],
} as const;

function DnaOrb({
  variant = "weave",
  palette = "opal",
  size = 64,
  speed = 1,
  brilliance = 0.65,
  paused = false,
  className,
  style,
  ...props
}: DnaOrbProps) {
  const { canvasRef, wake } = useOrb({
    fragment: FRAGMENT,
    size,
    speed,
    variant,
    brilliance,
    paused,
    uniforms: () => {
      const [deepColor, midColor, lightColor] = DNA_PALETTES[palette];
      return { ...DNA_TUNING, deepColor, midColor, lightColor };
    },
  });

  React.useEffect(() => {
    wake();
  }, [wake, palette]);

  return (
    <span
      {...props}
      data-slot="dna-orb"
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

export { DnaOrb };
