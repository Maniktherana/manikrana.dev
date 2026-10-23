import { sampleCurve, type BotClip } from "./curves";
import { clamp, outCubic, seeded, TAU } from "./math";
import { PALETTE, type Ribbon } from "./ribbons";
import type { BotTuning } from "./tuning";

// Every sweep turns the head once more; glances wait until the turn has settled.
export function sweepAt(elapsed: number, sweep: BotClip | undefined, every: number) {
  if (!sweep) return { turn: 0, sweeping: false };
  const local = elapsed - sweep.at;
  const period = Math.max(every, sweep.duration);
  const cycle = ((local % period) + period) % period;
  return {
    turn: local >= 0 ? TAU * sampleCurve(sweep.transition, cycle, sweep.duration) : 0,
    sweeping: local > -0.4 && (cycle < sweep.duration * 1.6 || cycle > period - 0.4),
  };
}

// Each sweep throws a few comets around the head: a short trail grows in, makes one orbit, and its tail catches up.
export function comets(
  worked: number,
  workEnd: number,
  sweep: BotClip | undefined,
  working: BotTuning["working"],
  opacity: number,
): Ribbon[] {
  if (!sweep) return [];
  const every = Math.max(working.sweepEvery, sweep.duration);
  const count = Math.round(working.count);
  const first = sweep.at + working.delay;
  const latest = Math.floor((worked - first) / every);
  const ribbons: Ribbon[] = [];
  for (let cycle = Math.max(0, latest - 1); cycle <= latest; cycle++) {
    for (let k = 0; k < count; k++) {
      const begin = first + cycle * every + k * working.gap;
      const local = worked - begin;
      if (local < 0 || local > working.life || begin >= workEnd) continue;
      const random = seeded(cycle * 977 + k * 131 + 7);
      const color = PALETTE[Math.floor(random() * PALETTE.length)]!;
      const tilt = working.tilt * (0.75 + random() * 0.5) * (random() < 0.5 ? -1 : 1);
      const turn = (random() - 0.5) * 1.1;
      const radius = working.orbit + (random() - 0.5) * 20;
      const head = random() * TAU + TAU * (local / working.life);
      const length =
        working.trail *
        Math.min(
          outCubic(clamp(local / 0.35, 0, 1)),
          outCubic(clamp((working.life - local) / 0.45, 0, 1)),
        );
      ribbons.push({ head, length, radius, tilt, turn, color, opacity });
    }
  }
  return ribbons;
}
