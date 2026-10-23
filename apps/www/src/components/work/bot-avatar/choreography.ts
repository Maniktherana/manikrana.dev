import type { BotClip, BotCurve } from "./curves";

export type BotState = "idle" | "working" | "waiting" | "blocked" | "thinking" | "done";

export const BOT_STATES: readonly BotState[] = [
  "idle",
  "working",
  "waiting",
  "blocked",
  "thinking",
  "done",
];

export type BotClipName =
  | "pose"
  | "lids"
  | "token"
  | "ribbons"
  | "face"
  | "sweep"
  | "spin"
  | "hop"
  | "burst";

export type BotEntrance = Partial<Record<BotClipName, BotClip>>;

export type BotChoreography = Record<BotState, BotEntrance>;

type Bezier = [number, number, number, number];

const OUT_CUBIC: Bezier = [0.33, 1, 0.68, 1];
const OUT_QUINT: Bezier = [0.22, 1, 0.36, 1];
const BACK_OUT: Bezier = [0.175, 0.885, 0.32, 1.1];
const LINEAR: Bezier = [0, 0, 1, 1];

const clip = (at: number, duration: number, curve: Bezier | BotCurve): BotClip => ({
  at,
  duration,
  transition: Array.isArray(curve) ? { type: "easing", duration, ease: curve } : curve,
});

const settle = (tokenAt = 0): BotEntrance => ({
  pose: clip(0, 0.75, OUT_CUBIC),
  lids: clip(0, 0.45, OUT_CUBIC),
  token: clip(tokenAt, 0.52, BACK_OUT),
  ribbons: clip(0, 0.52, BACK_OUT),
  face: clip(0, 0.52, OUT_QUINT),
});

export const BOT_CHOREOGRAPHY: BotChoreography = {
  idle: settle(),
  working: {
    ...settle(),
    sweep: clip(1.4, 1.1, { type: "spring", visualDuration: 1.1, bounce: 0 }),
  },
  waiting: settle(),
  blocked: settle(0.14),
  thinking: settle(0.14),
  done: {
    ...settle(),
    spin: clip(0, 3.6, [0.3, 0.45, 0.25, 1]),
    hop: clip(3.9, 1.33, LINEAR),
    burst: clip(3.9, 0.85, LINEAR),
  },
};
