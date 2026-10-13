import type * as React from "react";

import { voiceEdgePalettes, type VoiceEdgePalette, type VoiceEdgePaletteName } from "./palettes";

export type VoiceEdgeSide = "top" | "right" | "bottom" | "left";

export type VoiceEdgeController = {
  destroy: () => void;
  setActive: (active: boolean) => void;
  setAudioBins: (bins: Float32Array) => void;
  setBorderBrightness: (brightness: number) => void;
  setIdleLevel: (level: number) => void;
  setInnerGlowBrightness: (brightness: number) => void;
  setInnerGlowHeight: (height: number) => void;
  setPalette: (palette: VoiceEdgePalette) => void;
  setProcessing: (processing: boolean) => void;
  setSide: (side: VoiceEdgeSide) => void;
};

type AudioBorderGeometry = {
  borderRadius: number;
  borderWidth: number;
  boxHeight: number;
  boxWidth: number;
  dpr: number;
};

export type AudioBorderGeometryInput = {
  borderRadius?: number;
  borderWidth: number;
};

export const AUDIO_BIN_COUNT = 32;
const PEAK_FLATTEN = 0.22;
const ATTACK_BASE = 0.1;
const ATTACK_RANGE = 0.08;
const RELEASE = 0.1;
export const emptyAudioBins = new Float32Array(AUDIO_BIN_COUNT);

