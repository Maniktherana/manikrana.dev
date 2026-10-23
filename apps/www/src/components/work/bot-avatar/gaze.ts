import type { BotState } from "./choreography";
import { curveLength, sampleCurve, type BotCurve } from "./curves";
import { lerp } from "./math";
import type { BotTuning } from "./tuning";

type Spring = { x: number; v: number; t: number };
type Tween = { from: number; to: number; t0: number };

export type BotPointer = { dx: number; dy: number };

export class Gaze {
  pointer: BotPointer | null = null;
  private lon: Spring = { x: 0.45, v: 0, t: 0.45 };
  private lat: Spring = { x: 0.35, v: 0, t: 0.35 };
  private step = 0;
  private timer = 0;
  private glance: { lon: Tween; lat: Tween; length: number } | null = null;

  get look() {
    return { lon: this.lon.x, lat: this.lat.x };
  }

  // A glance eases the target from one spot to the next and a soft spring chases it, so the eyes
  // start gently and slow into place without overshooting. Following the pointer uses a quicker spring.
  frame(
    now: number,
    dt: number,
    input: {
      state: BotState;
      gaze: BotTuning["gaze"];
      calm: boolean;
      jumping: boolean;
      sweeping: boolean;
    },
  ) {
    const { state, gaze, calm, jumping, sweeping } = input;
    this.timer -= dt;
    let frequency = gaze.glanceFrequency;
    let damping = gaze.glanceDamping;
    if (jumping && !calm) {
      this.glance = null;
      this.lon.t = 0;
      this.lat.t = 0;
      frequency = gaze.frequency;
      damping = 1;
    } else if (this.pointer) {
      this.glance = null;
      // The head turns toward the pointer by its distance, so the face travels round a circle.
      const { dx, dy } = this.pointer;
      const reach = Math.hypot(dx, dy);
      const angle = Math.min(Math.atan2(reach, 170), 0.65) / Math.max(reach, 1e-6);
      this.lon.t = dx * angle;
      this.lat.t = -dy * angle;
      frequency = gaze.frequency;
      damping = gaze.dampingRatio;
    } else if (calm) {
      this.glance = null;
      this.lon.t = 0.45;
      this.lat.t = 0.35;
    } else {
      if (this.timer <= 0 && !sweeping) this.pick(state, now, gaze.glance);
      if (this.glance) {
        const { length } = this.glance;
        for (const [spring, tween] of [
          [this.lon, this.glance.lon],
          [this.lat, this.glance.lat],
        ] as const) {
          spring.t = lerp(
            tween.from,
            tween.to,
            sampleCurve(gaze.glance, (now - tween.t0) / 1000, length),
          );
        }
      }
    }
    if (calm) {
      this.lon.x = this.lon.t;
      this.lat.x = this.lat.t;
    }
    this.step = Math.min(this.step + dt, 0.1);
    while (this.step >= 1 / 120) {
      for (const s of [this.lon, this.lat]) {
        s.v += (-2 * damping * frequency * s.v - frequency * frequency * (s.x - s.t)) / 120;
        s.x += s.v / 120;
      }
      this.step -= 1 / 120;
    }
    return this.look;
  }

  // Bots look around, never straight out of the screen; up and to the right is where they rest.
  private pick(state: BotState, now: number, glance: BotCurve) {
    const r = Math.random;
    const away = (min: number, max: number) => (min + r() * (max - min)) * (r() < 0.5 ? -1 : 1);
    let lon = 0.45;
    let lat = 0.35;
    if (state === "idle") {
      this.timer = 3.5 + r() * 3.5;
      const rest = r() < 0.5;
      lon = rest ? 0.38 + r() * 0.2 : away(0.3, 0.65);
      lat = rest ? 0.3 + r() * 0.15 : -0.2 + r() * 0.65;
    } else if (state === "working") {
      this.timer = 2 + r() * 2;
      lon = away(0.25, 0.6);
      lat = -0.3 + r() * 0.55;
    } else if (state === "waiting") {
      this.timer = 4 + r() * 4;
      lon = away(0.25, 0.55);
      lat = -0.28 + r() * 0.2;
    } else if (state === "thinking") {
      this.timer = 2.5 + r() * 1.5;
      lon = away(0.15, 0.4);
      lat = 0.38;
    } else if (state === "done") {
      this.timer = 2.5 + r() * 2;
      lon = away(0.2, 0.5);
      lat = 0.3 + r() * 0.2;
    } else this.timer = 1;
    const pace = state === "working" ? 0.6 : state === "waiting" ? 1.4 : 1;
    this.glance = {
      lon: { from: this.lon.x, to: lon, t0: now },
      lat: { from: this.lat.x, to: lat, t0: now },
      length: curveLength(glance) * pace,
    };
  }
}
