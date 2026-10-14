export const dotGridPatterns = {
  organic: 0,
  weave: 1,
} as const;

export type DotGridPattern = keyof typeof dotGridPatterns;

export const dotGridWavePatterns = {
  band: 1,
  pulse: 2,
  ripple: 0,
  sweep: 3,
} as const;

export type DotGridWavePattern = keyof typeof dotGridWavePatterns;

export const dotGridVertex = `
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const dotGridFragment = `
precision highp float;

uniform vec2 uRes;
uniform vec2 uPixelRatio;
uniform float uTime;
uniform float uPattern;
uniform float uCell;
uniform float uGap;
uniform float uRadius;
uniform float uFloor;
uniform float uDotAlpha;
uniform float uPatternSpeed;
uniform float uWaveFrequency;
uniform float uWavePhase;
uniform float uWaveThickness;
uniform float uWavePeakTop;
uniform float uWavePeakBottom;
uniform float uWaveDotLight;
uniform float uWaveDotDark;
uniform float uWaveBackgroundLight;
uniform float uWaveBackgroundDark;
uniform float uWaveAngle;
uniform vec2 uWavePosition;
uniform float uWavePattern;
uniform float uScaleDots;
uniform vec3 uDotColor;
uniform vec3 uWaveColor;

const float TAU = 6.28318530718;

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 waveAspect() {
  float shortSide = max(min(uRes.x, uRes.y), 1.0);
  return uRes / shortSide;
}

float waveExtent() {
  vec2 farthestEdge = max(uWavePosition, vec2(1.0) - uWavePosition);
  return max(length(farthestEdge * waveAspect()), 0.01);
}

float dotSdf(vec2 p, float halfCell, float squareness) {
  vec2 q = abs(p) - vec2(halfCell * squareness);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - halfCell * (1.0 - squareness);
}

float organicAt(vec2 gid, float t) {
  float f1 = 0.62 + hash1(gid + vec2(11.0, 5.0)) * 0.55;
  float f2 = f1 * 1.6180339887;
  float a = hash1(gid + vec2(1.0, 1.0)) * TAU;
  float b = hash1(gid + vec2(7.0, 3.0)) * TAU;
  float v = (sin(t * TAU * f1 + a) + sin(t * TAU * f2 + b)) * 0.5;
  return pow(clamp((v + 1.0) * 0.5, 0.0, 1.0), 3.2);
}

float weaveAt(vec2 uv, float t) {
  float a = sin(uv.x * TAU * 2.0 - t * TAU * 0.72);
  float b = sin(uv.y * TAU * 1.35 + t * TAU * 0.48);
  return pow(clamp((a * b + 1.0) * 0.5, 0.0, 1.0), 2.2);
}

float patternAt(vec2 gid, vec2 uv, float t) {
  if (uPattern < 0.5) return organicAt(gid, t);
  return weaveAt(uv, t);
}

vec4 waveGeometryAt(vec2 uv, float t) {
  vec2 p = (uv - uWavePosition) * waveAspect();
  float radialDistance = max(length(p), 0.0001);
  vec2 radialDirection = p / radialDistance;
  float sine = sin(uWaveAngle);
  float cosine = cos(uWaveAngle);
  vec2 normal = vec2(-sine, cosine);
  float across = dot(p, normal);
  float cycle = fract(t * max(uWaveFrequency, 0.0) + uWavePhase);
  float thickness = max(uWaveThickness, 0.0001);
  float extent = waveExtent();

  if (uWavePattern < 0.5) {
    float radius = mix(-thickness * 0.5, extent + thickness * 0.5, cycle);
    return vec4(radialDistance - radius, radialDirection.x, radialDirection.y, 1.0);
  }

  if (uWavePattern < 1.5) {
    float centre = sin(cycle * TAU) * extent * 0.35;
    return vec4(across - centre, normal.x, normal.y, 1.0);
  }

  if (uWavePattern < 2.5) {
    float pulse = (sin(cycle * TAU - TAU * 0.25) + 1.0) * 0.5;
    float radius = mix(0.0, extent, pulse);
    return vec4(radialDistance - radius, radialDirection.x, radialDirection.y, 1.0);
  }

  float sweep = mix(-extent - thickness * 0.5, extent + thickness * 0.5, cycle);
  return vec4(across - sweep, normal.x, normal.y, 1.0);
}

float signedWaveAt(vec4 geometry) {
  float localPhase = geometry.x / max(uWaveThickness, 0.0001);
  float insideBand = 1.0 - step(0.5, abs(localPhase));
  return sin(localPhase * TAU) * insideBand * geometry.w;
}

vec2 warpAt(vec4 geometry, float wave) {
  float displacement = wave >= 0.0 ? wave * uWavePeakTop : wave * uWavePeakBottom;
  return geometry.yz * displacement;
}

void main() {
  vec2 fragCoord = vec2(gl_FragCoord.x, uRes.y * uPixelRatio.y - gl_FragCoord.y) / uPixelRatio;
  vec2 res = max(uRes, vec2(1.0));
  vec2 uv = fragCoord / res;

  float pitch = uCell * (1.0 + uGap);
  vec4 geometry = waveGeometryAt(uv, uTime);
  float backgroundWave = signedWaveAt(geometry);
  float backgroundCrest = max(backgroundWave, 0.0);
  float backgroundTrough = max(-backgroundWave, 0.0);

  vec2 grid = fragCoord / pitch;
  vec2 gid = floor(grid);
  vec2 dotCentre = (gid + vec2(0.5)) * pitch;
  vec2 dotUv = dotCentre / res;
  vec4 dotGeometry = waveGeometryAt(dotUv, uTime);
  float dotWave = signedWaveAt(dotGeometry);
  float dotWaveCrest = max(dotWave, 0.0);
  float dotWaveTrough = max(-dotWave, 0.0);
  vec2 dotWarp = warpAt(dotGeometry, dotWave);
  vec2 local = fragCoord - dotCentre - dotWarp;

  float squareness = clamp(1.0 - uRadius, 0.0, 1.0);
  float outerSdf = dotSdf(local, uCell * 0.5, squareness);
  // 1 - smoothstep(-0.7, 0.7, d) rather than smoothstep(0.7, -0.7, d): GLSL
  // leaves smoothstep undefined when the first edge is the larger.
  float outerMask = clamp(1.0 - smoothstep(-0.7, 0.7, outerSdf), 0.0, 1.0);
  float dotA = 0.0;

  if (outerMask > 0.0) {
    float patternIntensity = patternAt(gid, uv, (uTime * uPatternSpeed) / 2.3);
    float lum = uFloor + patternIntensity * (1.0 - uFloor);
    lum = clamp(lum + dotWaveCrest * uWaveDotLight - dotWaveTrough * uWaveDotDark, 0.0, 1.0);

    float dotScale = max(0.02, 1.0 - uScaleDots * (1.0 - lum));
    float halfCell = uCell * 0.5 * dotScale;
    float sdf = dotSdf(local, halfCell, squareness);
    float mask = clamp(1.0 - smoothstep(-0.7, 0.7, sdf), 0.0, 1.0);
    dotA = mask * lum * uDotAlpha;
  }

  float backgroundLight = backgroundCrest * uWaveBackgroundLight;
  float backgroundDark = backgroundTrough * uWaveBackgroundDark;
  float bgA = clamp(backgroundLight + backgroundDark, 0.0, 1.0);

  float a = clamp(dotA + bgA, 0.0, 1.0);
  vec3 rgb = uDotColor * dotA + uWaveColor * backgroundLight;

  gl_FragColor = vec4(rgb, a);
}
`;
