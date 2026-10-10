export type OrbPalette = "opal" | "ember" | "tide";

export const PALETTES = {
  opal: [
    [0.02, 0.06, 0.2],
    [0.08, 0.4, 1.0],
    [0.68, 0.9, 1.0],
  ],
  ember: [
    [0.74, 0.13, 0.27],
    [1, 0.42, 0.22],
    [1, 0.86, 0.49],
  ],
  tide: [
    [0.04, 0.38, 0.63],
    [0.1, 0.7, 0.65],
    [0.65, 0.98, 0.8],
  ],
} as const;
