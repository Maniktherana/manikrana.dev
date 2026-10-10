import { AUDIO_BIN_COUNT, clamp } from "./shader";

export type VoiceEdgeResponseCurvePoint = {
  level: number;
  scale: number;
};

type VoiceEdgeResponsePointCurve = readonly VoiceEdgeResponseCurvePoint[];

type VoiceEdgeResponseEasing = {
  type: "easing";
  duration?: number;
  ease: readonly [number, number, number, number];
};

type VoiceEdgeResponseSpring = {
  type: "spring";
};

export type VoiceEdgeResponseCurve =
  | number
  | VoiceEdgeResponsePointCurve
  | VoiceEdgeResponseEasing
  | VoiceEdgeResponseSpring;

const MIC_PEAK_DECAY_PER_FRAME = 0.995;
export const MIC_MIN_PEAK = 0.25;
const MIC_MIN_ACTIVE_MAGNITUDE = 0.05;
export const defaultAudioResponseCurve = {
  type: "easing",
  duration: 0.3,
  ease: [0.55, 0.04, 0.16, 0.85],
} satisfies VoiceEdgeResponseEasing;
const fallbackAudioResponsePointCurve = [
  { level: 0, scale: 0 },
  { level: 0.12, scale: 0.16 },
  { level: 0.32, scale: 0.72 },
  { level: 0.66, scale: 1.16 },
  { level: 1, scale: 1.48 },
] satisfies VoiceEdgeResponsePointCurve;

export function buildStaticAudioBins(
  dataArray: Uint8Array,
  sensitivity: number,
  noiseFloor: number,
  responseCurve: VoiceEdgeResponseCurve,
  previousPeak: number,
) {
  const bins = new Float32Array(AUDIO_BIN_COUNT);
  const startFreq = Math.floor(dataArray.length * 0.05);
  const endFreq = Math.max(startFreq + 1, Math.floor(dataArray.length * 0.4));
  const relevantLength = endFreq - startFreq;
  const floor = clamp(noiseFloor, 0, 0.95);
  const range = Math.max(0.05, 1 - floor);
  let frameMax = 0;

  for (let index = startFreq; index < endFreq; index += 1) {
    frameMax = Math.max(frameMax, dataArray[index] ?? 0);
  }

  const peak = Math.max(frameMax / 255, previousPeak * MIC_PEAK_DECAY_PER_FRAME, MIC_MIN_PEAK);
  const gain = 1 / peak;

  for (let i = 0; i < AUDIO_BIN_COUNT; i += 1) {
    const dataIndex =
      startFreq +
      Math.min(
        relevantLength - 1,
        Math.floor((i / Math.max(1, AUDIO_BIN_COUNT - 1)) * relevantLength),
      );
    const rawValue = Math.max(MIC_MIN_ACTIVE_MAGNITUDE, ((dataArray[dataIndex] ?? 0) / 255) * gain);
    const gatedValue = Math.max(0, rawValue - floor) / range;
    const shapedValue = shapeAudioResponse(gatedValue, responseCurve);

    bins[i] = clamp(shapedValue * sensitivity, 0, 1);
  }

  return {
    bins: smoothAudioBins(bins),
    peak,
  };
}

function shapeAudioResponse(level: number, responseCurve: VoiceEdgeResponseCurve) {
  if (typeof responseCurve === "number") {
    return Math.pow(level, clamp(responseCurve, 0.35, 4));
  }

  if (isAudioResponsePointCurve(responseCurve)) {
    return level * responseScaleAt(level, responseCurve);
  }

  if (responseCurve.type === "easing") {
    const scale = clamp(cubicBezierYForX(level, responseCurve.ease), 0, 2);

    return level * scale;
  }

  return Math.pow(level, 1.55);
}

function isAudioResponsePointCurve(
  responseCurve: VoiceEdgeResponseCurve,
): responseCurve is VoiceEdgeResponsePointCurve {
  return Array.isArray(responseCurve);
}

function cubicBezierYForX(x: number, ease: readonly [number, number, number, number]) {
  const x1 = clamp(ease[0], 0, 1);
  const y1 = ease[1];
  const x2 = clamp(ease[2], 0, 1);
  const y2 = ease[3];
  const target = clamp(x, 0, 1);
  let t = target;

  for (let i = 0; i < 6; i += 1) {
    const currentX = cubicBezierAxis(t, x1, x2) - target;
    const derivative = cubicBezierAxisDerivative(t, x1, x2);

    if (Math.abs(currentX) < 0.0001) return cubicBezierAxis(t, y1, y2);
    if (Math.abs(derivative) < 0.0001) break;

    t = clamp(t - currentX / derivative, 0, 1);
  }

  let lower = 0;
  let upper = 1;

  t = target;

  for (let i = 0; i < 10; i += 1) {
    const currentX = cubicBezierAxis(t, x1, x2);

    if (Math.abs(currentX - target) < 0.0001) break;

    if (currentX < target) {
      lower = t;
    } else {
      upper = t;
    }

    t = (lower + upper) * 0.5;
  }

  return cubicBezierAxis(t, y1, y2);
}

function cubicBezierAxis(t: number, pointOne: number, pointTwo: number) {
  const inv = 1 - t;

  return 3 * inv * inv * t * pointOne + 3 * inv * t * t * pointTwo + t * t * t;
}

function cubicBezierAxisDerivative(t: number, pointOne: number, pointTwo: number) {
  const inv = 1 - t;

  return (
    3 * inv * inv * pointOne + 6 * inv * t * (pointTwo - pointOne) + 3 * t * t * (1 - pointTwo)
  );
}

function responseScaleAt(level: number, responseCurve: VoiceEdgeResponsePointCurve) {
  const points = normalizeAudioResponseCurve(responseCurve);
  const x = clamp(level, 0, 1);

  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1] ?? points[0];
    const next = points[i] ?? previous;

    if (x <= next.level) {
      const span = Math.max(0.0001, next.level - previous.level);
      const t = (x - previous.level) / span;

      return previous.scale + (next.scale - previous.scale) * t;
    }
  }

  return points[points.length - 1]?.scale ?? 1;
}

function normalizeAudioResponseCurve(responseCurve: VoiceEdgeResponsePointCurve) {
  const points = responseCurve
    .filter((point) => Number.isFinite(point.level) && Number.isFinite(point.scale))
    .map((point) => ({
      level: clamp(point.level, 0, 1),
      scale: clamp(point.scale, 0, 3),
    }))
    .sort((a, b) => a.level - b.level);

  if (points.length === 0) return fallbackAudioResponsePointCurve;

  const first = points[0];
  const last = points[points.length - 1];
  const normalized = [...points];

  if (first && first.level > 0) {
    normalized.unshift({ level: 0, scale: first.scale });
  }

  if (last && last.level < 1) {
    normalized.push({ level: 1, scale: last.scale });
  }

  return normalized;
}

function smoothAudioBins(bins: Float32Array) {
  const smoothed = new Float32Array(bins.length);
  const lastIndex = bins.length - 1;

  for (let i = 0; i < bins.length; i += 1) {
    const prevTwo = bins[Math.max(0, i - 2)] ?? 0;
    const prevOne = bins[Math.max(0, i - 1)] ?? 0;
    const current = bins[i] ?? 0;
    const nextOne = bins[Math.min(lastIndex, i + 1)] ?? 0;
    const nextTwo = bins[Math.min(lastIndex, i + 2)] ?? 0;

    smoothed[i] = prevTwo * 0.08 + prevOne * 0.2 + current * 0.44 + nextOne * 0.2 + nextTwo * 0.08;
  }

  return smoothed;
}
