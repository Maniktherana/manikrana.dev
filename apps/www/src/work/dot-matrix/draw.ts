import { dotColor, type DotMatrixHueMap } from "./hues";
import type { DotMatrixPattern } from "./patterns";

export type DrawOptions = {
  pattern: DotMatrixPattern;
  hueMap: DotMatrixHueMap;
  time: number;
  cell: number;
  cols: number;
  rows: number;
  gap: number;
  dpr: number;
  bevel: boolean;
  bevelStrength: number;
  radiusRatio: number;
  dimFloor: number;
  litPeak: number;
  shrinkWhenDim: number;
  hueDrift: number;
};

const TAU = Math.PI * 2;

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

const bevelCache = new Map<number, HTMLCanvasElement>();

function getBevel(size: number): HTMLCanvasElement {
  const hit = bevelCache.get(size);
  if (hit) return hit;
  const s = Math.max(4, Math.ceil(size * 4));
  const cv = document.createElement("canvas");
  cv.width = s;
  cv.height = s;
  const g = cv.getContext("2d");
  if (!g) return cv;

  const grad = g.createLinearGradient(0, 0, s, s);
  grad.addColorStop(0, "rgba(255,255,255,0.15)");
  grad.addColorStop(0.22, "rgba(255,255,255,0.085)");
  grad.addColorStop(0.42, "rgba(255,255,255,0.022)");
  grad.addColorStop(0.5, "rgba(255,255,255,0)");
  grad.addColorStop(0.58, "rgba(0,0,0,0.026)");
  grad.addColorStop(0.78, "rgba(0,0,0,0.1)");
  grad.addColorStop(1, "rgba(0,0,0,0.19)");
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);

  if (bevelCache.size > 64) bevelCache.clear();
  bevelCache.set(size, cv);
  return cv;
}

export function drawMatrix(ctx: CanvasRenderingContext2D, options: DrawOptions) {
  const {
    pattern,
    hueMap,
    time,
    cell,
    cols,
    rows,
    gap,
    dpr,
    bevel,
    bevelStrength,
    radiusRatio,
    dimFloor,
    litPeak,
    shrinkWhenDim,
    hueDrift,
  } = options;

  const w = cols * cell + (cols - 1) * gap;
  const h = rows * cell + (rows - 1) * gap;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const t =
    pattern.loop === false ? time / pattern.period : (((time / pattern.period) % 1) + 1) % 1;
  const sprite = bevel ? getBevel(cell) : null;
  const drift = hueDrift === 0 ? 0 : hueDrift * Math.sin((TAU * time) / 6);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = clamp01(pattern.light(x, y, t, cols, rows));
      const size = cell * (1 - shrinkWhenDim * (1 - v));
      const inset = (cell - size) / 2;
      const px = x * (cell + gap) + inset;
      const py = y * (cell + gap) + inset;

      ctx.beginPath();
      ctx.roundRect(px, py, size, size, Math.min(size * radiusRatio, size / 2));
      ctx.fillStyle = dotColor(hueMap, x, y, cols, rows, v, dimFloor, litPeak, drift);
      ctx.fill();

      if (sprite) {
        ctx.save();
        ctx.clip();
        ctx.globalAlpha = (0.42 + 0.28 * v) * bevelStrength;
        ctx.drawImage(sprite, px, py, size, size);
        ctx.restore();
      }
    }
  }
}

const subscribers = new Set<(seconds: number) => void>();
let frame: number | null = null;

function tick(now: number) {
  for (const subscriber of subscribers) subscriber(now / 1000);
  frame = requestAnimationFrame(tick);
}

export function subscribe(subscriber: (seconds: number) => void): () => void {
  subscribers.add(subscriber);
  frame ??= requestAnimationFrame(tick);
  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };
}
