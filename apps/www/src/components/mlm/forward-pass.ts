import {
  DOT,
  LABEL,
  MARGIN,
  STACK,
  dotX,
  widthOf,
  type Item,
  type Role,
} from "@/components/mlm/scene";

const TOKENS = ["<bos>", "The", "cat", "is"];
const NEXT: [string, number][] = [
  ["a", 0.452],
  ["the", 0.104],
  ["in", 0.059],
  ["not", 0.032],
  ["an", 0.029],
];

const LANE = widthOf(12, 3);
const MID = LANE / 2;
const BYPASS = LANE + 7;

/** In paint order. */
export const scene: Item[] = [];
let seeds = 0;

type Placed = { x0: number; x1: number; top: number; bottom: number; mid: number };

function matrix(
  step: number,
  x0: number,
  top: number,
  cols: number,
  rows: number,
  {
    role = "out",
    pick = [],
    group = role === "out" ? 3 : cols,
    level = 0,
    values,
    per = role === "scores" ? "row" : role === "pick" ? "col" : "group",
  }: {
    role?: Role;
    pick?: number[];
    group?: number;
    level?: number;
    values?: number[][];
    per?: "group" | "col" | "row";
  } = {},
): Placed {
  const x1 = x0 + widthOf(cols, group);
  const bottom = top - rows * DOT - 2 * MARGIN;
  scene.push({
    step,
    kind: "matrix",
    x0,
    x1,
    z0: bottom,
    z1: top,
    cols,
    rows,
    role,
    pick,
    group,
    seed: ++seeds,
    level,
    values,
    per,
  });
  return { x0, x1, top, bottom, mid: (x0 + x1) / 2 };
}

function heads(
  step: number,
  x0: number,
  top: number,
  cols: number,
  rows: number,
  opts: { role?: Role; group?: number; values?: number[][]; per?: "group" | "col" | "row" } = {},
) {
  const x1 = x0 + widthOf(cols, opts.group ?? cols);
  const bottom = top - rows * DOT - 2 * MARGIN;
  for (const level of [0, 1])
    scene.push({ step, kind: "shell", x0, x1, z0: bottom, z1: top, level });
  return matrix(step, x0, top, cols, rows, { ...opts, level: 2 });
}

const text = (
  step: number,
  x: number,
  z: number,
  value: string,
  anchor: "start" | "middle" | "end" = "start",
  tone: "name" | "dim" | "chip" | "shape" = "dim",
) => scene.push({ step, kind: "text", x, z, value, anchor, tone });
const wire = (step: number, ...pts: [number, number][]) => scene.push({ step, kind: "wire", pts });
const tap = (step: number, take: number[], ...pts: [number, number][]) =>
  scene.push({ step, kind: "wire", pts, take });
const label = (step: number, z: number, name: string) =>
  text(step, LABEL, z, name, "start", "name");
const down = (step: number, from: number, to: number) => wire(step, [MID, from - 1], [MID, to + 1]);
const shape = (step: number, at: Placed, value: string, side: "right" | "left" = "right") =>
  text(
    step,
    side === "right" ? at.x1 : at.x0,
    at.bottom - 5,
    value,
    side === "right" ? "end" : "start",
    "shape",
  );
const lane = (step: number, top: number, rows = 6) => matrix(step, 0, top, 12, rows);

function shortcut(step: number, from: number, into: Placed) {
  const z = (into.top + into.bottom) / 2;
  scene.push({ step, kind: "join", x: MID, z: from });
  wire(step, [MID, from], [BYPASS, from], [BYPASS, z + 3]);
  scene.push({ step, kind: "plus", x: BYPASS, z });
  wire(step, [BYPASS - 3, z], [LANE + 1, z]);
}

function norm(step: number, top: number, name: string) {
  const [scale, shift] = [-26, -15].map((x0) => matrix(step, x0, top, 1, 6, { role: "weight" }));
  text(step, (scale!.x0 + shift!.x1) / 2, scale!.bottom - 5, "(768)", "middle", "shape");
  const out = lane(step, top);
  shape(step, out, "(4, 768)");
  label(step, top - 18, name);
  return out;
}

const tokX = -134;
const tokTop = -20;
const picks = [1, 4, 7, 10];
TOKENS.forEach((word, i) => {
  const x = tokX + dotX(picks[i]!, 12) - 7.5;
  scene.push({ step: 0, kind: "chip", x0: x + 1, x1: x + 14, z0: 0, z1: 11 });
  text(0, x + 7.5, 3.6, word, "middle", "chip");
});
text(0, tokX + dotX(picks[0]!, 12) - 9.5, 3.6, "prompt", "end", "name");

const tokEmb = matrix(1, tokX, tokTop, 12, 6, { role: "pick", pick: picks });
for (const c of picks) wire(1, [tokX + dotX(c, 12), -1], [tokX + dotX(c, 12), tokTop + 1]);
text(1, tokEmb.x0, tokEmb.bottom - 12, "tok_emb");
shape(1, tokEmb, "(50257, 768)");
const positions = [0, 1, 2, 3];
const posEmb = matrix(1, tokEmb.x1 + 10, tokTop, 6, 6, { role: "pick", pick: positions });
text(1, posEmb.x0, posEmb.bottom - 12, "pos_emb");
shape(1, posEmb, "(1024, 768)");
const sum = { x: posEmb.x1 / 2, z: tokTop - 16 };
const under = tokEmb.bottom - 19;
tap(
  1,
  picks,
  [tokEmb.mid, tokEmb.bottom - 1],
  [tokEmb.mid, under],
  [sum.x, under],
  [sum.x, sum.z - 3.5],
);
tap(1, positions, [posEmb.x1 + 1, sum.z], [sum.x - 3.5, sum.z]);
scene.push({ step: 1, kind: "plus", ...sum });
wire(1, [sum.x + 3.5, sum.z], [-1, sum.z]);
const x = lane(1, tokTop);
text(1, x.x0, x.bottom - 12, "tok_embeds + pos_embeds");
shape(1, x, "(4, 768)");

