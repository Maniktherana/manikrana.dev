export type BotCurve =
  | { type: "easing"; duration: number; ease: [number, number, number, number] }
  | {
      type: "spring";
      visualDuration?: number;
      bounce?: number;
      stiffness?: number;
      damping?: number;
      mass?: number;
    };

export type BotClip = { at: number; duration: number; transition: BotCurve };

function springParams(curve: Extract<BotCurve, { type: "spring" }>, duration: number) {
  if (curve.stiffness !== undefined || curve.damping !== undefined || curve.mass !== undefined) {
    return {
      stiffness: curve.stiffness ?? 200,
      damping: curve.damping ?? 25,
      mass: curve.mass ?? 1,
    };
  }
  const root = (2 * Math.PI) / (Math.max(0.05, curve.visualDuration ?? duration) * 1.2);
  const stiffness = root * root;
  const bounce = curve.bounce ?? 0.2;
  return {
    stiffness,
    damping: 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness),
    mass: 1,
  };
}

function springProgress(t: number, { stiffness, damping, mass }: ReturnType<typeof springParams>) {
  if (t <= 0) return 0;
  if (!Number.isFinite(t)) return 1;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 0.9999) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return (
      1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
    );
  }
  if (zeta < 1.0001) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const wd = w0 * Math.sqrt(zeta * zeta - 1);
  const r1 = -zeta * w0 + wd;
  const r2 = -zeta * w0 - wd;
  return 1 + (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r1 - r2);
}

function bezierProgress(p: number, [x1, y1, x2, y2]: [number, number, number, number]) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const axis = (t: number, a: number, b: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  let t = p;
  for (let i = 0; i < 24; i++) {
    t = (lo + hi) / 2;
    if (axis(t, x1, x2) < p) lo = t;
    else hi = t;
  }
  return axis(t, y1, y2);
}

export const curveLength = (curve: BotCurve) =>
  curve.type === "easing" ? curve.duration : (curve.visualDuration ?? 0.6);

export function sampleCurve(curve: BotCurve, seconds: number, duration: number) {
  if (curve.type === "easing")
    return bezierProgress(seconds / Math.max(duration, 1e-6), curve.ease);
  return springProgress(seconds, springParams(curve, duration));
}

export function sampleClip(clip: BotClip | undefined, seconds: number) {
  if (!clip) return 1;
  return sampleCurve(clip.transition, seconds - clip.at, clip.duration);
}
