type Vec3 = [number, number, number];

export type VoiceEdgePalette = {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  d: Vec3;
};

export const voiceEdgePalettes = {
  spectrum: {
    a: [0.46, 0.88, 0.33],
    b: [0.6, 0.58, 0.74],
    c: [0.5, 0.5, 0.5],
    d: [0.54, 0.22, 0.84],
  },
  dusk: {
    a: [0.92, 0.36, 0.56],
    b: [0.1, 0.14, 0.37],
    c: [0.5, 0.5, 0.5],
    d: [0.84, 0.11, 0.5],
  },
  reef: {
    a: [0.58, 0.64, 0.52],
    b: [0.64, 0.3, 0.5],
    c: [0.5, 0.5, 0.5],
    d: [0.37, 0.66, 0.89],
  },
  zest: {
    a: [0.55, 0.61, 0.61],
    b: [0.54, 0.41, 0.63],
    c: [0.5, 0.5, 0.5],
    d: [0.66, 0.92, 0.23],
  },
  glacier: {
    a: [0.13, 0.61, 1],
    b: [0.15, 0.14, 0],
    c: [0.5, 0.5, 0.5],
    d: [0.29, 0.98, 0.74],
  },
  flare: {
    a: [0.83, 0.61, 0.6],
    b: [0.2, 0.41, 0.62],
    c: [0.5, 0.5, 0.5],
    d: [0.73, 0.05, 0.36],
  },
  mono: {
    a: [0.62, 0.62, 0.62],
    b: [0.24, 0.24, 0.24],
    c: [0.5, 0.5, 0.5],
    d: [0, 0, 0],
  },
} as const satisfies Record<string, VoiceEdgePalette>;

export type VoiceEdgePaletteName = keyof typeof voiceEdgePalettes;
