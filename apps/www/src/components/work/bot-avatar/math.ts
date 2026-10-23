export const TAU = Math.PI * 2;
export const UNIT = 100 / 114.2705;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const outCubic = (x: number) => 1 - (1 - x) ** 3;
export const outBack = (x: number) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
export const inOutSine = (x: number) => (1 - Math.cos(Math.PI * x)) / 2;
export const inOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const turns = (angle: number) => ((angle % TAU) + TAU) % TAU;
export const fixed = (value: number, digits = 2) => value.toFixed(digits);

export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
