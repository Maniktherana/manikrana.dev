import { clamp, TAU, UNIT } from "./math";

export type BotShape =
  | "circle"
  | "droplet"
  | "pebble"
  | "square"
  | "badge"
  | "clover"
  | "triangle"
  | "diamond"
  | "hex"
  | "bean"
  | "tablet"
  | "cloud";

export type Point = [x: number, y: number];

type Sphere = [x: number, y: number, z: number, r: number];

type Head = {
  radii?: number[];
  spheres?: Sphere[];
  fromSpheres?: boolean;
};

export const BOT_SHAPES: readonly BotShape[] = [
  "circle",
  "droplet",
  "pebble",
  "square",
  "badge",
  "clover",
  "triangle",
  "diamond",
  "hex",
  "bean",
  "tablet",
  "cloud",
];

const POINTS = 96;
const ANGLES = Array.from({ length: POINTS }, (_, k) => (k / POINTS) * TAU);

const radial = (radius: (angle: number) => number) => ANGLES.map(radius);
const toPoints = (radii: number[], scale = 1): Point[] =>
  radii.map((r, k) => [Math.cos(ANGLES[k]!) * r * scale, Math.sin(ANGLES[k]!) * r * scale]);

function smooth(radii: number[], passes: number) {
  let r = radii;
  for (let pass = 0; pass < passes; pass++) {
    const s = r;
    r = s.map(
      (_, k) =>
        (s[(k - 2 + POINTS) % POINTS]! +
          4 * s[(k - 1 + POINTS) % POINTS]! +
          6 * s[k]! +
          4 * s[(k + 1) % POINTS]! +
          s[(k + 2) % POINTS]!) /
        16,
    );
  }
  return r;
}

function castCircles(circles: [x: number, y: number, r: number][]) {
  return ANGLES.map((angle) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    let best = 0;
    for (const [x, y, r] of circles) {
      const d = c * x + s * y;
      const disc = d * d - (x * x + y * y) + r * r;
      if (disc > 0) best = Math.max(best, d + Math.sqrt(disc));
    }
    return best;
  });
}

function castPolygon(polygon: Point[]) {
  return ANGLES.map((angle) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    let best = 0;
    for (let i = 0; i < polygon.length; i++) {
      const [x1, y1] = polygon[i]!;
      const [x2, y2] = polygon[(i + 1) % polygon.length]!;
      const ex = x2 - x1;
      const ey = y2 - y1;
      const det = ex * s - c * ey;
      if (Math.abs(det) < 1e-9) continue;
      const u = (ex * y1 - x1 * ey) / det;
      const v = (c * y1 - s * x1) / det;
      if (u > best && v >= 0 && v <= 1) best = u;
    }
    return best;
  });
}

// Tips the head up by `tilt`, then turns it by `spin` about its vertical axis.
function turn(spheres: Sphere[], spin: number, tilt = 0): [x: number, y: number, r: number][] {
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  return spheres.map(([x, y, z, r]) => {
    const lifted = z * ct + y * st;
    return [x * c + lifted * s, y * ct - z * st, r];
  });
}

function pathRadii(d: string) {
  const tokens = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const points: Point[] = [];
  let i = 0;
  let command = "";
  let x = 0;
  let y = 0;
  const next = () => Number.parseFloat(tokens[i++]!);
  while (i < tokens.length) {
    if (/[a-z]/i.test(tokens[i]!)) {
      command = tokens[i++]!.toUpperCase();
      if (command === "Z") break;
    }
    if (command === "M" || command === "L") {
      x = next();
      y = next();
      points.push([x, y]);
      command = "L";
    } else if (command === "H") {
      x = next();
      points.push([x, y]);
    } else if (command === "V") {
      y = next();
      points.push([x, y]);
    } else if (command === "C") {
      const [x1, y1, x2, y2, x3, y3] = [next(), next(), next(), next(), next(), next()];
      for (let k = 1; k <= 10; k++) {
        const t = k / 10;
        const u = 1 - t;
        points.push([
          u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
          u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
        ]);
      }
      x = x3;
      y = y3;
    } else i++;
  }
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const scale = 102 / Math.max(Math.max(...xs) - cx, Math.max(...ys) - cy);
  return castPolygon(points.map(([px, py]) => [(px - cx) * scale, (py - cy) * scale]));
}