const vertexShaderSource = `
attribute vec2 a;

void main() {
  gl_Position = vec4(a, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 uRes;
uniform vec2 uBoxSize;
uniform float uAlpha;
uniform float uBorderBrightness;
uniform float uBorderRadius;
uniform float uBorderWidth;
uniform float uDpr;
uniform float uHueShift;
uniform float uIdleLevel;
uniform float uInnerGlowBrightness;
uniform float uInnerGlowHeight;
uniform float uProcessing;
uniform float uSide;
uniform vec3 uPalA;
uniform vec3 uPalB;
uniform vec3 uPalC;
uniform vec3 uPalD;
uniform float uAudioBins[32];

#define PI 3.14159265359
#define AUDIO_BIN_COUNT 32

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(2.0 * PI * (c * t + d));
}

vec3 audioPalette(float t) {
  vec3 color = clamp(palette(t, uPalA, uPalB, uPalC, uPalD), 0.0, 1.0);
  float luma = dot(color, vec3(0.299, 0.587, 0.114));

  return clamp(mix(vec3(luma), color, 1.45), 0.0, 1.0);
}

float audioLevelAt(float t) {
  float x = clamp(t, 0.0, 1.0) * float(AUDIO_BIN_COUNT - 1);
  float value = 0.0;
  float total = 0.0;

  for (int i = 0; i < AUDIO_BIN_COUNT; i++) {
    float delta = abs(x - float(i));
    float weight = exp(-(delta * delta) * 0.20);
    value += uAudioBins[i] * weight;
    total += weight;
  }

  return clamp(value / max(total, 0.001), 0.0, 1.0);
}

float roundedRectSdf(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + vec2(radius);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float mirroredAudioCoord(float t) {
  return abs(clamp(t, 0.0, 1.0) - 0.5) * 2.0;
}

void main() {
  vec2 p = gl_FragCoord.xy - uRes * 0.5;
  vec2 halfSize = max(vec2(1.0), uBoxSize * 0.5);
  float radius = clamp(uBorderRadius, 0.0, max(0.0, min(halfSize.x, halfSize.y) - 1.0));
  float sd = roundedRectSdf(p, halfSize, radius);
  float borderWidth = max(0.1 * uDpr, uBorderWidth);
  vec2 uv = p / uBoxSize + 0.5;
  vec2 cssUv = vec2(uv.x, 1.0 - uv.y);

  float side = floor(uSide + 0.5);
  float borderBrightness = max(uBorderBrightness, 0.0);
  float processing = clamp(uProcessing, 0.0, 1.0);
  float innerGlowBrightness = max(uInnerGlowBrightness, 0.0);
  float innerGlowHeight = max(uInnerGlowHeight, 0.0);
  float innerGlowAmount = pow(clamp(innerGlowBrightness / 2.0, 0.0, 1.0), 1.35) * 1.35;
  float innerGlowLevel = smoothstep(0.0, 2.0, innerGlowHeight);
  float innerSpread = 0.72 + innerGlowLevel * 1.18;
  float processingBorderScale = mix(1.0, 1.72, processing);
  float innerGlowScaleX = innerSpread;
  float innerGlowScaleY = innerSpread * mix(0.72, 0.30, processing);

  float inside = 1.0 - smoothstep(0.0, 1.0, sd);
  vec2 beamUv = cssUv;
  vec2 beamSize = uBoxSize;

  if (side > 0.5 && side < 1.5) {
    beamUv = vec2(cssUv.x, 1.0 - cssUv.y);
  } else if (side > 1.5 && side < 2.5) {
    beamUv = vec2(cssUv.y, cssUv.x);
    beamSize = vec2(uBoxSize.y, uBoxSize.x);
  } else if (side > 2.5 && side < 3.5) {
    beamUv = vec2(cssUv.y, 1.0 - cssUv.x);
    beamSize = vec2(uBoxSize.y, uBoxSize.x);
  }

  float positionCoord = clamp(beamUv.x, 0.0, 1.0);
  float audioCoord = mix(mirroredAudioCoord(positionCoord), positionCoord, processing);
  float colorCoord = positionCoord;
  float level = max(audioLevelAt(audioCoord), clamp(uIdleLevel, 0.0, 0.28));
  float energy = pow(smoothstep(0.0, 1.0, level), 0.68);
  vec3 lineColor = audioPalette(colorCoord * 0.68 + uHueShift * 0.35);
  vec3 bloomColor = lineColor;

  float sourceRim = 0.0;
  float edgeGlow = 0.0;
  float bloomField = 0.0;
  float washField = 0.0;
  vec3 bloomMix = vec3(0.0);
  vec3 washMix = vec3(0.0);

  float sideDistance = (1.0 - beamUv.y) * beamSize.y;
  sourceRim = inside * exp(-pow(sideDistance / max(borderWidth + (4.0 + pow(energy, 0.85) * 18.0) * processingBorderScale * uDpr, 1.0), 1.18));

  for (int i = 0; i < 3; i++) {
    float center = 0.2 + float(i) * 0.3;
    float lobeCoord = mix(mirroredAudioCoord(center), center, processing);
    float lobeLevel = max(audioLevelAt(lobeCoord), clamp(uIdleLevel, 0.0, 0.28));
    float lobeEnergy = pow(smoothstep(0.0, 1.0, lobeLevel), 0.70);
    float lobeShapeEnergy = mix(lobeEnergy, 0.58, processing);
    float dx = (beamUv.x - center) * beamSize.x;
    float dy = sideDistance;
    float centerBias = 1.0 - abs(center - 0.5) * 1.15;
    float radiusX = max(beamSize.x * (0.30 + centerBias * 0.12), (128.0 + lobeShapeEnergy * 190.0) * innerGlowScaleX * uDpr);
    float radiusY = (62.0 + lobeShapeEnergy * 126.0) * innerGlowScaleY * uDpr;
    float field = exp(-((dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY)) * 0.50) * lobeEnergy;
    float washRadiusX = max(beamSize.x * (0.44 + centerBias * 0.16), radiusX * 1.78);
    float washRadiusY = radiusY * 1.26;
    float washReach = washRadiusY * 1.08;
    float bottomGate = 1.0 - smoothstep(washReach * 0.62, washReach, sideDistance);
    float wash = exp(-((dx * dx) / (washRadiusX * washRadiusX) + (dy * dy) / (washRadiusY * washRadiusY)) * 0.34) * lobeEnergy * bottomGate;
    vec3 lobeColor = audioPalette(center * 0.68 + 0.16 + uHueShift * 0.35);

    bloomField += field;
    washField += wash;
    bloomMix += lobeColor * field;
    washMix += lobeColor * wash;
  }

  float bloomStrength = clamp(bloomField, 0.0, 1.65);
  float washStrength = clamp(washField, 0.0, 1.35);
  edgeGlow = clamp(bloomStrength + washStrength * 0.34, 0.0, 1.62);
  bloomColor = bloomMix / max(bloomField, 0.001);
  vec3 washColor = washMix / max(washField, 0.001);

  float sourceRimAlpha = sourceRim * energy * uAlpha * 0.88 * borderBrightness;
  float sourceScaleAlpha = sourceRim * pow(energy, 1.04) * uAlpha * 0.22;
  float glowAlpha = edgeGlow * uAlpha * 0.26 * innerGlowAmount;
  float bloomAlpha = pow(bloomStrength, 1.02) * uAlpha * 0.22 * innerGlowAmount;
  float washAlpha = pow(washStrength, 1.08) * uAlpha * 0.050 * innerGlowAmount;
  vec3 body =
    lineColor * (sourceRimAlpha + sourceScaleAlpha + glowAlpha) +
    bloomColor * bloomAlpha +
    washColor * washAlpha;

  float finalAlpha = min(sourceRimAlpha + sourceScaleAlpha + glowAlpha + bloomAlpha + washAlpha, 1.0);

  gl_FragColor = vec4(body, finalAlpha);
}
`;

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function resolveAudioPalette(palette: VoiceEdgePaletteName | VoiceEdgePalette | undefined) {
  if (!palette) return voiceEdgePalettes.prism;
  if (typeof palette === "string") return voiceEdgePalettes[palette];

  return palette;
}

