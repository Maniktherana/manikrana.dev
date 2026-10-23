import { clamp, fixed } from "./math";

export type Ribbon = {
  head: number;
  length: number;
  radius: number;
  tilt: number;
  turn: number;
  color: string;
  opacity: number;
};

export const PALETTE = ["#f9705c", "#5b95f0", "#3fbe86", "#f5b13f", "#9a72ee", "#35c3bd"];

const NS = "http://www.w3.org/2000/svg";

function ribbonPath(points: { x: number; y: number; z: number }[], width: number) {
  const n = points.length;
  const nx: number[] = [];
  const ny: number[] = [];
  for (let m = 0; m < n; m++) {
    const a = points[Math.max(m - 1, 0)]!;
    const b = points[Math.min(m + 1, n - 1)]!;
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const half = (width * (0.5 + (0.5 * m) / (n - 1))) / 2;
    nx.push((-(b.y - a.y) / length) * half);
    ny.push(((b.x - a.x) / length) * half);
  }
  let front = "";
  let back = "";
  for (let i = 0; i < n; ) {
    const isFront = points[i]!.z >= 0;
    let j = i;
    while (j + 1 < n && points[j + 1]!.z >= 0 === isFront) j++;
    const a = Math.max(i - 1, 0);
    const b = Math.min(j + 1, n - 1);
    if (b > a) {
      let d = "";
      for (let m = a; m <= b; m++)
        d += `${m === a ? "M" : "L"}${fixed(points[m]!.x + nx[m]!, 1)} ${fixed(points[m]!.y + ny[m]!, 1)}`;
      for (let m = b; m >= a; m--)
        d += `L${fixed(points[m]!.x - nx[m]!, 1)} ${fixed(points[m]!.y - ny[m]!, 1)}`;
      if (isFront) front += `${d}Z`;
      else back += `${d}Z`;
    }
    i = j + 1;
  }
  const last = points[n - 1]!;
  const r = width / 2;
  const cap = `M${fixed(last.x - r, 1)} ${fixed(last.y, 1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  return last.z >= 0 ? { front: front + cap, back } : { front, back: back + cap };
}

// Ribbons orbit the head in 3D, so each one is split into the parts drawn behind and in front of it.
export class Ribbons {
  private readonly slots: { back: SVGPathElement; front: SVGPathElement }[];

  constructor(back: SVGGElement, front: SVGGElement) {
    this.slots = [0, 1, 2, 3, 4, 5].map(() => {
      const slot = {
        back: document.createElementNS(NS, "path"),
        front: document.createElementNS(NS, "path"),
      };
      back.appendChild(slot.back);
      front.appendChild(slot.front);
      return slot;
    });
  }

  draw(ribbons: Ribbon[], width: number) {
    this.slots.forEach((slot, i) => {
      const ribbon = ribbons[i];
      if (!ribbon) {
        slot.front.setAttribute("d", "");
        slot.back.setAttribute("d", "");
        return;
      }
      const { head, length, radius, tilt, turn } = ribbon;
      const trail = [];
      for (let m = 0; m <= 26; m++) {
        const lam = head - length * (1 - m / 26);
        const a = radius * Math.sin(lam);
        const b = -radius * Math.cos(lam) * Math.sin(tilt);
        trail.push({
          x: a * Math.cos(turn) - b * Math.sin(turn),
          y: a * Math.sin(turn) + b * Math.cos(turn),
          z: Math.cos(lam) * Math.cos(tilt),
        });
      }
      const { front, back } = ribbonPath(trail, width);
      for (const [node, d] of [
        [slot.front, front],
        [slot.back, back],
      ] as const) {
        node.setAttribute("d", d);
        node.setAttribute("fill", ribbon.color);
        node.setAttribute("opacity", fixed(clamp(ribbon.opacity, 0, 1), 3));
      }
    });
  }

  destroy() {
    for (const slot of this.slots) {
      slot.back.remove();
      slot.front.remove();
    }
  }
}
