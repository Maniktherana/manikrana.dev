import type { BotState } from "./choreography";
import type { BotCurve } from "./curves";

export type BotPose = {
  tilt: number;
  sway: number;
  swayPeriod: number;
  breath: number;
  breathPeriod: number;
  leanX: number;
  leanY: number;
  lid: number;
  eyeScale: number;
  roll: number;
};

export type BotTuning = {
  eyes: { width: number; height: number; spacing: number; squint: number };
  poses: Record<BotState, BotPose>;
  expressions: { angry: number; sad: number };
  happy: { hop: number; tilt: number; squash: number; curl: BotCurve };
  gaze: {
    frequency: number;
    dampingRatio: number;
    glance: BotCurve;
    glanceFrequency: number;
    glanceDamping: number;
  };
  spin: BotCurve;
  morph: BotCurve;
  blink: { duration: number; minGap: number; maxGap: number; double: number };
  thinking: { size: number; spacing: number; period: number; lift: number };
  blocked: { size: number; drop: number; ring: number; ringEvery: number; ringSpeed: number };
  working: {
    sweepEvery: number;
    count: number;
    delay: number;
    gap: number;
    life: number;
    orbit: number;
    tilt: number;
    width: number;
    trail: number;
  };
  done: {
    every: number;
    turns: number;
    flips: number;
    atoms: number;
    atomSpeed: number;
    rush: number;
    linger: number;
    hop: number;
    confetti: number;
  };
};

const pose = (
  tilt: number,
  sway: number,
  swayPeriod: number,
  breath: number,
  breathPeriod: number,
  leanX: number,
  leanY: number,
  lid: number,
  eyeScale: number,
  roll: number,
): BotPose => ({ tilt, sway, swayPeriod, breath, breathPeriod, leanX, leanY, lid, eyeScale, roll });

export const BOT_TUNING: BotTuning = {
  eyes: { width: 21, height: 53, spacing: 0.27, squint: 13 },
  poses: {
    idle: pose(0, 1.8, 9.2, 0.007, 3.1, 0, 0, 1, 1, 0),
    working: pose(0, 1.2, 6, 0.006, 2.6, 0, 0, 1, 1, 0),
    waiting: pose(-3, 1, 7.5, 0.004, 4.2, -1, 3, 0.26, 1.06, 10),
    blocked: pose(0, 0.7, 0.16, 0.004, 0.5, 0, 0, 1.1, 1.12, 0),
    thinking: pose(0, 1.2, 6, 0.006, 2.4, 0, 0, 1, 1, 0),
    done: pose(0, 3, 1.1, 0.02, 0.55, 0, 0, 1, 1, 0),
  },
  expressions: { angry: -36, sad: 24 },
  happy: {
    hop: 40,
    tilt: 14,
    squash: 0.15,
    curl: { type: "easing", duration: 0.34, ease: [0.25, 0.1, 0.25, 1] },
  },
  gaze: {
    frequency: 16,
    dampingRatio: 0.82,
    glance: { type: "easing", duration: 0.85, ease: [0.65, 0, 0.35, 1] },
    glanceFrequency: 9,
    glanceDamping: 1,
  },
  spin: { type: "spring", stiffness: 25, damping: 10, mass: 1 },
  morph: { type: "easing", duration: 0.3, ease: [0, 0, 0.2, 1] },
  blink: { duration: 0.3, minGap: 2.2, maxGap: 5.6, double: 0.14 },
  thinking: { size: 19, spacing: 54, period: 1.4, lift: 7.9 },
  blocked: { size: 11.4, drop: 50.8, ring: 2.2, ringEvery: 2.2, ringSpeed: 42 },
  working: {
    sweepEvery: 5.5,
    count: 2,
    delay: 0.2,
    gap: 0.22,
    life: 1.6,
    orbit: 118,
    tilt: 0.39,
    width: 9,
    trail: 2.4,
  },
  done: {
    every: 9,
    turns: 6,
    flips: 1,
    atoms: 3,
    atomSpeed: 2.2,
    rush: 12,
    linger: 0.7,
    hop: 1,
    confetti: 18,
  },
};