function sideToUniform(side: VoiceEdgeSide) {
  if (side === "top") return 1;
  if (side === "right") return 2;
  if (side === "left") return 3;

  return 0;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function detectBorderRadius(target: HTMLElement, fallback: number) {
  const raw = Number.parseFloat(getComputedStyle(target).borderTopLeftRadius);

  return Number.isFinite(raw) ? raw : fallback;
}

export function syncAudioBorderClip(
  host: HTMLElement,
  target: HTMLElement,
  input: AudioBorderGeometryInput,
) {
  if (typeof input.borderRadius === "number" && Number.isFinite(input.borderRadius)) {
    const radius = `${Math.max(0, input.borderRadius)}px`;

    host.style.borderTopLeftRadius = radius;
    host.style.borderTopRightRadius = radius;
    host.style.borderBottomRightRadius = radius;
    host.style.borderBottomLeftRadius = radius;
    return;
  }

  const styles = getComputedStyle(target);
  const fallback = styles.borderRadius || "0px";

  host.style.borderTopLeftRadius = styles.borderTopLeftRadius || fallback;
  host.style.borderTopRightRadius = styles.borderTopRightRadius || fallback;
  host.style.borderBottomRightRadius = styles.borderBottomRightRadius || fallback;
  host.style.borderBottomLeftRadius = styles.borderBottomLeftRadius || fallback;
}

function measureAudioBorderGeometry(
  canvas: HTMLCanvasElement,
  target: HTMLElement,
  input: AudioBorderGeometryInput,
): AudioBorderGeometry {
  const dpr = canvas.width / Math.max(1, canvas.getBoundingClientRect().width);
  const rect = target.getBoundingClientRect();
  const radius = input.borderRadius ?? detectBorderRadius(target, 16);

  return {
    borderRadius: Math.max(0, radius * dpr),
    borderWidth: Math.max(0.1 * dpr, input.borderWidth * dpr),
    boxHeight: Math.max(1, rect.height * dpr),
    boxWidth: Math.max(1, rect.width * dpr),
    dpr,
  };
}

export function createVoiceEdgeShader(
  canvas: HTMLCanvasElement,
  target: HTMLElement,
  geometryInput: React.MutableRefObject<AudioBorderGeometryInput>,
  opts: {
    active?: boolean;
    borderBrightness?: number;
    idleLevel?: number;
    innerGlowBrightness?: number;
    innerGlowHeight?: number;
    palette?: VoiceEdgePaletteName | VoiceEdgePalette;
    processing?: boolean;
    side?: VoiceEdgeSide;
  } = {},
): VoiceEdgeController | null {
  if (typeof window === "undefined") return null;

  const glContext = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  });

  if (!glContext) return null;

  const gl: WebGLRenderingContext = glContext;
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.useProgram(program);

  const buffer = gl.createBuffer();

  if (!buffer) {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a");

  if (positionLocation >= 0) {
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  }

  const uniforms = {
    alpha: gl.getUniformLocation(program, "uAlpha"),
    audioBins:
      gl.getUniformLocation(program, "uAudioBins[0]") ??
      gl.getUniformLocation(program, "uAudioBins"),
    borderBrightness: gl.getUniformLocation(program, "uBorderBrightness"),
    borderRadius: gl.getUniformLocation(program, "uBorderRadius"),
    borderWidth: gl.getUniformLocation(program, "uBorderWidth"),
    boxSize: gl.getUniformLocation(program, "uBoxSize"),
    dpr: gl.getUniformLocation(program, "uDpr"),
    hueShift: gl.getUniformLocation(program, "uHueShift"),
    idleLevel: gl.getUniformLocation(program, "uIdleLevel"),
    innerGlowBrightness: gl.getUniformLocation(program, "uInnerGlowBrightness"),
    innerGlowHeight: gl.getUniformLocation(program, "uInnerGlowHeight"),
    palA: gl.getUniformLocation(program, "uPalA"),
    palB: gl.getUniformLocation(program, "uPalB"),
    palC: gl.getUniformLocation(program, "uPalC"),
    palD: gl.getUniformLocation(program, "uPalD"),
    processing: gl.getUniformLocation(program, "uProcessing"),
    res: gl.getUniformLocation(program, "uRes"),
    side: gl.getUniformLocation(program, "uSide"),
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const state = {
    active: opts.active ?? true,
    alpha: 0,
    audioBins: new Float32Array(emptyAudioBins),
    targetAudioBins: new Float32Array(emptyAudioBins),
    borderBrightness: finiteOr(opts.borderBrightness, 1),
    idleLevel: clamp(finiteOr(opts.idleLevel, 0.015), 0, 0.28),
    innerGlowBrightness: finiteOr(opts.innerGlowBrightness, 1),
    innerGlowHeight: finiteOr(opts.innerGlowHeight, 1),
    palette: resolveAudioPalette(opts.palette),
    processing: opts.processing ?? false,
    processingMix: opts.processing ? 1 : 0,
    processingStartedAt: performance.now(),
    side: opts.side ?? "bottom",
  };
  const hueShift = Math.random() * 0.4;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width === width && canvas.height === height) return;

    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }

  resize();

  let observer: ResizeObserver | undefined;
  let frame = 0;

  if (typeof ResizeObserver === "function") {
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    observer.observe(target);
  } else {
    window.addEventListener("resize", resize);
  }

  function tick() {
    resize();

    const palette = state.palette;
    const geometry = measureAudioBorderGeometry(canvas, target, geometryInput.current);
    let visualEnergy = 0;

    if (state.processing && !state.active) {
      updateProcessingBins((performance.now() - state.processingStartedAt) * 0.001);
    }

    for (let i = 0; i < AUDIO_BIN_COUNT; i += 1) {
      const rawTarget = state.targetAudioBins[i] ?? 0;
      const targetBin = rawTarget - PEAK_FLATTEN * rawTarget * rawTarget;
      const prevBin = state.audioBins[i] ?? 0;
      const delta = targetBin - prevBin;
      const stepT = clamp((targetBin - 0.16) / Math.max(0.0001, 0.72 - 0.16), 0, 1);
      const smooth = stepT * stepT * (3 - 2 * stepT);
      const attack = ATTACK_BASE + smooth * ATTACK_RANGE;
      const follow = delta > 0 ? attack : RELEASE;
      const value = prevBin + delta * follow;

      state.audioBins[i] = value;
      visualEnergy = Math.max(visualEnergy, value);
    }

    const targetProcessingMix = state.processing ? 1 : 0;
    const processingFollow = targetProcessingMix > state.processingMix ? 0.14 : 0.08;

    state.processingMix += (targetProcessingMix - state.processingMix) * processingFollow;
    if (Math.abs(targetProcessingMix - state.processingMix) < 0.001) {
      state.processingMix = targetProcessingMix;
    }

    const targetAlpha = state.active || state.processing || visualEnergy > 0.018 ? 1 : 0;

    state.alpha += (targetAlpha - state.alpha) * (targetAlpha > state.alpha ? 0.18 : 0.035);
    if (Math.abs(targetAlpha - state.alpha) < 0.001) {
      state.alpha = targetAlpha;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uniforms.res, canvas.width, canvas.height);
    gl.uniform2f(uniforms.boxSize, geometry.boxWidth, geometry.boxHeight);
    gl.uniform1f(uniforms.alpha, state.alpha);
    gl.uniform1f(uniforms.borderBrightness, state.borderBrightness);
    gl.uniform1f(uniforms.borderRadius, geometry.borderRadius);
    gl.uniform1f(uniforms.borderWidth, geometry.borderWidth);
    gl.uniform1f(uniforms.dpr, geometry.dpr);
    gl.uniform1f(uniforms.hueShift, hueShift);
    gl.uniform1f(uniforms.idleLevel, state.idleLevel);
    gl.uniform1f(uniforms.innerGlowBrightness, state.innerGlowBrightness);
    gl.uniform1f(uniforms.innerGlowHeight, state.innerGlowHeight);
    gl.uniform1f(uniforms.side, sideToUniform(state.side));
    gl.uniform3f(uniforms.palA, palette.a[0], palette.a[1], palette.a[2]);
    gl.uniform3f(uniforms.palB, palette.b[0], palette.b[1], palette.b[2]);
    gl.uniform3f(uniforms.palC, palette.c[0], palette.c[1], palette.c[2]);
    gl.uniform3f(uniforms.palD, palette.d[0], palette.d[1], palette.d[2]);
    gl.uniform1f(uniforms.processing, state.processingMix);
    gl.uniform1fv(uniforms.audioBins, state.audioBins);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    frame = window.requestAnimationFrame(tick);
  }

  frame = window.requestAnimationFrame(tick);

  function updateProcessingBins(time: number) {
    const waveHead = ((time * 0.34) % 1.42) - 0.21;

    for (let i = 0; i < AUDIO_BIN_COUNT; i += 1) {
      const x = i / Math.max(1, AUDIO_BIN_COUNT - 1);
      const distance = x - waveHead;
      const head = Math.exp(-(distance * distance) * 28);
      const tailDistance = waveHead - x;
      const tail = tailDistance > 0 ? Math.exp(-tailDistance * 2.4) * 0.2 : 0;

      state.targetAudioBins[i] = Math.min(0.56, Math.max(0.03, head * 0.42 + tail));
    }
  }

  return {
    destroy: () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    },
    setActive: (active) => {
      state.active = active;
    },
    setAudioBins: (bins) => {
      state.targetAudioBins.set(bins.subarray(0, AUDIO_BIN_COUNT));
    },
    setBorderBrightness: (brightness) => {
      state.borderBrightness = brightness;
    },
    setIdleLevel: (level) => {
      state.idleLevel = clamp(level, 0, 0.28);
    },
    setInnerGlowBrightness: (brightness) => {
      state.innerGlowBrightness = brightness;
    },
    setInnerGlowHeight: (height) => {
      state.innerGlowHeight = height;
    },
    setPalette: (palette) => {
      state.palette = palette;
    },
    setProcessing: (processing) => {
      if (processing && !state.processing) state.processingStartedAt = performance.now();
      state.processing = processing;
    },
    setSide: (side) => {
      state.side = side;
    },
  };
}
