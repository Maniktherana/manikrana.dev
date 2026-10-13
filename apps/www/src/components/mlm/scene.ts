export const DOT = 5;
export const MARGIN = 1.5;
export const LABEL = 90;
/** World units per unit of probability, so the top bar and its number stay clear of the labels. */
export const BAR = 130;
/** How far up and right the back plates of a head stack reach past the front one. */
export const STACK = 3.5;
const GAP = 2.5;

/**
 * How a matrix's dots move when its step runs: "out" fills in one token at a time, "weight" shimmers,
 * "pick" lights the columns it looks up, "scores" fills row by row up to the diagonal.
 */
export type Role = "out" | "weight" | "pick" | "scores";

type Box = { step: number; x0: number; x1: number; z0: number; z1: number };
type Matrix = Box & {
  kind: "matrix";
  cols: number;
  rows: number;
  role: Role;
  pick: number[];
  /** Real values to show instead of illustrative ones, by row then column. */
  values?: number[][];
  /** Small vertical dots stand for the feature rows omitted from a compact view. */
  omittedRows?: number[];
  /** What lights together as data arrives: one token's group of columns, one column, or one row. */
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
  /** "shape" is a tensor shape, set small at a matrix's bottom-right corner. */
  tone: "name" | "dim" | "chip" | "shape";
};
export type Item =
  | Matrix
  | (Box & {
      kind: "shell";
      level: number;
      offset?: number;
      /** Grayed out, for plates that stand in behind the one being shown. */
      faint?: boolean;
    })
  | {
      step: number;
      kind: "neuron";
      x: number;
      z: number;
      r: number;
      value: number;
      /** Draw the neuron's function inside it instead of a filled level: GELU, or a straight line. */
      glyph?: "gelu" | "linear";
    }
  | (Box & { kind: "chip" })
  | {
      step: number;
      kind: "wire";
      pts: [number, number][];
      /** The source columns this wire reads, when it reads only some of them. */
      take?: number[];
      /** Neuron connections are solid and carry one activation. */
      solid?: boolean;
      delay?: number;
    }
  | Text
  | { step: number; kind: "bar"; z0: number; z1: number; p: number; i: number }
  | { step: number; kind: "plus"; x: number; z: number }
  | { step: number; kind: "join"; x: number; z: number }
  /** A labelled step, such as one sublayer of a transformer block. */
  | (Box & {
      kind: "box";
      label: string;
      /** A box that holds other parts, such as a block's front plate: wires inside it don't stop at it. */
      container?: boolean;
    })
  /** A curly brace from one point to another, its nib to the right of the way it runs. */
  | { step: number; kind: "brace"; from: [number, number]; to: [number, number] };

/** A stable pseudo-random value in [0, 1), so every matrix looks like it holds numbers. */
export function noise(a: number, b: number, c: number, d = 0) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + d * 19.3) * 43758.5453;
  return s - Math.floor(s);
}

/** Where dot column `c` sits from a matrix's left edge, with an extra gap after every `group` columns: one group per token. */
export const dotX = (c: number, group: number) =>
  MARGIN + (c + 0.5) * DOT + Math.floor(c / group) * GAP;
/** How wide a matrix of `cols` columns is, with a gap after every `group` of them. */
export const widthOf = (cols: number, group: number) =>
  2 * MARGIN + cols * DOT + (Math.ceil(cols / group) - 1) * GAP;
