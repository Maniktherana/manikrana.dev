import type { BotState } from "./choreography";
import { inOutCubic, outBack } from "./math";
import type { BotTuning } from "./tuning";

const lidCurve = (u: number) =>
  u < 0.42 ? 1 - 0.95 * inOutCubic(u / 0.42) : 0.05 + 0.95 * outBack((u - 0.42) / 0.58);

export class Blink {
  private at = 0;
  private t0 = -Infinity;
  private double = false;

  lid(now: number, state: BotState, blink: BotTuning["blink"], calm: boolean) {
    if (!calm && now >= this.at) {
      this.t0 = now;
      this.double = Math.random() < blink.double;
      const gap = blink.minGap + Math.random() * Math.max(blink.maxGap - blink.minGap, 0);
      this.at = now + gap * 1000 * (state === "waiting" ? 1.4 : 1);
    }
    const length = Math.max(blink.duration, 0.05) * 1000;
    const since = now - this.t0;
    if (since < length) return lidCurve(since / length);
    if (this.double && since > length * 1.23 && since < length * 2.23)
      return lidCurve((since - length * 1.23) / length);
    return 1;
  }
}
