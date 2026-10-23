import {
  useDialKit,
  useDialTimeline,
  type DialConfig,
  type TimelineConfig,
  type TransitionConfig,
} from "dialkit";
import {
  BOT_CHOREOGRAPHY,
  BOT_STATES,
  type BotChoreography,
  type BotEntrance,
  type BotState,
} from "./choreography";
import type { BotClip } from "./curves";
import { BOT_TUNING, type BotTuning } from "./tuning";

type Range = readonly [min: number, max: number, step: number];

const RANGES: Record<string, Record<string, Range>> = {
  eyes: {
    width: [6, 40, 0.5],
    height: [12, 80, 0.5],
    spacing: [0.1, 0.6, 0.01],
    squint: [0, 30, 0.5],
  },
  pose: {
    tilt: [-20, 20, 0.1],
    sway: [0, 10, 0.05],
    swayPeriod: [0.1, 12, 0.05],
    breath: [0, 0.05, 0.0005],
    breathPeriod: [0.1, 6, 0.05],
    leanX: [-20, 20, 0.1],
    leanY: [-20, 20, 0.1],
    lid: [0.05, 1.3, 0.01],
    eyeScale: [0.5, 1.5, 0.01],
    roll: [-30, 30, 0.5],
  },
  expressions: { angry: [-45, 45, 0.5], sad: [-45, 45, 0.5] },
  happy: { hop: [0, 80, 0.5], tilt: [0, 25, 0.5], squash: [0, 0.45, 0.01] },
  gaze: {
    frequency: [2, 40, 0.5],
    dampingRatio: [0.1, 1.5, 0.01],
    glanceFrequency: [2, 30, 0.5],
    glanceDamping: [0.2, 1.5, 0.01],
  },
  blink: {
    duration: [0.1, 1, 0.01],
    minGap: [0.5, 10, 0.1],
    maxGap: [0.5, 12, 0.1],
    double: [0, 1, 0.01],
  },
  thinking: {
    size: [6, 40, 0.5],
    spacing: [20, 100, 0.5],
    period: [0.4, 4, 0.05],
    lift: [0, 30, 0.1],
  },
  blocked: {
    size: [4, 30, 0.1],
    drop: [0, 90, 0.5],
    ring: [0, 12, 0.1],
    ringEvery: [0.5, 6, 0.05],
    ringSpeed: [5, 80, 0.5],
  },
  working: {
    sweepEvery: [1.2, 8, 0.05],
    count: [0, 6, 1],
    delay: [0, 2, 0.01],
    gap: [0, 1, 0.01],
    life: [0.4, 4, 0.05],
    orbit: [100, 160, 0.5],
    tilt: [0, 1.2, 0.01],
    width: [2, 20, 0.25],
    trail: [0.4, 5, 0.05],
  },
  done: {
    every: [3, 12, 0.05],
    turns: [1, 12, 1],
    flips: [0, 3, 1],
    atomSpeed: [0.2, 5, 0.05],
    rush: [0, 30, 0.5],
    linger: [0, 3, 0.05],
    hop: [0, 2, 0.01],
    confetti: [0, 40, 1],
  },
};

const isCurve = (value: unknown): value is TransitionConfig =>
  typeof value === "object" && value !== null && "type" in value;

function controls(values: object, ranges: Record<string, Range> = {}): DialConfig {
  const config: DialConfig = { _collapsed: true };
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "number") {
      const [min, max, step] = ranges[key] ?? [0, Math.max(1, value * 2), 0.01];
      config[key] = [value, min, max, step];
    } else if (isCurve(value)) config[key] = value;
  }
  return config;
}

const timeline = (entrance: BotEntrance): TimelineConfig =>
  Object.fromEntries(
    Object.entries(entrance).map(([name, clip]) => [
      name,
      {
        at: clip.at,
        duration: clip.duration,
        from: { progress: 0 },
        to: { progress: 1 },
        transition: clip.transition,
      },
    ]),
  );

