import { DOT, MARGIN, widthOf, type Item } from "@/components/mlm/scene";

export const heightOf = (rows: number) => 2 * MARGIN + rows * DOT;

export type Matrix = Extract<Item, { kind: "matrix" }>;
export type Point = [number, number];

/** View box units with y down; the shared scene uses z up. */
export function matrix(
  step: number,
  x: number,
  y: number,
  seed: number,
  { cols = 8, rows = 4, group = 2, ...options }: Partial<Matrix> = {},
): Matrix {
  const width = widthOf(cols, group);
  const height = heightOf(rows);
  return {
    kind: "matrix",
    step,
    x0: x - width / 2,
    x1: x + width / 2,
    z0: -y - height / 2,
    z1: -y + height / 2,
    cols,
    rows,
    group,
    seed,
    level: 2,
    role: "out",
    pick: [],
    per: "group",
    ...options,
  };
}

export const top = (m: Matrix) => -m.z1;
export const bottom = (m: Matrix) => -m.z0;
export const middle = (m: Matrix) => (m.x0 + m.x1) / 2;

export const wire = (step: number, ...points: Point[]): Item => ({
  kind: "wire",
  step,
  pts: points.map(([x, y]) => [x, -y]),
});

export const text = (
  step: number,
  x: number,
  y: number,
  value: string,
  anchor: "start" | "middle" | "end" = "middle",
): Item => ({ kind: "text", step, x, z: -y, value, anchor, tone: "dim" });

export const shape = (
  step: number,
  m: Matrix,
  value: string,
  side: "right" | "left" = "right",
): Item => ({
  kind: "text",
  step,
  x: side === "right" ? m.x1 : m.x0,
  z: -(bottom(m) + 6),
  value,
  anchor: side === "right" ? "end" : "start",
  tone: "shape",
});

export function chip(step: number, x: number, y: number, word: string, width = 22): Item[] {
  return [
    { kind: "chip", step, x0: x - width / 2, x1: x + width / 2, z0: -y - 4.5, z1: -y + 4.5 },
    { kind: "text", step, x, z: -y - 2, value: word, anchor: "middle", tone: "chip" },
  ];
}
