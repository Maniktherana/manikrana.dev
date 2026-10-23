import type { BotEntrance } from "./choreography";
import { sampleClip } from "./curves";
import { clamp, fixed, inOutCubic, outCubic, seeded, TAU, UNIT } from "./math";
import { PALETTE, type Ribbon } from "./ribbons";
import type { BotTuning } from "./tuning";

export type Tumble = { spin: number; tip: number };

type Atom = { fade: number; turns: number; pace: number; cycle: number };

const NS = "http://www.w3.org/2000/svg";
const HOPS = [
  { height: 48 * UNIT, duration: 0.5 },
  { height: 28 * UNIT, duration: 0.382 },
  { height: 14 * UNIT, duration: 0.27 },
  { height: 6 * UNIT, duration: 0.177 },
];
const HOP_TOTAL = HOPS.reduce((total, hop) => total + hop.duration, 0);

// Done spins the face round the head many times one way while slowly tipping it over, then lets the confetti go.
export function doneFrame(
  elapsed: number,
  clips: BotEntrance,
  done: BotTuning["done"],
  flipDir: number,
) {
  const every = Math.max(done.every, 1);
  const cycle = Math.floor(elapsed / every);
  const local = elapsed - cycle * every;
  const tumble: Tumble = { spin: 0, tip: 0 };
  const atom: Atom = { fade: 0, turns: 0, pace: 0, cycle: 0 };
  let hop = 0;
  if (clips.spin) {
    const into = local - clips.spin.at;
    tumble.spin = TAU * Math.round(done.turns) * flipDir * sampleClip(clips.spin, local);
    tumble.tip = TAU * Math.round(done.flips) * inOutCubic(clamp(into / clips.spin.duration, 0, 1));
    // The atom ribbons rush ahead of their cruising speed, then wind down until they nearly stop, their
    // trails shrinking with them before they go.
    const life = clips.spin.duration + done.linger;
    if (into >= 0 && into < life) {
      const u = into / life;
      const a = done.rush;
      atom.fade = Math.min(
        outCubic(clamp(into / 0.25, 0, 1)),
        outCubic(clamp((1 - u) / 0.12, 0, 1)),
      );
      atom.pace = (1 - u) ** 2 * (1 + a * u);
      atom.turns =
        done.atomSpeed *
        life *
        (u + ((a - 2) * u ** 2) / 2 + ((1 - 2 * a) * u ** 3) / 3 + (a * u ** 4) / 4);
      atom.cycle = cycle;
    }
  }
  if (clips.hop) {
    const h = sampleClip(clips.hop, local);
    if (h > 0 && h < 1) {
      let at = h * HOP_TOTAL;
      for (const leg of HOPS) {
        if (at < leg.duration) {
          const u = at / leg.duration;
          hop = -leg.height * done.hop * 4 * u * (1 - u);
          break;
        }
        at -= leg.duration;
      }
    }
  }
  const burst = clips.burst
    ? { cycle, seconds: local - clips.burst.at, life: clips.burst.duration }
    : null;
  return { tumble, atom, hop, burst };
}

// The face spins fast about the head's vertical axis while that spin slowly tips over about the horizontal one.
export function tumbleHeading({ lon, lat }: { lon: number; lat: number }, { spin, tip }: Tumble) {
  if (Math.abs(spin) < 1e-4 && Math.abs(tip) < 1e-4) return lon;
  const turned = lon + spin;
  const x = Math.cos(lat) * Math.sin(turned);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(turned);
  return Math.atan2(x, y * Math.sin(tip) + z * Math.cos(tip));
}

// While Done tumbles, ribbons circle on crossed orbits like an atom.
export function atomRibbons(atom: Atom, { working, done }: BotTuning): Ribbon[] {
  if (atom.fade <= 0.004) return [];
  const count = Math.round(done.atoms);
  return Array.from({ length: count }, (_, j) => {
    const random = seeded(atom.cycle * 613 + j * 97 + 3);
    return {
      head: random() * TAU + TAU * atom.turns,
      length: working.trail * 1.15 * Math.min(atom.pace, 1.4) * atom.fade,
      radius: working.orbit + 4,
      tilt: 0.32,
      turn: (j / count) * Math.PI + 0.35,
      color: PALETTE[(j * 2 + atom.cycle) % PALETTE.length]!,
      opacity: atom.fade,
    };
  });
}

export class Confetti {
  private pieces: SVGPathElement[] = [];

  constructor(private readonly fx: SVGGElement) {}

  burst(at: { cycle: number; seconds: number; life: number }, confetti: number) {
    const { cycle, seconds, life } = at;
    const count = Math.round(confetti);
    while (this.pieces.length < count) {
      const piece = document.createElementNS(NS, "path");
      this.fx.appendChild(piece);
      this.pieces.push(piece);
    }
    const random = seeded(cycle * 9973 + 17);
    this.pieces.forEach((piece, i) => {
      const angle = (i / count) * TAU + (random() - 0.5) * 0.7;
      const radius = (96 + random() * 20) * UNIT;
      const speed = (170 + random() * 190) * UNIT;
      const star = random() < 0.18;
      const size = star ? 4 + random() * 3 : 3.5 + random() * 4.5;
      const max = (0.45 + random() * 0.4) * (life / 0.85);
      const color = star ? "#f4c34e" : PALETTE[Math.floor(random() * PALETTE.length)]!;
      const spinRate = (random() - 0.5) * 520;
      const rise = 20 + random() * 55;
      const t = seconds;
      if (i >= count || t < 0 || t >= max) {
        piece.setAttribute("opacity", "0");
        return;
      }
      const drag = 1.6;
      const gravity = 520;
      const fade = 1 - Math.exp(-drag * t);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - rise;
      const x = Math.cos(angle) * radius + (vx * fade) / drag;
      const y =
        Math.sin(angle) * radius + (gravity * t) / drag + ((vy - gravity / drag) * fade) / drag;
      const r = size / 2;
      piece.setAttribute(
        "d",
        star
          ? `M0 ${-r * 2}L${r * 0.6} ${-r * 0.6}L${r * 2} 0L${r * 0.6} ${r * 0.6}L0 ${r * 2}L${-r * 0.6} ${r * 0.6}L${-r * 2} 0L${-r * 0.6} ${-r * 0.6}Z`
          : `M${-r} ${-r * 0.6}H${r}V${r * 0.6}H${-r}Z`,
      );
      piece.setAttribute("fill", color);
      piece.setAttribute(
        "transform",
        `translate(${fixed(x, 1)} ${fixed(y, 1)}) rotate(${fixed(spinRate * t, 0)})`,
      );
      piece.setAttribute("opacity", fixed(1 - (t / max) ** 3, 3));
    });
  }

  hide() {
    for (const piece of this.pieces) piece.setAttribute("opacity", "0");
  }

  destroy() {
    for (const piece of this.pieces) piece.remove();
  }
}
