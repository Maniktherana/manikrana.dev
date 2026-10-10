// `light` returns how lit the dot at column x, row y is, from 0 to 1. `t` runs
// from 0 to 1 over each period, or keeps counting periods when `loop` is false.
export type DotMatrixPattern = {
  period: number;
  loop?: boolean;
  light: (x: number, y: number, t: number, cols: number, rows: number) => number;
};

const TAU = Math.PI * 2;

const hash = (a: number, b: number): number => {
  let h = (a * 374761393 + b * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number): number => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const wave = (v: number): number => (Math.sin(v) + 1) * 0.5;

export const dotMatrixPatterns = {
  flow: {
    period: 2.4,
    light: (x, y, t, cols, rows) =>
      wave((x / cols) * TAU * 1.4 + (y / rows) * TAU * 0.5 - t * TAU) ** 1.6,
  },

  comet: {
    period: 1.8,
    light: (x, y, t, cols, rows) => {
      const head = t * (cols + 17) - 4;
      const d = head - x;
      const tail = d >= 0 ? Math.exp(-d / 2.2) : Math.exp(d * 3);
      const core = Math.exp(-Math.abs(y - (rows - 1) / 2) / 1.4);
      return clamp01(tail * (0.45 + 0.55 * core));
    },
  },

  ripple: {
    period: 2.2,
    light: (x, y, t, cols, rows) => {
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      const d = Math.hypot(x - cx, (y - cy) * 1.5);
      const v = wave(d * 0.78 - t * TAU);
      return clamp01(v ** 2.2 * Math.exp(-d / 10));
    },
  },

  breathe: {
    period: 3.4,
    light: (x, y, t, cols, rows) => {
      const cx = (cols - 1) / 2;
      const cy = (rows - 1) / 2;
      const d = Math.hypot(x - cx, (y - cy) * 2.4);
      const dMax = Math.hypot(cx, cy * 2.4);
      const swell = smooth((Math.sin(t * TAU - Math.PI / 2) + 1) * 0.5);
      const r = -2.2 + swell * (dMax + 5.1);
      return clamp01(0.08 + 0.92 * smooth((r - d) / 1.9 + 0.5));
    },
  },

  spark: {
    period: 2.3,
    loop: false,
    light: (x, y, t) => {
      const f1 = 0.62 + hash(x + 11, y + 5) * 0.55;
      const f2 = f1 * 1.6180339887;
      const a = hash(x + 1, y + 1) * TAU;
      const b = hash(x + 7, y + 3) * TAU;
      const v = (Math.sin(t * TAU * f1 + a) + Math.sin(t * TAU * f2 + b)) * 0.5;
      return clamp01(((v + 1) * 0.5) ** 3.2);
    },
  },

  helix: {
    period: 2.6,
    light: (x, y, t, cols, rows) => {
      const cy = (rows - 1) / 2;
      let v = 0;
      for (let s = 0; s < 2; s++) {
        const ph = (x / Math.max(cols - 1, 1)) * TAU * 1.25 - t * TAU + s * Math.PI;
        const yy = cy + Math.sin(ph) * cy;
        const depth = (Math.cos(ph) + 1) * 0.5;
        const dz = (y - yy) / 0.85;
        v = Math.max(v, Math.exp(-dz * dz) * (0.1 + 0.9 * depth ** 1.2));
      }
      return clamp01(v);
    },
  },
} satisfies Record<string, DotMatrixPattern>;

export type DotMatrixPatternName = keyof typeof dotMatrixPatterns;

const WAVE_SHAPES = {
  sine: (p) => Math.sin(TAU * p),
  triangle: (p) => (2 / Math.PI) * Math.asin(Math.sin(TAU * p)),
  sawtooth: (p) => 2 * (((p % 1) + 1) % 1) - 1,
  square: (p) => Math.sign(Math.sin(TAU * p)) || 1,
  bounce: (p) => 2 * Math.abs(Math.sin(Math.PI * p)) - 1,
  elastic: (p) => {
    const q = ((p % 1) + 1) % 1;
    return Math.sin(8 * Math.PI * q) * Math.exp(-3 * q);
  },
} satisfies Record<string, (p: number) => number>;

const WAVE_AXES = {
  x: (x, _y, cols) => (cols > 1 ? x / (cols - 1) : 0),
  y: (_x, y, _cols, rows) => (rows > 1 ? y / (rows - 1) : 0),
  diagonal: (x, y, cols, rows) =>
    (cols > 1 ? x / (cols - 1) : 0) * 0.75 + (rows > 1 ? y / (rows - 1) : 0) * 0.25,
  radial: (x, y, cols, rows) => {
    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const m = Math.hypot(cx, cy * 2.2);
    return m < 1e-6 ? 0 : Math.hypot(x - cx, (y - cy) * 2.2) / m;
  },
  scatter: (x, y) => hash(x + 3, y + 9),
} satisfies Record<string, (x: number, y: number, cols: number, rows: number) => number>;

export type WaveShape = keyof typeof WAVE_SHAPES;
export type WaveAxis = keyof typeof WAVE_AXES;

// "waveform" draws the wave as a line across the grid, `thickness` dots thick.
// "brightness" pulses every dot, offset along `axis`, with `gamma` shaping the pulse.
export type WavePatternOptions = {
  shape?: WaveShape;
  drive?: "waveform" | "brightness";
  axis?: WaveAxis;
  cycles?: number;
  octaves?: number;
  persistence?: number;
  amplitude?: number;
  gamma?: number;
  thickness?: number;
  period?: number;
};

function waveAt(shape: (p: number) => number, p: number, octaves: number, persistence: number) {
  let sum = 0;
  let norm = 0;
  let amp = 1;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * shape(p * freq);
    norm += amp;
    amp *= persistence;
    freq *= 2;
  }
  return norm === 0 ? 0 : sum / norm;
}

export function makeWavePattern({
  shape = "sine",
  drive = "waveform",
  axis = "x",
  cycles = 1,
  octaves = 1,
  persistence = 0.5,
  amplitude = 0.9,
  gamma = 2.2,
  thickness = 0.7,
  period = 2,
}: WavePatternOptions = {}): DotMatrixPattern {
  const at = (p: number) => waveAt(WAVE_SHAPES[shape], p, octaves, persistence);

  if (drive === "waveform") {
    return {
      period,
      light: (x, y, t, cols, rows) => {
        const cy = (rows - 1) / 2;
        const u = cols > 1 ? x / (cols - 1) : 0;
        const yy = cy + at(u * cycles - t) * cy * amplitude;
        return clamp01(Math.exp(-(((y - yy) / thickness) ** 2)));
      },
    };
  }

  const offset = WAVE_AXES[axis];
  return {
    period,
    light: (x, y, t, cols, rows) => {
      const off = offset(x, y, cols, rows) * cycles;
      return clamp01((0.5 + 0.5 * at(t - off) * amplitude) ** gamma);
    },
  };
}
