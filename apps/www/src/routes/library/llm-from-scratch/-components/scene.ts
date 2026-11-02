export const DOT = 5;
export const MARGIN = 1.5;
export const LABEL = 90;
export const BAR = 130;
export const STACK = 5;
const GAP = 2.5;

export type Role = "out" | "weight" | "pick" | "scores";

type Box = { step: number; x0: number; x1: number; z0: number; z1: number };
type Matrix = Box & {
  kind: "matrix";
  cols: number;
  rows: number;
  role: Role;
  pick: number[];
  values?: number[][];
  omittedRows?: number[];
  per: "group" | "col" | "row";
  group: number;
  seed: number;
  level: number;
};
type Text = {
  step: number;
  kind: "text";
  x: number;
  z: number;
  value: string;
  anchor: "start" | "middle" | "end";
  tone: "name" | "dim" | "chip" | "shape";
};
export type Item =
  | Matrix
  | (Box & {
      kind: "shell";
      level: number;
      offset?: number;
    })
  | {
      step: number;
      kind: "neuron";
      x: number;
      z: number;
      r: number;
      value: number;
      glyph?: "gelu" | "linear";
    }
  | (Box & { kind: "chip" })
  | {
      step: number;
      kind: "wire";
      pts: [number, number][];
      take?: number[];
      solid?: boolean;
      delay?: number;
    }
  | Text
  | { step: number; kind: "bar"; z0: number; z1: number; p: number; i: number }
  | { step: number; kind: "plus"; x: number; z: number }
  | { step: number; kind: "join"; x: number; z: number }
  | (Box & {
      kind: "box";
      label: string;
      container?: boolean;
    })
  | { step: number; kind: "brace"; from: [number, number]; to: [number, number] };

export function noise(a: number, b: number, c: number, d = 0) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + d * 19.3) * 43758.5453;
  return s - Math.floor(s);
}

export const dotX = (c: number, group: number) =>
  MARGIN + (c + 0.5) * DOT + Math.floor(c / group) * GAP;
export const widthOf = (cols: number, group: number) =>
  2 * MARGIN + cols * DOT + (Math.ceil(cols / group) - 1) * GAP;