// Fills an outline with spheres sized by their distance to its edge, so it turns like a balloon.
function inflate(radii: number[]): Sphere[] {
  const ring = toPoints(radii);
  const inside = (x: number, y: number) => {
    const f = ((((Math.atan2(y, x) / TAU) * POINTS) % POINTS) + POINTS) % POINTS;
    const i = Math.floor(f);
    const t = f - i;
    return Math.hypot(x, y) < radii[i]! * (1 - t) + radii[(i + 1) % POINTS]! * t;
  };
  const edge = (x: number, y: number) => {
    let nearest = Infinity;
    for (let i = 0; i < POINTS; i++) {
      const [ax, ay] = ring[i]!;
      const [bx, by] = ring[(i + 1) % POINTS]!;
      const dx = bx - ax;
      const dy = by - ay;
      const u = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
      nearest = Math.min(nearest, Math.hypot(x - ax - u * dx, y - ay - u * dy));
    }
    return nearest;
  };
  const spheres: Sphere[] = [];
  for (let y = -114; y <= 114; y += 8) {
    for (let x = -114; x <= 114; x += 8) {
      if (!inside(x, y)) continue;
      const r = edge(x, y);
      if (r > 6) spheres.push([x, y, 0, r]);
    }
  }
  spheres.sort((a, b) => b[3] - a[3]);
  const kept: Sphere[] = [];
  for (const s of spheres) {
    if (!kept.some((k) => Math.hypot(s[0] - k[0], s[1] - k[1]) + s[3] <= k[3] + 0.5)) kept.push(s);
  }
  return kept;
}

