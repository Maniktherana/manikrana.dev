export type DotMatrixHueShape = "solid" | "x" | "y" | "diagonal" | "radial";

export type DotMatrixHueMap = {
  shape: DotMatrixHueShape;
  base: number;
  spread: number;
  chroma: number;
};

const SHAPES: Record<DotMatrixHueShape, (u: number, v: number) => number> = {
  solid: () => 0,
  x: (u) => u,
  y: (_u, v) => v,
  diagonal: (u, v) => u * 0.82 + v * 0.18,
  radial: (u, v) => Math.hypot(u - 0.5, (v - 0.5) * 0.6) * 2,
};

export const dotMatrixHues = {
  iris: { shape: "diagonal", base: 288, spread: -69, chroma: 0.145 },
  sage: { shape: "solid", base: 142, spread: 0, chroma: 0.07 },
  diagonal: { shape: "diagonal", base: 98, spread: -76, chroma: 0.1 },
  spectrum: { shape: "x", base: 110, spread: -300, chroma: 0.09 },
} satisfies Record<string, DotMatrixHueMap>;

export type DotMatrixHueName = keyof typeof dotMatrixHues;

function hueAt(map: DotMatrixHueMap, x: number, y: number, cols: number, rows: number) {
  const u = cols > 1 ? x / (cols - 1) : 0;
  const v = rows > 1 ? y / (rows - 1) : 0;
  return map.base + SHAPES[map.shape](u, v) * map.spread;
}

const rgbCache = new Map<number, string>();

function oklch(L: number, C: number, H: number): string {
  const key = ((L * 255) | 0) * 1e6 + ((C * 500) | 0) * 1e3 + ((((H % 360) + 360) % 360) | 0);
  const hit = rgbCache.get(key);
  if (hit) return hit;

  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const lin = [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];

  const enc = lin.map((c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(c, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  });

  const css = `rgb(${enc[0]},${enc[1]},${enc[2]})`;
  if (rgbCache.size < 20000) rgbCache.set(key, css);
  return css;
}

export function dotColor(
  map: DotMatrixHueMap,
  x: number,
  y: number,
  cols: number,
  rows: number,
  intensity: number,
  dimFloor: number,
  litPeak: number,
  hueShift: number,
): string {
  const L = dimFloor + (litPeak - dimFloor) * intensity;
  const C = map.chroma * (0.5 + 0.5 * intensity);
  return oklch(L, C, hueAt(map, x, y, cols, rows) + hueShift);
}
