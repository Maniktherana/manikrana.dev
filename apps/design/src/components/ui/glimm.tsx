"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Vec3 = [number, number, number];

type GlimmPalette = {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  d: Vec3;
};

const glimmPalettes = {
  prism: {
    a: [0.46, 0.88, 0.33],
    b: [0.6, 0.58, 0.74],
    c: [0.5, 0.5, 0.5],
    d: [0.54, 0.22, 0.84],
  },
  berry: {
    a: [0.92, 0.36, 0.56],
    b: [0.1, 0.14, 0.37],
    c: [0.5, 0.5, 0.5],
    d: [0.84, 0.11, 0.5],
  },
  lagoon: {
    a: [0.58, 0.64, 0.52],
    b: [0.64, 0.3, 0.5],
    c: [0.5, 0.5, 0.5],
    d: [0.37, 0.66, 0.89],
  },
  citrus: {
    a: [0.55, 0.61, 0.61],
    b: [0.54, 0.41, 0.63],
    c: [0.5, 0.5, 0.5],
    d: [0.66, 0.92, 0.23],
  },
  azure: {
    a: [0.13, 0.61, 1],
    b: [0.15, 0.14, 0],
    c: [0.5, 0.5, 0.5],
    d: [0.29, 0.98, 0.74],
  },
  ember: {
    a: [0.83, 0.61, 0.6],
    b: [0.2, 0.41, 0.62],
    c: [0.5, 0.5, 0.5],
    d: [0.73, 0.05, 0.36],
  },
  neutral: {
    a: [0.62, 0.62, 0.62],
    b: [0.24, 0.24, 0.24],
    c: [0.5, 0.5, 0.5],
    d: [0, 0, 0],
  },
} as const satisfies Record<string, GlimmPalette>;

type GlimmPaletteName = keyof typeof glimmPalettes;
type GlimmDirection = "ltr" | "rtl" | "ttb" | "btt";

type GlimmController = {
  canvas: HTMLCanvasElement;
  destroy: () => void;
  getProgress: () => number;
  setAlpha: (alpha: number) => void;
  setBandTight: (tightness: number) => void;
  setBrightness: (brightness: number) => void;
  setDirection: (direction: GlimmDirection) => void;
  setPalette: (palette: GlimmPalette) => void;
  setProgress: (progress: number) => void;
  setSwellAmount: (amount: number) => void;
  setWaveAmount: (amount: number) => void;
  setWaveSpeed: (speed: number) => void;
};

type GlimmSweepHandle = {
  cancel: () => void;
  done: Promise<void>;
  midpoint: Promise<void>;
};

type SweepProps = React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  bandTight?: number;
  brightness?: number;
  direction?: GlimmDirection;
  onMidpoint?: () => void | Promise<void>;
  outroMs?: number;
  palette?: GlimmPaletteName | GlimmPalette;
  pauseMs?: number;
  peakAlpha?: number;
  swellAmount?: number;
  sweepMs?: number;
  waveAmount?: number;
  waveSpeed?: number;
};

const vertexShaderSource = `
attribute vec2 a;

void main() {
  gl_Position = vec4(a, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;
uniform float uAlpha;
uniform float uBandTight;
uniform float uPosStart;
uniform float uPosEnd;
uniform float uHueShift;
uniform float uDirection;
uniform float uWaveAmount;
uniform float uWaveSpeed;
uniform float uBrightness;
uniform float uSwellAmount;
uniform vec3 uPalA;
uniform vec3 uPalB;
uniform vec3 uPalC;
uniform vec3 uPalD;

#define PI 3.14159265359

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(2.0 * PI * (c * t + d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float axis = mix(uv.x, uv.y, uDirection);
  float cross = mix(uv.y, uv.x, uDirection);
  float pos = uPosStart + uProgress * (uPosEnd - uPosStart);
  float tick = uTime * uWaveSpeed;

  float wave =
    sin(cross * 6.0 + tick * 1.3) * 0.020 +
    sin(cross * 13.0 - tick * 0.9 + 1.4) * 0.012 +
    sin(cross * 21.0 + tick * 1.7 + 2.6) * 0.006;
  wave *= uWaveAmount;

  float distToBand = (axis - pos) - wave;
  float band = exp(-distToBand * distToBand * uBandTight);
  float slopeAxis = -2.0 * distToBand * uBandTight * band;

  vec2 slope;
  slope.x = mix(slopeAxis, 0.0, uDirection);
  slope.y = mix(0.0, slopeAxis, uDirection);

  vec3 normal = normalize(vec3(-slope.x * 0.18, slope.y * 0.18, 1.0));
  float trailDistance = max(-distToBand, 0.0);
  float trail =
    smoothstep(0.0, 0.18, trailDistance) *
    (1.0 - smoothstep(0.18, 0.55, trailDistance)) *
    0.24;

  float intensity = max(band * 0.95, trail);
  float edgeFade = smoothstep(0.0, 0.015, cross) * smoothstep(1.0, 0.985, cross);
  float hue =
    normal.x * 0.45 +
    normal.y * 0.30 +
    axis * 1.4 +
    cross * 0.35 +
    uHueShift +
    uTime * 0.04;

  vec3 color = palette(hue, uPalA, uPalB, uPalC, uPalD) * uBrightness;
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 light = normalize(vec3(0.35, 0.55, 0.9));
  vec3 halfVector = normalize(light + view);
  float normalToHalf = clamp(dot(normal, halfVector), 0.0, 1.0);
  float normalToView = clamp(dot(normal, view), 0.0, 1.0);
  float fresnel = pow(1.0 - normalToView, 3.0);
  float specular = pow(normalToHalf, 80.0);
  float progressFade = smoothstep(0.0, 0.08, uProgress);

  float bodyAlpha = intensity * edgeFade * uAlpha * progressFade;
  float highlightMask = band * edgeFade * uAlpha * progressFade * uSwellAmount;
  vec3 highlight = (color * fresnel * 0.55 + vec3(specular) * 1.1) * highlightMask;
  float highlightAlpha = (fresnel * 0.4 + specular * 0.9) * highlightMask;

  gl_FragColor = vec4(color * bodyAlpha + highlight, min(bodyAlpha + highlightAlpha, 1.0));
}
`;

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function resolvePalette(palette: GlimmPaletteName | GlimmPalette | undefined) {
  if (!palette) return glimmPalettes.prism;
  if (typeof palette === "string") return glimmPalettes[palette];

  return palette;
}

