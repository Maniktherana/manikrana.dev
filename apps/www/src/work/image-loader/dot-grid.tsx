import { useEffect, useRef, type ComponentProps, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import {
  dotGridFragment,
  dotGridPatterns,
  dotGridVertex,
  dotGridWavePatterns,
  type DotGridPattern,
  type DotGridWavePattern,
} from "./dot-grid-shader";

export type DotGridImageFit = "cover" | "contain" | "stretch" | "center";

export type DotGridOptions = {
  pattern?: DotGridPattern;
  // Dot diameter, in pixels.
  cell?: number;
  // Space between dots, as a multiple of the dot size.
  gap?: number;
  // 0 is square, 1 is round.
  radius?: number;
  // Brightness of an unlit dot.
  floor?: number;
  dotAlpha?: number;
  // How much quiet dots shrink.
  scaleDots?: number;
  // Cycles per second of the wave every pattern shares.
  waveFrequency?: number;
  wavePhase?: number;
  waveThickness?: number;
  // How far, in pixels, the wave's crest and trough push the dots.
  wavePeakTop?: number;
  wavePeakBottom?: number;
  waveDotLight?: number;
  waveDotDark?: number;
  waveBackgroundLight?: number;
  waveBackgroundDark?: number;
  // Direction of the band and sweep waves, in radians.
  waveAngle?: number;
  // Where the wave starts, from 0 to 1 across and down.
  waveX?: number;
  waveY?: number;
  wavePattern?: DotGridWavePattern;
  speed?: number;
  paused?: boolean;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImageBlur?: number;
  backgroundImageFit?: DotGridImageFit;
  backgroundImageOpacity?: number;
  dotColor?: string;
  waveColor?: string;
};

export type DotGridProps = Omit<ComponentProps<"div">, "children"> & DotGridOptions;

type Uniforms = Record<string, number | readonly [number, number] | string>;

// The frame a paused or reduced-motion grid holds on.
const FROZEN_TIME = 1.4;

const imageFit: Record<DotGridImageFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  stretch: "object-fill",
  center: "object-scale-down",
};

const colors = new Map<string, readonly [number, number, number]>();
let colorProbe: CanvasRenderingContext2D | null = null;

// Reads any CSS color the way the browser parses it. One it can't parse stays
// white, the fill set before it.
function toRgb(color: string) {
  const cached = colors.get(color);
  if (cached) return cached;
  colorProbe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!colorProbe) return [1, 1, 1] as const;
  colorProbe.clearRect(0, 0, 1, 1);
  colorProbe.fillStyle = "#ffffff";
  colorProbe.fillStyle = color;
  colorProbe.fillRect(0, 0, 1, 1);
  const [red = 255, green = 255, blue = 255] = colorProbe.getImageData(0, 0, 1, 1).data;
  const rgb = [red / 255, green / 255, blue / 255] as const;
  colors.set(color, rgb);
  return rgb;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: false, depth: false, stencil: false });
  if (!gl) return null;
  const release = () => gl.getExtension("WEBGL_lose_context")?.loseContext();
  const program = gl.createProgram();
  const vertex = compile(gl, gl.VERTEX_SHADER, dotGridVertex);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, dotGridFragment);
  if (!program || !vertex || !fragment) {
    release();
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    release();
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const locations = new Map<string, WebGLUniformLocation | null>();
  const locate = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name) ?? null;
  };

  return {
    draw(uniforms: Uniforms, time: number) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height || gl.isContextLost()) return;
      // Fills the buffer at the size the canvas shows at, so the dots stay sharp
      // inside a scaled parent. Rounding the scale up to quarters keeps a scale
      // animation from resizing the buffer every frame.
      const shown = canvas.getBoundingClientRect().width / width;
      const scale = Math.max(0.25, Math.ceil(shown * 4 - 0.01) / 4);
      const ratio = Math.min(window.devicePixelRatio || 1, 2) * scale;
      const bufferWidth = Math.round(width * ratio);
      const bufferHeight = Math.round(height * ratio);
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      }
      gl.viewport(0, 0, bufferWidth, bufferHeight);
      gl.uniform2f(locate("uRes"), width, height);
      gl.uniform2f(locate("uPixelRatio"), bufferWidth / width, bufferHeight / height);
      gl.uniform1f(locate("uTime"), time);
      for (const [name, value] of Object.entries(uniforms)) {
        if (typeof value === "number") gl.uniform1f(locate(name), value);
        else if (typeof value === "string") gl.uniform3fv(locate(name), toRgb(value));
        else gl.uniform2fv(locate(name), value);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    release,
  };
}