// DialKit re-registers a panel or timeline whenever its config or options change, so these stay module constants.
const PANEL = {
  eyes: controls(BOT_TUNING.eyes, RANGES.eyes),
  poses: {
    _collapsed: true,
    ...Object.fromEntries(
      BOT_STATES.map((state) => [state, controls(BOT_TUNING.poses[state], RANGES.pose)]),
    ),
  },
  expressions: controls(BOT_TUNING.expressions, RANGES.expressions),
  happy: controls(BOT_TUNING.happy, RANGES.happy),
  gaze: controls(BOT_TUNING.gaze, RANGES.gaze),
  spin: BOT_TUNING.spin,
  morph: BOT_TUNING.morph,
  blink: controls(BOT_TUNING.blink, RANGES.blink),
  thinking: controls(BOT_TUNING.thinking, RANGES.thinking),
  blocked: controls(BOT_TUNING.blocked, RANGES.blocked),
  working: controls(BOT_TUNING.working, RANGES.working),
  done: controls(BOT_TUNING.done, RANGES.done),
} satisfies DialConfig;

const TIMELINES = Object.fromEntries(
  BOT_STATES.map((state) => [state, timeline(BOT_CHOREOGRAPHY[state])]),
) as Record<BotState, TimelineConfig>;

// Saved dial values outlive the defaults they were tuned from, so the id carries a hash of the defaults.
const hash = (value: unknown) => {
  let h = 5381;
  for (const char of JSON.stringify(value)) h = (h * 33) ^ char.charCodeAt(0);
  return (h >>> 0).toString(36);
};

const PANEL_OPTIONS = { id: `bot-avatar-${hash(PANEL)}`, persist: import.meta.env.DEV };

const TIMELINE_OPTIONS = Object.fromEntries(
  BOT_STATES.map((state) => [
    state,
    {
      id: `bot-avatar-${state}-${hash(TIMELINES[state])}`,
      persist: import.meta.env.DEV,
      autoplay: false,
    },
  ]),
) as Record<BotState, { id: string; persist: boolean; autoplay: boolean }>;

type Playback = { time: number; playing: boolean; duration: number; replay: () => void };

function tuned(values: Playback, fallback: BotEntrance): BotEntrance {
  const clips = values as unknown as Record<string, Partial<BotClip> | undefined>;
  return Object.fromEntries(
    Object.entries(fallback).map(([name, clip]) => [
      name,
      {
        at: clips[name]?.at ?? clip.at,
        duration: clips[name]?.duration ?? clip.duration,
        transition: clips[name]?.transition ?? clip.transition,
      },
    ]),
  );
}

export function useBotDials(state: BotState) {
  const tuning = useDialKit("Bot avatar", PANEL, PANEL_OPTIONS) as unknown as BotTuning;
  const timelines: Record<BotState, Playback> = {
    idle: useDialTimeline("Bot idle", TIMELINES.idle, TIMELINE_OPTIONS.idle),
    working: useDialTimeline("Bot working", TIMELINES.working, TIMELINE_OPTIONS.working),
    waiting: useDialTimeline("Bot waiting", TIMELINES.waiting, TIMELINE_OPTIONS.waiting),
    blocked: useDialTimeline("Bot blocked", TIMELINES.blocked, TIMELINE_OPTIONS.blocked),
    thinking: useDialTimeline("Bot thinking", TIMELINES.thinking, TIMELINE_OPTIONS.thinking),
    done: useDialTimeline("Bot done", TIMELINES.done, TIMELINE_OPTIONS.done),
  };
  const choreography = Object.fromEntries(
    BOT_STATES.map((name) => [name, tuned(timelines[name], BOT_CHOREOGRAPHY[name])]),
  ) as BotChoreography;
  const active = timelines[state];
  // A finished or untouched timeline hands the entrance back to the avatar's own clock.
  const scrubbing = active.playing || (active.time > 0 && active.time < active.duration);

  return {
    tuning,
    choreography,
    playhead: import.meta.env.DEV && scrubbing ? active.time : undefined,
    replay: (next: BotState) => {
      if (import.meta.env.DEV) timelines[next].replay();
    },
  };
}
