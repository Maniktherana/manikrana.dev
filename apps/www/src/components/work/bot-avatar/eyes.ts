import { clamp, fixed, inOutCubic, lerp, outBack, outCubic } from "./math";
import type { Point } from "./shapes";
import type { BotPose, BotTuning } from "./tuning";

type Vec3 = [x: number, y: number, z: number];

const yaw = ([x, y, z]: Vec3, angle: number): Vec3 => [
  x * Math.cos(angle) + z * Math.sin(angle),
  y,
  z * Math.cos(angle) - x * Math.sin(angle),
];

const pitch = ([x, y, z]: Vec3, angle: number): Vec3 => [
  x,
  y * Math.cos(angle) - z * Math.sin(angle),
  y * Math.sin(angle) + z * Math.cos(angle),
];

function spanAt(points: Point[], y: number): [number, number] {
  let left = Infinity;
  let right = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const [ax, ay] = points[i]!;
    const [bx, by] = points[(i + 1) % points.length]!;
    if (ay <= y === by <= y) continue;
    const x = ax + ((bx - ax) * (y - ay)) / (by - ay);
    left = Math.min(left, x);
    right = Math.max(right, x);
  }
  return Number.isFinite(left) ? [left, right] : [0, 0];
}

// A shallow "◠" arc of the given radius; side mirrors it for the right eye.
function curl(side: -1 | 1, radius: number) {
  const heading = Math.PI / 2 - side * (Math.PI / 2);
  const bend = side / radius;
  const length = Math.PI * 0.82 * radius;
  const top = radius * 0.35 - radius;
  let d = "";
  for (let k = 0; k <= 16; k++) {
    const u = (k / 16 - 0.5) * length;
    const x = (Math.sin(heading + bend * u) - Math.sin(heading)) / bend;
    const y = top + (Math.cos(heading) - Math.cos(heading + bend * u)) / bend;
    d += `${k ? "L" : "M"}${fixed(x)} ${fixed(y)}`;
  }
  return d;
}

export class Eyes {
  constructor(
    private readonly pills: [SVGRectElement, SVGRectElement],
    private readonly arcs: [SVGPathElement, SVGPathElement],
  ) {}

  frame(face: {
    points: Point[];
    lon: number;
    lat: number;
    turn: number;
    tumble: { spin: number; tip: number };
    pose: BotPose;
    blink: number;
    tilt: number;
    smile: number;
    presence: number;
    eyes: BotTuning["eyes"];
  }) {
    const { points, lon: F, lat: L, turn, tumble, pose, presence, eyes } = face;
    let top = Infinity;
    let bottom = -Infinity;
    for (const [, y] of points) {
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
    const lid = clamp(pose.lid * face.blink, 0.05, 1.25);
    const height = Math.max(eyes.height * lid, 4);
    const width = eyes.width + eyes.squint * clamp((0.6 - lid) / 0.45, 0, 1);
    const corner = Math.min(width, height) / 2;
    const margin = (eyes.height * 1.25) / 2;
    const span = (lat: number) => {
      const y = lat >= 0 ? lat * top * 0.9 : -lat * bottom * 0.9;
      const free = margin * (1 - Math.abs(lat));
      const at = clamp(y, top + free, bottom - free);
      const [left, right] = spanAt(points, at);
      return { y: at, middle: (left + right) / 2, half: (right - left) / 2 };
    };
    const rest = span(Math.sin(L));
    const visible = clamp(1 - presence, 0, 1.1);
    const roll = (pose.roll * Math.PI) / 180;
    // On a narrow head the eyes sit further round it, so they stay as far apart on its surface as on a
    // round head; turning then foreshortens that gap like any other mark on the head.
    const apart = 100 * Math.sin(eyes.spacing);
    const spacing = clamp(
      Math.asin(Math.min(apart / Math.max(rest.half, 1), 1)),
      eyes.spacing,
      Math.max(eyes.spacing, 0.5),
    );
    // Each eye is a mark on a ball: its spot and its little frame are turned in 3D (Done's tumble, then the
    // head's own turn) and projected, so the eyes foreshorten and roll together however the head moves.
    const orient = (v: Vec3) => yaw(pitch(yaw(v, tumble.spin), tumble.tip), turn);
    const up = orient([Math.sin(L) * Math.sin(F), -Math.cos(L), Math.sin(L) * Math.cos(F)]);
    const marks = [-1, 1].map((side) => {
      const lon = F + side * spacing;
      const [px, py, pz] = orient([
        Math.cos(L) * Math.sin(lon),
        Math.sin(L),
        Math.cos(L) * Math.cos(lon),
      ]);
      const across = orient([Math.cos(lon), 0, -Math.sin(lon)]);
      const row = span(py);
      const round = Math.sqrt(Math.max(1 - py * py, 1e-6));
      return {
        x: row.middle + row.half * clamp(px / round, -1, 1) * 0.96,
        y: row.y,
        facing: pz,
        frame: [across[0], -across[1], up[0], -up[1]],
      };
    });
    const smile = clamp(face.smile, 0, 1.2);
    const pairX = (marks[0]!.x + marks[1]!.x) / 2;
    this.pills.forEach((pill, i) => {
      const { x, facing, frame } = marks[i]!;
      const k = facing > 0.02 ? pose.eyeScale * visible : 0;
      const y = marks[i]!.y + (x - pairX) * Math.tan(roll);
      const rotate = (i ? -1 : 1) * face.tilt + pose.roll;
      const surface = (scale: number) =>
        `translate(${fixed(x)} ${fixed(y)}) matrix(${frame.map((n) => fixed(n * k * scale, 4)).join(" ")} 0 0) rotate(${fixed(rotate)})`;
      pill.setAttribute("x", fixed(-width / 2));
      pill.setAttribute("y", fixed(-height / 2));
      pill.setAttribute("width", fixed(width));
      pill.setAttribute("height", fixed(height));
      pill.setAttribute("rx", fixed(corner));
      pill.setAttribute("ry", fixed(corner));
      // Happy squeezes the pills shut, then pops them open as arcs.
      const arc = this.arcs[i];
      const squeeze = clamp(smile / 0.45, 0, 1);
      const open = clamp((smile - 0.45) / 0.55, 0, 1);
      pill.setAttribute(
        "transform",
        open > 0
          ? surface(0)
          : `${surface(1)} scale(1 ${fixed(1 - 0.94 * inOutCubic(squeeze), 4)})`,
      );
      arc.setAttribute(
        "transform",
        open > 0
          ? `${surface(1)} scale(${fixed(lerp(0.7, 1, outCubic(open)), 4)} ${fixed(outBack(open), 4)})`
          : surface(0),
      );
      if (open > 0) {
        arc.setAttribute("d", curl(i ? 1 : -1, eyes.width * 0.66));
        arc.setAttribute("stroke-width", fixed(eyes.width * 0.56));
      }
    });
  }
}
