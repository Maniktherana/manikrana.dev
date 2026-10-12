import { useEffect, useRef, useState, type HTMLAttributes, type RefObject } from "react";
import { cn } from "@manikrana/ui/lib/utils";

type Vec3 = [number, number, number];

type SweepPalette = {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  d: Vec3;
};

const sweepPalettes = {
  aurora: {
    a: [0.46, 0.88, 0.33],
    b: [0.6, 0.58, 0.74],
    c: [0.5, 0.5, 0.5],
    d: [0.54, 0.22, 0.84],
  },
  bloom: {
    a: [0.92, 0.36, 0.56],
    b: [0.1, 0.14, 0.37],
    c: [0.5, 0.5, 0.5],
    d: [0.84, 0.11, 0.5],
  },
  tide: {
    a: [0.13, 0.61, 1],
    b: [0.15, 0.14, 0],
    c: [0.5, 0.5, 0.5],
    d: [0.29, 0.98, 0.74],
  },
  ash: {
    a: [0.62, 0.62, 0.62],
    b: [0.24, 0.24, 0.24],
    c: [0.5, 0.5, 0.5],
    d: [0, 0, 0],
  },
} as const satisfies Record<string, SweepPalette>;

type SweepPaletteName = keyof typeof sweepPalettes;
type SweepDirection = "ltr" | "rtl" | "ttb" | "btt";

type SweepShaderOptions = {
  bandTight?: number;
  brightness?: number;
  curveAmount?: number;
  direction?: SweepDirection;
  palette?: SweepPaletteName | SweepPalette;
  swellAmount?: number;
};

type SweepRunOptions = SweepShaderOptions & {
  onMidpoint?: () => void | Promise<void>;
  outroMs?: number;
  peakAlpha?: number;
  sweepMs?: number;
};

type SweepController = {
  destroy: () => void;
  getProgress: () => number;
  setAlpha: (alpha: number) => void;
  setBandTight: (tightness: number) => void;
  setBrightness: (brightness: number) => void;
  setCurveAmount: (amount: number) => void;
  setDirection: (direction: SweepDirection) => void;
  setPalette: (palette: SweepPalette) => void;
  setProgress: (progress: number) => void;
  setSwellAmount: (amount: number) => void;
  start: () => void;
  stop: () => void;
};

type SweepRunHandle = {
  cancel: () => void;
  done: Promise<void>;
  midpoint: Promise<void>;
};