function directionUniforms(direction: GlimmDirection) {
  switch (direction) {
    case "rtl":
      return { axis: 0, posEnd: -0.65, posStart: 1.65 };
    case "ttb":
      return { axis: 1, posEnd: 1.65, posStart: -0.65 };
    case "btt":
      return { axis: 1, posEnd: -0.65, posStart: 1.65 };
    case "ltr":
    default:
      return { axis: 0, posEnd: 1.65, posStart: -0.65 };
  }
}

function easeOutQuart(progress: number) {
  return 1 - Math.pow(1 - progress, 4);
}

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
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

function createSweepShader(
  canvas: HTMLCanvasElement,
  opts: {
    bandTight?: number;
    brightness?: number;
    direction?: GlimmDirection;
    palette?: GlimmPaletteName | GlimmPalette;
    swellAmount?: number;
    waveAmount?: number;
    waveSpeed?: number;
  } = {},
): GlimmController | null {
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

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();

  if (!program) return null;

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
    bandTight: gl.getUniformLocation(program, "uBandTight"),
    brightness: gl.getUniformLocation(program, "uBrightness"),
    direction: gl.getUniformLocation(program, "uDirection"),
    hueShift: gl.getUniformLocation(program, "uHueShift"),
    palA: gl.getUniformLocation(program, "uPalA"),
    palB: gl.getUniformLocation(program, "uPalB"),
    palC: gl.getUniformLocation(program, "uPalC"),
    palD: gl.getUniformLocation(program, "uPalD"),
    posEnd: gl.getUniformLocation(program, "uPosEnd"),
    posStart: gl.getUniformLocation(program, "uPosStart"),
    progress: gl.getUniformLocation(program, "uProgress"),
    res: gl.getUniformLocation(program, "uRes"),
    swellAmount: gl.getUniformLocation(program, "uSwellAmount"),
    time: gl.getUniformLocation(program, "uTime"),
    waveAmount: gl.getUniformLocation(program, "uWaveAmount"),
    waveSpeed: gl.getUniformLocation(program, "uWaveSpeed"),
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const state = {
    alpha: 0,
    bandTight: finiteOr(opts.bandTight, 14),
    brightness: finiteOr(opts.brightness, 1),
    direction: opts.direction ?? "ltr",
    palette: resolvePalette(opts.palette),
    progress: 0,
    swellAmount: finiteOr(opts.swellAmount, 0.55),
    waveAmount: finiteOr(opts.waveAmount, 1),
    waveSpeed: finiteOr(opts.waveSpeed, 1),
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
  const startedAt = performance.now();

  if (typeof ResizeObserver === "function") {
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  function tick() {
    resize();

    const time = (performance.now() - startedAt) / 1000;
    const direction = directionUniforms(state.direction);
    const palette = state.palette;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uniforms.res, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.progress, state.progress);
    gl.uniform1f(uniforms.alpha, state.alpha);
    gl.uniform1f(uniforms.bandTight, state.bandTight);
    gl.uniform1f(uniforms.posStart, direction.posStart);
    gl.uniform1f(uniforms.posEnd, direction.posEnd);
    gl.uniform1f(uniforms.direction, direction.axis);
    gl.uniform1f(uniforms.waveAmount, state.waveAmount);
    gl.uniform1f(uniforms.waveSpeed, state.waveSpeed);
    gl.uniform1f(uniforms.brightness, state.brightness);
    gl.uniform1f(uniforms.swellAmount, state.swellAmount);
    gl.uniform1f(uniforms.hueShift, hueShift);
    gl.uniform3f(uniforms.palA, palette.a[0], palette.a[1], palette.a[2]);
    gl.uniform3f(uniforms.palB, palette.b[0], palette.b[1], palette.b[2]);
    gl.uniform3f(uniforms.palC, palette.c[0], palette.c[1], palette.c[2]);
    gl.uniform3f(uniforms.palD, palette.d[0], palette.d[1], palette.d[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    frame = window.requestAnimationFrame(tick);
  }

  frame = window.requestAnimationFrame(tick);

  return {
    canvas,
    destroy: () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    },
    getProgress: () => state.progress,
    setAlpha: (alpha) => {
      state.alpha = alpha;
    },
    setBandTight: (tightness) => {
      state.bandTight = tightness;
    },
    setBrightness: (brightness) => {
      state.brightness = brightness;
    },
    setDirection: (direction) => {
      state.direction = direction;
    },
    setPalette: (palette) => {
      state.palette = palette;
    },
    setProgress: (progress) => {
      state.progress = progress;
    },
    setSwellAmount: (amount) => {
      state.swellAmount = amount;
    },
    setWaveAmount: (amount) => {
      state.waveAmount = amount;
    },
    setWaveSpeed: (speed) => {
      state.waveSpeed = speed;
    },
  };
}

function ramp(
  durationMs: number,
  from: number,
  to: number,
  setter: (value: number) => void,
  isCancelled: () => boolean,
  setFrame: (frame: number) => void,
) {
  return new Promise<void>((resolve) => {
    const startedAt = performance.now();
    const duration = Math.max(1, durationMs);

    function tick() {
      if (isCancelled()) {
        resolve();
        return;
      }

      const raw = Math.min(1, (performance.now() - startedAt) / duration);
      setter(from + (to - from) * easeInOutCubic(raw));

      if (raw < 1) {
        setFrame(window.requestAnimationFrame(tick));
      } else {
        resolve();
      }
    }

    setFrame(window.requestAnimationFrame(tick));
  });
}

function playSweepAnimation(
  controller: GlimmController,
  opts: {
    bandTight?: number;
    brightness?: number;
    direction?: GlimmDirection;
    onMidpoint?: () => void | Promise<void>;
    outroMs?: number;
    palette?: GlimmPaletteName | GlimmPalette;
    peakAlpha?: number;
    swellAmount?: number;
    sweepMs?: number;
    waveAmount?: number;
    waveSpeed?: number;
  } = {},
): GlimmSweepHandle {
  const sweepMs = Math.max(80, finiteOr(opts.sweepMs, 1100));
  const outroMs = Math.max(0, finiteOr(opts.outroMs, 0));
  const peakAlpha = Math.max(0, finiteOr(opts.peakAlpha, 1));
  let cancelled = false;
  let frame = 0;
  let resolveMidpoint: () => void = () => undefined;
  let resolveDone: () => void = () => undefined;
  const midpoint = new Promise<void>((resolve) => {
    resolveMidpoint = resolve;
  });
  const done = new Promise<void>((resolve) => {
    resolveDone = resolve;
  });

  if (opts.palette) controller.setPalette(resolvePalette(opts.palette));
  if (opts.bandTight !== undefined) controller.setBandTight(opts.bandTight);
  if (opts.direction) controller.setDirection(opts.direction);
  if (opts.waveAmount !== undefined) controller.setWaveAmount(opts.waveAmount);
  if (opts.waveSpeed !== undefined) controller.setWaveSpeed(opts.waveSpeed);
  if (opts.brightness !== undefined) controller.setBrightness(opts.brightness);
  if (opts.swellAmount !== undefined) {
    controller.setSwellAmount(opts.swellAmount);
  }

  void (async () => {
    const startProgress =
      controller.getProgress() >= 0.999 ? 0 : Math.max(0, Math.min(1, controller.getProgress()));
    const remaining = 1 - startProgress;
    const phaseMs = Math.max(80, sweepMs * remaining);
    const startedAt = performance.now();
    let midpointFired = false;

    controller.setAlpha(peakAlpha);
    controller.setProgress(startProgress);

    await new Promise<void>((resolve) => {
      function tick() {
        if (cancelled) {
          resolve();
          return;
        }

        const raw = Math.min(1, (performance.now() - startedAt) / phaseMs);
        const progress = startProgress + remaining * easeOutQuart(raw);

        controller.setProgress(progress);

        if (!midpointFired && progress >= 0.5) {
          midpointFired = true;
          Promise.resolve(opts.onMidpoint?.()).finally(resolveMidpoint);
        }

        if (raw < 1) {
          frame = window.requestAnimationFrame(tick);
        } else {
          resolve();
        }
      }

      frame = window.requestAnimationFrame(tick);
    });

    if (cancelled) return;

    if (!midpointFired) {
      await Promise.resolve(opts.onMidpoint?.()).finally(resolveMidpoint);
    }

    if (outroMs > 0) {
      await ramp(
        outroMs,
        peakAlpha,
        0,
        controller.setAlpha,
        () => cancelled,
        (nextFrame) => {
          frame = nextFrame;
        },
      );
    }

    if (cancelled) return;

    controller.setAlpha(0);
    controller.setProgress(0);
    resolveDone();
  })();

  return {
    cancel: () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      resolveMidpoint();
      resolveDone();
    },
    done,
    midpoint,
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReduced(query.matches);

    const update = () => setReduced(query.matches);

    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function Sweep({
  active = true,
  bandTight = 14,
  brightness = 1,
  children,
  className,
  direction = "ltr",
  onMidpoint,
  outroMs = 0,
  palette = "prism",
  pauseMs = 900,
  peakAlpha = 1,
  swellAmount = 0.55,
  sweepMs = 1100,
  waveAmount = 1,
  waveSpeed = 1,
  ...props
}: SweepProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const controllerRef = React.useRef<GlimmController | null>(null);
  const shaderOptionsRef = React.useRef({
    bandTight,
    brightness,
    direction,
    palette,
    swellAmount,
    waveAmount,
    waveSpeed,
  });
  const latestOptionsRef = React.useRef({
    bandTight,
    brightness,
    direction,
    onMidpoint,
    outroMs,
    palette,
    pauseMs,
    peakAlpha,
    swellAmount,
    sweepMs,
    waveAmount,
    waveSpeed,
  });
  const reducedMotion = usePrefersReducedMotion();

  shaderOptionsRef.current = {
    bandTight,
    brightness,
    direction,
    palette,
    swellAmount,
    waveAmount,
    waveSpeed,
  };

  latestOptionsRef.current = {
    bandTight,
    brightness,
    direction,
    onMidpoint,
    outroMs,
    palette,
    pauseMs,
    peakAlpha,
    swellAmount,
    sweepMs,
    waveAmount,
    waveSpeed,
  };

  React.useEffect(() => {
    const controller = controllerRef.current;

    if (!controller) return;

    controller.setBandTight(bandTight);
    controller.setBrightness(brightness);
    controller.setDirection(direction);
    controller.setPalette(resolvePalette(palette));
    controller.setSwellAmount(swellAmount);
    controller.setWaveAmount(waveAmount);
    controller.setWaveSpeed(waveSpeed);
  }, [bandTight, brightness, direction, palette, swellAmount, waveAmount, waveSpeed]);

  React.useEffect(() => {
    if (reducedMotion) return undefined;

    const host = hostRef.current;

    if (!host) return undefined;

    const canvas = document.createElement("canvas");

    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      display: "block",
      height: "100%",
      inset: "0",
      pointerEvents: "none",
      position: "absolute",
      width: "100%",
      zIndex: "20",
    });

    host.appendChild(canvas);

    const controller = createSweepShader(canvas, shaderOptionsRef.current);

    if (!controller) {
      canvas.remove();
      return undefined;
    }

    controllerRef.current = controller;

    return () => {
      controller.destroy();
      controllerRef.current = null;
      canvas.remove();
    };
  }, [reducedMotion]);

  React.useEffect(() => {
    if (reducedMotion || !active) {
      controllerRef.current?.setAlpha(0);
      return undefined;
    }

    let cancelled = false;
    let timeout = 0;
    let handle: GlimmSweepHandle | undefined;

    function schedule(delay: number) {
      timeout = window.setTimeout(run, delay);
    }

    function run() {
      const controller = controllerRef.current;

      if (!controller) {
        schedule(80);
        return;
      }

      const options = latestOptionsRef.current;

      handle?.cancel();
      handle = playSweepAnimation(controller, options);
      void handle.done.then(() => {
        if (cancelled) return;
        schedule(Math.max(0, options.pauseMs));
      });
    }

    schedule(160);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      handle?.cancel();
      controllerRef.current?.setAlpha(0);
    };
  }, [active, reducedMotion]);

  return (
    <div
      data-slot="sweep"
      className={cn(
        "relative isolate h-full w-full overflow-hidden contain-paint",
        className,
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        ref={hostRef}
        className="pointer-events-none absolute inset-0 z-20 block overflow-hidden"
      />
    </div>
  );
}

export { Sweep, glimmPalettes };
export type { GlimmDirection, GlimmPalette, GlimmPaletteName, SweepProps };