export function DotGrid({
  pattern = "spark",
  cell = 1,
  gap = 14,
  radius = 1,
  floor = 0,
  dotAlpha = 0.9,
  scaleDots = 0.5,
  waveFrequency = 0.4,
  wavePhase = 0,
  waveThickness = 1,
  wavePeakTop = 2.5,
  wavePeakBottom = 1,
  waveDotLight = 0.2,
  waveDotDark = 0,
  waveBackgroundLight = 0,
  waveBackgroundDark = 0,
  waveAngle = 0,
  waveX = 0.5,
  waveY = 0.5,
  wavePattern = "ripple",
  speed = 1,
  paused = false,
  backgroundColor = "#101012",
  backgroundImage,
  backgroundImageBlur = 0,
  backgroundImageFit = "cover",
  backgroundImageOpacity = 1,
  dotColor = "#ffffff",
  waveColor = "#ffffff",
  className,
  style,
  ...props
}: DotGridProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const frame = {
    frozen: paused || Boolean(reducedMotion),
    uniforms: {
      uPattern: dotGridPatterns[pattern],
      uPatternSpeed: speed,
      uCell: cell,
      uGap: gap,
      uRadius: radius,
      uFloor: floor,
      uDotAlpha: dotAlpha,
      uScaleDots: scaleDots,
      uWaveFrequency: waveFrequency,
      uWavePhase: wavePhase,
      uWaveThickness: waveThickness,
      uWavePeakTop: wavePeakTop,
      uWavePeakBottom: wavePeakBottom,
      uWaveDotLight: waveDotLight,
      uWaveDotDark: waveDotDark,
      uWaveBackgroundLight: waveBackgroundLight,
      uWaveBackgroundDark: waveBackgroundDark,
      uWaveAngle: waveAngle,
      uWavePosition: [waveX, waveY],
      uWavePattern: dotGridWavePatterns[wavePattern],
      uDotColor: dotColor,
      uWaveColor: waveColor,
    } satisfies Uniforms,
  };
  const latest = useRef(frame);
  const wake = useRef(() => {});

  useEffect(() => {
    latest.current = frame;
    wake.current();
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // A new canvas each time: one whose context was released can't make another,
    // and Strict Mode runs this twice.
    const canvas = document.createElement("canvas");
    canvas.className = "block size-full";
    host.append(canvas);
    const renderer = createRenderer(canvas);
    if (!renderer) {
      canvas.remove();
      return;
    }
    let request = 0;
    let last = 0;
    let elapsed = 0;
    let onScreen = false;

    // Time runs only while the grid is drawn, so it picks up where it left off.
    const tick = (now: number) => {
      request = 0;
      const { frozen, uniforms } = latest.current;
      if (last) elapsed += Math.min(now - last, 100) / 1000;
      last = now;
      renderer.draw(uniforms, frozen ? FROZEN_TIME : elapsed);
      if (frozen || !onScreen || document.hidden) last = 0;
      else request = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (!request && onScreen && !document.hidden) request = requestAnimationFrame(tick);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      resume();
    });
    const size = new ResizeObserver(resume);
    visibility.observe(canvas);
    size.observe(canvas);
    document.addEventListener("visibilitychange", resume);
    wake.current = resume;
    return () => {
      cancelAnimationFrame(request);
      visibility.disconnect();
      size.disconnect();
      document.removeEventListener("visibilitychange", resume);
      wake.current = () => {};
      renderer.release();
      canvas.remove();
    };
  }, []);

  return (
    <div
      data-slot="dot-grid"
      style={{ ...style, "--dot-grid-background": backgroundColor } as CSSProperties}
      className={cn("relative overflow-hidden bg-(--dot-grid-background)", className)}
      {...props}
    >
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          style={
            {
              "--dot-grid-blur": `${backgroundImageBlur}px`,
              "--dot-grid-opacity": backgroundImageOpacity,
            } as CSSProperties
          }
          className={cn(
            "absolute inset-0 size-full opacity-(--dot-grid-opacity) blur-(--dot-grid-blur)",
            imageFit[backgroundImageFit],
          )}
        />
      )}
      <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
    </div>
  );
}
