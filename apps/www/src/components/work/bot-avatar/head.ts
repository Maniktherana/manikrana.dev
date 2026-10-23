import { curveLength, sampleCurve, type BotCurve } from "./curves";
import { fixed, lerp } from "./math";
import { headOutline, ROUND_OUTLINE, type BotShape, type Point } from "./shapes";

const pathFrom = (points: Point[]) =>
  `M${points.map(([x, y]) => `${fixed(x, 1)} ${fixed(y, 1)}`).join("L")}Z`;

export class Head {
  private shape: BotShape;
  private points: Point[];
  private morph: { from: Point[]; t0: number } | null = null;

  constructor(
    private readonly outline: SVGPathElement,
    private readonly clip: SVGPathElement,
    shape: BotShape,
  ) {
    this.shape = shape;
    this.points = headOutline(shape, 0);
  }

  setShape(shape: BotShape, now: number) {
    if (shape === this.shape) return;
    this.morph = { from: this.points, t0: now };
    this.shape = shape;
  }

  frame(
    now: number,
    input: { spin: number; lat: number; round: number; morph: BotCurve; calm: boolean },
  ): Point[] {
    const { spin, lat, round, morph, calm } = input;
    let points = headOutline(this.shape, spin, lat);
    if (this.morph) {
      const seconds = (now - this.morph.t0) / 1000;
      const length = curveLength(morph);
      const m = calm ? 1 : sampleCurve(morph, seconds, length);
      const from = this.morph.from;
      points = points.map(([x, y], i) => [lerp(from[i]![0], x, m), lerp(from[i]![1], y, m)]);
      if (seconds > Math.max(length, 0.05) * 3 || calm) this.morph = null;
    }
    if (round > 0.001)
      points = points.map(([x, y], i) => [
        lerp(x, ROUND_OUTLINE[i]![0], round),
        lerp(y, ROUND_OUTLINE[i]![1], round),
      ]);
    this.points = points;
    const d = pathFrom(points);
    this.outline.setAttribute("d", d);
    this.clip.setAttribute("d", d);
    return points;
  }
}