type SweepProps = HTMLAttributes<HTMLDivElement> &
  SweepRunOptions & {
    active?: boolean;
    pauseMs?: number;
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
uniform float uCurveAmount;
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
  float travel = sign(uPosEnd - uPosStart);
  float lead = uCurveAmount * mix(uRes.y / uRes.x, uRes.x / uRes.y, uDirection);
  float pos = uPosStart + uProgress * (uPosEnd - uPosStart + travel * lead);
  float centered = cross * 2.0 - 1.0;

  float distToBand = (axis - pos) * travel + lead * centered * centered;
  float band = exp(-distToBand * distToBand * uBandTight);
  float falloff = -2.0 * distToBand * uBandTight * band;
  float slopeAxis = falloff * travel;
  float slopeCross = falloff * uCurveAmount * centered * 4.0;

  vec2 slope;
  slope.x = mix(slopeAxis, slopeCross, uDirection);
  slope.y = mix(slopeCross, slopeAxis, uDirection);

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

function resolvePalette(palette: SweepPaletteName | SweepPalette | undefined) {
  if (!palette) return sweepPalettes.aurora;
  if (typeof palette === "string") return sweepPalettes[palette];

  return palette;
}

function directionUniforms(direction: SweepDirection) {
  switch (direction) {
    case "rtl":
      return { axis: 0, posEnd: -0.725, posStart: 1.65 };
    case "ttb":
      return { axis: 1, posEnd: -0.725, posStart: 1.65 };
    case "btt":
      return { axis: 1, posEnd: 1.725, posStart: -0.65 };
    case "ltr":
    default:
      return { axis: 0, posEnd: 1.725, posStart: -0.65 };
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
  opts: SweepShaderOptions = {},
): SweepController | null {
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
    curveAmount: gl.getUniformLocation(program, "uCurveAmount"),
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
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const state = {
    alpha: 0,
    bandTight: finiteOr(opts.bandTight, 10),
    brightness: finiteOr(opts.brightness, 1),
    curveAmount: finiteOr(opts.curveAmount, 0.15),
    direction: opts.direction ?? "ltr",
    palette: resolvePalette(opts.palette),
    progress: 0,
    swellAmount: finiteOr(opts.swellAmount, 0.55),
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
    gl.uniform1f(uniforms.curveAmount, state.curveAmount);
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
    setCurveAmount: (amount) => {
      state.curveAmount = amount;
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
    start: () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    },
    stop: () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      gl.clear(gl.COLOR_BUFFER_BIT);
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
  controller: SweepController,
  opts: SweepRunOptions = {},
): SweepRunHandle {
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
  if (opts.curveAmount !== undefined) controller.setCurveAmount(opts.curveAmount);
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
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReduced(query.matches);

    const update = () => setReduced(query.matches);

    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return undefined;

    let intersecting = false;
    const update = () => setOnScreen(intersecting && !document.hidden);
    const observer = new IntersectionObserver((entries) => {
      intersecting = entries.at(-1)?.isIntersecting ?? false;
      update();
    });

    observer.observe(element);
    document.addEventListener("visibilitychange", update);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);

  return onScreen;
}

function Sweep({
  active = true,
  bandTight = 10,
  brightness = 1,
  children,
  className,
  curveAmount = 0.15,
  direction = "ltr",
  onMidpoint,
  outroMs = 0,
  palette = "aurora",
  pauseMs = 900,
  peakAlpha = 1,
  swellAmount = 0.55,
  sweepMs = 1100,
  ...props
}: SweepProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const controllerRef = useRef<SweepController | null>(null);
  const options = {
    bandTight,
    brightness,
    curveAmount,
    direction,
    onMidpoint,
    outroMs,
    palette,
    pauseMs,
    peakAlpha,
    swellAmount,
    sweepMs,
  };
  const optionsRef = useRef(options);
  const reducedMotion = usePrefersReducedMotion();
  const running = useOnScreen(rootRef) && active;

  optionsRef.current = options;

  useEffect(() => {
    const controller = controllerRef.current;

    if (!controller) return;

    controller.setBandTight(bandTight);
    controller.setBrightness(brightness);
    controller.setCurveAmount(curveAmount);
    controller.setDirection(direction);
    controller.setPalette(resolvePalette(palette));
    controller.setSwellAmount(swellAmount);
  }, [bandTight, brightness, curveAmount, direction, palette, swellAmount]);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const host = hostRef.current;

    if (!host) return undefined;

    const canvas = document.createElement("canvas");

    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "pointer-events-none absolute inset-0 block size-full";

    host.appendChild(canvas);

    const controller = createSweepShader(canvas, optionsRef.current);

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

  useEffect(() => {
    const controller = controllerRef.current;

    if (!controller || !running) return undefined;

    let cancelled = false;
    let timeout = 0;
    let handle: SweepRunHandle | undefined;

    const run = () => {
      const latest = optionsRef.current;

      handle?.cancel();
      handle = playSweepAnimation(controller, latest);
      void handle.done.then(() => {
        if (cancelled) return;
        timeout = window.setTimeout(run, Math.max(0, latest.pauseMs));
      });
    };

    controller.start();
    timeout = window.setTimeout(run, 160);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      handle?.cancel();
      controller.setAlpha(0);
      controller.stop();
    };
  }, [running, reducedMotion]);

  return (
    <div
      ref={rootRef}
      data-slot="sweep"
      className={cn("relative isolate size-full overflow-hidden contain-paint", className)}
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

// Mirrors the shader's coloring at its default falloff; keep the two in sync.
function stillBand(
  palette: SweepPaletteName | SweepPalette = "aurora",
  direction: SweepDirection = "ltr",
) {
  const { a, b, c, d } = resolvePalette(palette);
  const channel = (index: 0 | 1 | 2, t: number) => {
    const value = a[index] + b[index] * Math.cos(2 * Math.PI * (c[index] * t + d[index]));

    return Math.round(255 * Math.min(1, Math.max(0, value)));
  };
  const stops = Array.from({ length: 11 }, (_, step) => {
    const axis = step / 10;
    const hue = axis * 1.4 + 0.5 * 0.35;
    const alpha = Math.exp(-((axis - 0.5) ** 2) * 10) * 0.95;

    return `rgb(${channel(0, hue)} ${channel(1, hue)} ${channel(2, hue)} / ${alpha.toFixed(3)}) ${step * 10}%`;
  });
  // gl_FragCoord runs bottom-up, so a vertical band's palette starts at the bottom.
  const side = direction === "ttb" || direction === "btt" ? "top" : "right";

  return `linear-gradient(to ${side}, ${stops.join(", ")})`;
}

export { Sweep, sweepPalettes, stillBand };
export type { SweepDirection, SweepPalette, SweepPaletteName, SweepProps };