const dropOutline = (() => {
  const cy = 26;
  const r = 88;
  const tip = -114;
  const rise = r / (cy - tip);
  const start = Math.atan2(-r * rise, r * Math.sqrt(1 - rise * rise));
  const points: Point[] = [[0, tip]];
  for (let i = 0; i <= 64; i++) {
    const a = start + ((Math.PI - 2 * start) * i) / 64;
    points.push([r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return points;
})();

const beanOutline = Array.from({ length: 256 }, (_, i): Point => {
  const e = (i / 256) * TAU;
  const bump = (at: number) => {
    const a = Math.abs(((((e - at + Math.PI) % TAU) + TAU) % TAU) - Math.PI);
    return Math.exp(-(a * a) / 0.4232);
  };
  const f = 1 - 0.34 * bump(Math.PI) + 0.34 * 0.34 * bump(0);
  return [94 * Math.cos(e) * f, 112 * Math.sin(e) * f];
});

const HEADS: Record<BotShape, Head> = {
  circle: { radii: radial(() => 100) },
  droplet: {
    radii: smooth(
      castPolygon(dropOutline).map((r) => r * UNIT),
      2,
    ),
  },
  pebble: {
    radii: radial(
      (t) => 97 * (1 + 0.075 * (0.6 * Math.sin(2 * t + 1.1) + 0.4 * Math.sin(3 * t - 1.1))),
    ),
  },
  square: {
    radii: radial(
      (t) => 90 / Math.pow(Math.abs(Math.cos(t)) ** 7 + Math.abs(Math.sin(t)) ** 7, 1 / 7),
    ),
  },
  badge: {
    radii: pathRadii(
      "M12 2C13.3617 2 14.5925 2.8119 15.1289 4.06348L15.333 4.54102C16.1276 6.39493 17.6051 7.87244 19.459 8.66699L19.9365 8.87109C21.1881 9.40748 22 10.6383 22 12C22 13.3617 21.1881 14.5925 19.9365 15.1289L19.459 15.333C17.6051 16.1276 16.1276 17.6051 15.333 19.459L15.1289 19.9365C14.5925 21.1881 13.3617 22 12 22C10.6383 22 9.40748 21.1881 8.87109 19.9365L8.66699 19.459C7.87244 17.6051 6.39493 16.1276 4.54102 15.333L4.06348 15.1289C2.8119 14.5925 2 13.3617 2 12C2 10.6383 2.8119 9.40748 4.06348 8.87109L4.54102 8.66699C6.39493 7.87244 7.87244 6.39493 8.66699 4.54102L8.87109 4.06348C9.40748 2.8119 10.6383 2 12 2Z",
    ),
  },
  clover: {
    radii: pathRadii(
      "M15.3486 2.75C18.6078 2.75008 21.2499 5.39217 21.25 8.65137C21.25 9.4141 21.1048 10.1447 20.8398 10.8154C20.5476 11.5554 20.5476 12.4446 20.8398 13.1846C21.1048 13.8553 21.25 14.5859 21.25 15.3486C21.2499 18.6078 18.6078 21.2499 15.3486 21.25C14.5859 21.25 13.8553 21.1048 13.1846 20.8398C12.4446 20.5476 11.5554 20.5476 10.8154 20.8398C10.1447 21.1048 9.4141 21.25 8.65137 21.25C5.39217 21.2499 2.75008 18.6078 2.75 15.3486C2.75 14.5861 2.89544 13.8554 3.16016 13.1846C3.45202 12.4447 3.45202 11.5553 3.16016 10.8154C2.89544 10.1446 2.75 9.41391 2.75 8.65137C2.75008 5.39217 5.39217 2.75008 8.65137 2.75C9.41391 2.75 10.1446 2.89544 10.8154 3.16016C11.5553 3.45202 12.4447 3.45202 13.1846 3.16016C13.8554 2.89544 14.5861 2.75 15.3486 2.75Z",
    ),
  },
  triangle: {
    radii: pathRadii(
      "M8.56604 4.03409C10.1182 1.43654 13.881 1.43657 15.4332 4.03409L21.9547 14.9481C23.5479 17.6144 21.6271 20.9999 18.5211 20.9999H5.47815C2.37238 20.9997 0.451539 17.6143 2.04456 14.9481L8.56604 4.03409Z",
    ),
  },
  diamond: {
    radii: smooth(
      castPolygon([
        [0, -108],
        [104, 0],
        [0, 108],
        [-104, 0],
      ]),
      4,
    ),
  },
  hex: {
    radii: smooth(
      radial((t) => {
        const a = TAU / 6;
        const f = (((t + Math.PI / 2) % a) + a) % a;
        return (106 * Math.cos(a / 2)) / Math.cos(f - a / 2);
      }),
      3,
    ),
  },
  bean: {
    radii: castPolygon(beanOutline).map((r) => r * UNIT * 1.02),
    spheres: [
      [-16.8, -102, 0, 42],
      [-13.5, -84, 0, 62],
      [-8.5, -60, 0, 78],
      [-3, -36, 0, 84],
      [1.5, -12, 0, 85],
      [1.5, 12, 0, 85],
      [-3, 36, 0, 84],
      [-8.5, 60, 0, 78],
      [-13.5, 84, 0, 62],
      [-16.8, 102, 0, 42],
    ],
  },
  tablet: {
    fromSpheres: true,
    spheres: [-40, -26.7, -13.3, 0, 13.3, 26.7, 40].map((x): Sphere => [x, 0, 0, 74]),
  },
  cloud: {
    fromSpheres: true,
    spheres: [
      [-62, 26, 10, 58],
      [62, 26, -14, 56],
      [0, 34, 24, 64],
      [-24, -30, -22, 64],
      [38, -26, 16, 56],
    ],
  },
};

type Outline = { rest: Point[]; turned: (spin: number, tilt: number) => Point[] };

const outlines = new Map<BotShape, Outline>();

function build(shape: BotShape): Outline {
  const head = HEADS[shape];
  if (head.fromSpheres && head.spheres) {
    const spheres = head.spheres;
    const extent = Math.max(
      ...toPoints(castCircles(turn(spheres, 0))).flatMap(([x, y]) => [Math.abs(x), Math.abs(y)]),
    );
    const scale = 102 / extent;
    const turned = (spin: number, tilt: number) =>
      toPoints(smooth(castCircles(turn(spheres, spin, tilt)), 1), scale);
    return { rest: turned(0, 0), turned };
  }
  const radii = head.radii!;
  if (shape === "circle") {
    const rest = toPoints(radii);
    return { rest, turned: () => rest };
  }
  // Keep the drawn outline and borrow only how much the sphere silhouette changes as it turns.
  const spheres = head.spheres ?? inflate(radii);
  const resting = castCircles(turn(spheres, 0));
  const turned = (spin: number, tilt: number) => {
    const ratio = smooth(
      castCircles(turn(spheres, spin, tilt)).map((r, k) =>
        clamp((r + 12) / (resting[k]! + 12), 0.32, 1.5),
      ),
      3,
    );
    return toPoints(radii.map((r, k) => r * ratio[k]!));
  };
  return { rest: toPoints(radii), turned };
}

export function headOutline(shape: BotShape, spin: number, tilt = 0): Point[] {
  let outline = outlines.get(shape);
  if (!outline) {
    outline = build(shape);
    outlines.set(shape, outline);
  }
  const wrapped = ((spin % TAU) + TAU) % TAU;
  const still = (wrapped < 1e-6 || TAU - wrapped < 1e-6) && Math.abs(tilt) < 1e-6;
  return still ? outline.rest : outline.turned(spin, tilt);
}

export const ROUND_OUTLINE = toPoints(radial(() => 100));