const n1 = norm(2, x.bottom - 24, "norm1");
down(2, x.bottom, n1.top);

const qkvTop = n1.bottom - 24;
const ROOM = 18;
const W = [-160, -104, -48].map((x0) => matrix(3, x0, qkvTop, 6, 6, { role: "weight" }));
const wk = W[1]!;
["W_q", "W_k", "W_v"].forEach((name, i) => text(3, W[i]!.mid - 3, qkvTop + 5, name, "end"));
for (const w of W)
  wire(
    3,
    [MID, n1.bottom - 1],
    [MID, n1.bottom - 10],
    [w.mid, n1.bottom - 10],
    [w.mid, qkvTop + 1],
  );
const small = widthOf(4, 4);
const [q, k, v] = W.map((w) =>
  heads(3, w.mid - small / 2, w.bottom - ROOM, 4, 3, { group: 4, per: "col" }),
) as [Placed, Placed, Placed];
W.forEach((w, i) => wire(3, [w.mid, w.bottom - 1], [w.mid, [q, k, v][i]!.top + STACK + 1]));
const beside = (step: number, at: Placed, value: string) =>
  text(step, at.mid + 2.5, at.bottom - 5, value, "start", "shape");
beside(3, q, "(4, 64)");
beside(3, W[0]!, "(768, 768)");
const right = (step: number, at: Placed, value: string) =>
  text(step, at.x1 + STACK + 2.5, at.bottom + 1, value, "start", "shape");
["q", "k", "v"].forEach((name, i) => {
  const at = [q, k, v][i]!;
  text(3, at.x0 - 3, at.bottom + 6, name, "end", "name");
});

const scoresTop = k.bottom - ROOM;
const scores = heads(4, wk.mid - small / 2, scoresTop, 4, 4, {
  role: "scores",
  values: [[1], [0.97, 0.03], [0.05, 0.26, 0.69], [0.4, 0.24, 0.14, 0.22]],
});
wire(4, [q.mid, q.bottom - 1], [q.mid, scores.bottom + 11], [scores.x0 - 1, scores.bottom + 11]);
wire(4, [k.mid, k.bottom - 1], [k.mid, scores.top + STACK + 1]);
text(4, scores.x0 - 3, scores.top - 6, "attn_weights", "end");
right(4, scores, "(4, 4)");

const ctx = heads(5, scores.mid - small / 2, scores.bottom - ROOM, 4, 3, {
  group: 4,
  per: "col",
});
wire(5, [scores.mid, scores.bottom - 1], [scores.mid, ctx.top + STACK + 1]);
wire(5, [v.mid, v.bottom - 1], [v.mid, ctx.top - 8], [ctx.x1 + STACK + 1, ctx.top - 8]);
text(5, ctx.x0 - 3, ctx.top - 9, "context_vec", "end");
const brace = v.x1 + STACK + 8;
scene.push({ step: 3, kind: "brace", from: [brace, q.top + STACK], to: [brace, ctx.bottom] });
text(3, brace + 6, (q.top + ctx.bottom) / 2 - 2, "12 heads", "start");
right(5, ctx, "(4, 64)");
const outTop = ctx.bottom - ROOM;
const outProj = matrix(5, -48, outTop, 6, 6, { role: "weight" });
text(5, outProj.x0, outTop + 6, "out_proj");
wire(
  5,
  [ctx.mid, ctx.bottom - 1],
  [ctx.mid, outProj.bottom + 16],
  [outProj.x0 - 1, outProj.bottom + 16],
);
text(5, ctx.mid - 3, outProj.bottom + 18, "concat 12 heads", "end");
const a = lane(5, outTop);
shape(5, a, "(4, 768)");
wire(5, [outProj.x1 + 1, a.bottom + 16], [-1, a.bottom + 16]);
shortcut(5, n1.top + 12, a);
label(5, outTop - 18, "x + attention");

const fn = norm(10, a.bottom - 30, "final_norm");
down(10, a.bottom, fn.top);

const headTop = fn.bottom - 24;
const outHead = matrix(11, -124, headTop, 12, 6, { role: "weight" });
text(11, outHead.x0, headTop + 6, "out_head, tied to tok_emb");
down(11, fn.bottom, headTop);
const logits = lane(11, headTop, 10);
shape(11, outHead, "(50257, 768)");
shape(11, logits, "(4, 50257)");
wire(11, [outHead.x1 + 1, outHead.bottom + 16], [-1, outHead.bottom + 16]);
label(11, headTop - 28, "logits");

tap(12, [9, 10, 11], [MID, logits.bottom - 1], [MID, logits.bottom - 15]);
NEXT.forEach(([word, p], i) => {
  const z = logits.bottom - 16 - i * 11;
  text(12, -4, z - 6, word, "end", i === 0 ? "name" : "dim");
  scene.push({ step: 12, kind: "bar", z0: z - 7, z1: z, p, i });
});
label(12, logits.bottom - 22, "next token");

export const parts = {
  embedding: [0, 1],
  attention: [2, 3, 4, 5],
  output: [10, 11, 12],
};
