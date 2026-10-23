import { curveLength, sampleCurve } from "./curves";
import { clamp, inOutSine, lerp } from "./math";
import type { BotTuning } from "./tuning";

export type BotExpression = "neutral" | "angry" | "sad" | "happy";

type Tween = { from: number; to: number; t0: number };

// Happy first brings the eyes to the middle, then jumps; the gaze is held there until it has settled.
const JOY_LEAD = 0.3;
const JOY_END = JOY_LEAD + 2.4;

// [start, end, height]: three hops off the ground, each lower than the last.
const JOY_BOUNCES = [
  [0, 0.48, 1],
  [0.7, 1.08, 0.75],
  [1.3, 1.66, 0.5],
] as const;

// [seconds, strength]: each landing.
const JOY_IMPACTS = [
  [0.48, 1],
  [1.08, 0.8],
  [1.66, 0.55],
] as const;

// [seconds, tilt]: left on the jump, right held through the two bounces, then upright.
const JOY_TILT = [
  [0, 0],
  [0.18, -1],
  [0.48, -1],
  [0.88, 1],
  [1.62, 1],
  [2, 0],
] as const;

// Each impact kicks a damped spring: the body squashes at once, then rebounds into a smaller stretch
// (about a fifth as much) and settles.
const SQUASH_DAMPING = 0.45;
const SQUASH_FREQUENCY = 14;
const squashDecay = (SQUASH_DAMPING * SQUASH_FREQUENCY) / Math.sqrt(1 - SQUASH_DAMPING ** 2);
const squashPeak = Math.atan(SQUASH_FREQUENCY / squashDecay) / SQUASH_FREQUENCY;
const squashNorm = Math.exp(-squashDecay * squashPeak) * Math.sin(SQUASH_FREQUENCY * squashPeak);

function joySquash(t: number) {
  let squash = 0;
  for (const [at, strength] of JOY_IMPACTS) {
    const since = t - at;
    if (since <= 0) continue;
    squash -=
      (strength * Math.exp(-squashDecay * since) * Math.sin(SQUASH_FREQUENCY * since)) / squashNorm;
  }
  return squash;
}

function keyframe(frames: readonly (readonly [number, number])[], t: number) {
  if (t <= frames[0]![0]) return frames[0]![1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i]!;
    if (t > t1) continue;
    const [t0, v0] = frames[i - 1]!;
    return lerp(v0, v1, inOutSine((t - t0) / (t1 - t0)));
  }
  return frames[frames.length - 1]![1];
}

export class Mood {
  private expression: BotExpression = "neutral";
  private tilt = 0;
  private smile = 0;
  private curl: Tween = { from: 0, to: 0, t0: 0 };
  private joyT0 = -Infinity;

  set(expression: BotExpression, now: number, calm: boolean) {
    if ((expression === "happy") !== (this.expression === "happy")) {
      this.curl = { from: this.smile, to: expression === "happy" ? 1 : 0, t0: now };
      if (expression === "happy" && !calm) this.joyT0 = now;
    }
    this.expression = expression;
  }

  frame(now: number, dt: number, calm: boolean, tuning: Pick<BotTuning, "expressions" | "happy">) {
    const { expressions, happy } = tuning;
    const goal =
      this.expression === "angry"
        ? expressions.angry
        : this.expression === "sad"
          ? expressions.sad
          : 0;
    this.tilt += (goal - this.tilt) * (calm ? 1 : 1 - Math.exp(-dt * 10));
    this.smile = calm
      ? this.curl.to
      : lerp(
          this.curl.from,
          this.curl.to,
          sampleCurve(happy.curl, (now - this.curl.t0) / 1000, curveLength(happy.curl)),
        );

    const joyAt = (now - this.joyT0) / 1000;
    const jumping = joyAt >= 0 && joyAt < JOY_END;
    const joy = joyAt - JOY_LEAD;
    const jump = { hop: 0, tilt: 0, squash: 0, still: 0 };
    if (jumping) {
      // The head's own lean and sway step aside while it jumps, so both tilts come out even.
      jump.still = Math.min(
        inOutSine(clamp(joyAt / JOY_LEAD, 0, 1)),
        inOutSine(clamp((JOY_END - joyAt) / 0.4, 0, 1)),
      );
    }
    if (jumping && joy >= 0) {
      for (const [start, end, height] of JOY_BOUNCES) {
        if (joy < start || joy >= end) continue;
        const u = (joy - start) / (end - start);
        jump.hop = -happy.hop * height * 4 * u * (1 - u);
      }
      jump.squash = happy.squash * joySquash(joy);
      jump.tilt = happy.tilt * keyframe(JOY_TILT, joy);
    }
    return { tilt: this.tilt, smile: this.smile, jumping, jump };
  }
}
