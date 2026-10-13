export const DOT = 5;
export const MARGIN = 1.5;
export const LABEL = 90;
const GAP = 2.5;
const HEAD = 5;

const TOKENS = ["<bos>", "The", "cat", "is"];
const NEXT: [string, number][] = [
  ["black", 0.27],
  ["orange", 0.19],
  ["fat", 0.14],
  ["scared", 0.1],
  ["lazy", 0.07],
];

/** The line of mlm each step runs, shown under the diagram while it plays. */
export const STEPS = [
  "tokenizer(text) → ids",
  "x = drop_emb(tok_emb(ids) + pos_emb(pos))",
  "x = self.norm1(x)",
  "q, k, v = W_query(x), W_key(x), W_value(x)",
  "w = softmax(masked(q @ kᵀ) / √64)",
  "x = drop_shortcut(out_proj(w @ v)) + shortcut",
  "x = self.norm2(x)",
  "h = GELU(Linear(768 → 3072)(x))",
  "x = drop_shortcut(Linear(3072 → 768)(h)) + shortcut",
  "x = self.trf_blocks(x)",
  "x = self.final_norm(x)",
  "logits = self.out_head(x)",
  "next = multinomial(softmax(top_k(logits[:, -1] / 0.8)))",
];

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
  group: number;
  seed: number;
};
type Text = {
  step: number;
  kind: "text";
  x: number;
  z: number;
  value: string;
  anchor: "start" | "middle" | "end";
  tone: "name" | "dim" | "chip";
};
export type Item =
  | Matrix
  | (Box & { kind: "shell"; y: number })
  | (Box & { kind: "chip" })
  | { step: number; kind: "wire"; pts: [number, number][] }
  | Text
  | { step: number; kind: "bar"; z0: number; z1: number; p: number; i: number }
  | { step: number; kind: "plus"; x: number; z: number }
  | { step: number; kind: "join"; x: number; z: number };

/** A stable pseudo-random value in [0, 1), so every matrix looks like it holds numbers. */
export function noise(a: number, b: number, c: number, d = 0) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + d * 19.3) * 43758.5453;
  return s - Math.floor(s);
}

/** Where dot column `c` sits from a matrix's left edge, with an extra gap after every `group` columns: one group per token. */
export const dotX = (c: number, group: number) =>
  MARGIN + (c + 0.5) * DOT + Math.floor(c / group) * GAP;
const widthOf = (cols: number, group: number) =>
  2 * MARGIN + cols * DOT + (Math.ceil(cols / group) - 1) * GAP;

const LANE = widthOf(12, 3);
const MID = LANE / 2;
const BYPASS = LANE + 7;

/** Everything drawn, in world units: x right, z up. In paint order. */
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
  }: { role?: Role; pick?: number[]; group?: number } = {},
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
  });
  return { x0, x1, top, bottom, mid: (x0 + x1) / 2 };
}

/** Three of the twelve heads: two empty layers stacked behind the one whose numbers we see. */
function heads(
  step: number,
  x0: number,
  top: number,
  cols: number,
  rows: number,
  opts: { role?: Role; group?: number } = {},
) {
  const x1 = x0 + widthOf(cols, opts.group ?? cols);
  const bottom = top - rows * DOT - 2 * MARGIN;
  for (const h of [2, 1])
    scene.push({ step, kind: "shell", x0, x1, z0: bottom, z1: top, y: -h * HEAD });
  return matrix(step, x0, top, cols, rows, opts);
}

const text = (
  step: number,
  x: number,
  z: number,
  value: string,
  anchor: "start" | "middle" | "end" = "start",
  tone: "name" | "dim" | "chip" = "dim",
) => scene.push({ step, kind: "text", x, z, value, anchor, tone });
const wire = (step: number, ...pts: [number, number][]) => scene.push({ step, kind: "wire", pts });
const label = (step: number, z: number, name: string) =>
  text(step, LABEL, z, name, "start", "name");
const down = (step: number, from: number, to: number) => wire(step, [MID, from - 1], [MID, to + 1]);
const lane = (step: number, top: number, rows = 6) => matrix(step, 0, top, 12, rows);

/** The shortcut: it leaves the column at `from`, runs beside it, and is added back into `into`. */
function shortcut(step: number, from: number, into: Placed) {
  const z = (into.top + into.bottom) / 2;
  scene.push({ step, kind: "join", x: MID, z: from });
  wire(step, [MID, from], [BYPASS, from], [BYPASS, z + 3]);
  scene.push({ step, kind: "plus", x: BYPASS, z });
  wire(step, [BYPASS - 3, z], [LANE + 1, z]);
}

function norm(step: number, top: number, name: string) {
  matrix(step, -16, top, 1, 6, { role: "weight" });
  matrix(step, -9, top, 1, 6, { role: "weight" });
  const out = lane(step, top);
  label(step, top - 18, name);
  return out;
}

// 0 · the prompt, each chip above the column of tok_emb its id looks up
const tokX = -124;
const tokTop = -20;
const picks = [1, 4, 7, 10];
TOKENS.forEach((word, i) => {
  const x = tokX + dotX(picks[i]!, 12) - 7.5;
  scene.push({ step: 0, kind: "chip", x0: x + 1, x1: x + 14, z0: 0, z1: 11 });
  text(0, x + 7.5, 3.6, word, "middle", "chip");
});
label(0, 3.6, "prompt");

// 1 · embeddings
const tokEmb = matrix(1, tokX, tokTop, 12, 6, { role: "pick", pick: picks });
for (const c of picks) wire(1, [tokX + dotX(c, 12), -1], [tokX + dotX(c, 12), tokTop + 1]);
text(1, tokEmb.x0, tokEmb.bottom - 8, "tok_emb");
text(1, tokEmb.x1 + 7, tokTop - 18, "+", "middle", "name");
const posEmb = matrix(1, tokEmb.x1 + 14, tokTop, 6, 6, { role: "pick", pick: [0, 1, 2, 3] });
text(1, posEmb.x0, posEmb.bottom - 8, "pos_emb");
wire(1, [posEmb.x1 + 1, tokTop - 16], [-1, tokTop - 16]);
const x = lane(1, tokTop);
label(1, tokTop - 18, "x");

// 2 · norm1
const n1 = norm(2, x.bottom - 24, "norm1");
down(2, x.bottom, n1.top);

// 3 · q, k, v
const qkvTop = n1.bottom - 24;
const W = [-132, -88, -44].map((x0) => matrix(3, x0, qkvTop, 6, 6, { role: "weight" }));
const [wq, wk, wv] = W as [Placed, Placed, Placed];
["W_query", "W_key", "W_value"].forEach((name, i) => text(3, W[i]!.x0, qkvTop + 4, name));
wire(
  3,
  [MID, n1.bottom - 1],
  [MID, n1.bottom - 10],
  [wq.mid, n1.bottom - 10],
  [wq.mid, qkvTop + 10],
);
wire(3, [wk.mid, n1.bottom - 10], [wk.mid, qkvTop + 10]);
wire(3, [wv.mid, n1.bottom - 10], [wv.mid, qkvTop + 10]);
const small = widthOf(4, 1);
const [q, k, v] = W.map((w) => heads(3, w.mid - small / 2, w.bottom - 10, 4, 3, { group: 1 })) as [
  Placed,
  Placed,
  Placed,
];
["q", "k", "v"].forEach((name, i) => {
  const at = [q, k, v][i]!;
  text(3, at.x0 - 3, at.bottom + 6, name, "end", "name");
});
label(3, q.top - 10, "12 heads");

// 4 · scores, masked, softmax
const scoresTop = k.bottom - 12;
const scores = heads(4, wk.mid - small / 2, scoresTop, 4, 4, { role: "scores" });
wire(4, [q.mid, q.bottom - 1], [q.mid, scores.bottom + 11], [scores.x0 - 1, scores.bottom + 11]);
wire(4, [k.mid, k.bottom - 1], [k.mid, scores.top + 1]);
label(4, scoresTop - 13, "softmax");

// 5 · weights @ v, out_proj, shortcut
const ctx = heads(5, scores.mid - small / 2, scores.bottom - 12, 4, 3, { group: 1 });
wire(5, [scores.mid, scores.bottom - 1], [scores.mid, ctx.top + 1]);
wire(5, [v.mid, v.bottom - 1], [v.mid, ctx.top - 8], [ctx.x1 + 1, ctx.top - 8]);
const outTop = ctx.bottom - 14;
const outProj = matrix(5, -48, outTop, 6, 6, { role: "weight" });
text(5, outProj.x0, outTop + 4, "out_proj");
wire(
  5,
  [ctx.mid, ctx.bottom - 1],
  [ctx.mid, outProj.bottom + 16],
  [outProj.x0 - 1, outProj.bottom + 16],
);
const a = lane(5, outTop);
wire(5, [outProj.x1 + 1, a.bottom + 16], [-1, a.bottom + 16]);
shortcut(5, n1.top + 12, a);
label(5, outTop - 18, "x + attention");

// 6 · norm2
const n2 = norm(6, a.bottom - 24, "norm2");
down(6, a.bottom, n2.top);

// 7 · Linear 768 → 3072, GELU
const ffTop = n2.bottom - 24;
const w1 = matrix(7, -124, ffTop, 12, 6, { role: "weight" });
text(7, w1.x0, ffTop + 4, "Linear 768 → 3072");
wire(
  7,
  [MID, n2.bottom - 1],
  [MID, n2.bottom - 10],
  [w1.mid, n2.bottom - 10],
  [w1.mid, ffTop + 10],
);
const h = lane(7, ffTop, 14);
wire(7, [w1.x1 + 1, w1.bottom + 16], [-1, w1.bottom + 16]);
label(7, ffTop - 38, "GELU");

// 8 · Linear 3072 → 768, shortcut
const w2 = matrix(8, -48, h.bottom - 12, 6, 14, { role: "weight" });
text(8, w2.x0 - 3, w2.top - 12, "Linear 3072 → 768", "end");
wire(8, [MID, h.bottom - 1], [MID, h.bottom - 6], [w2.mid, h.bottom - 6], [w2.mid, w2.top + 1]);
const m = lane(8, w2.bottom + 33);
wire(8, [w2.x1 + 1, m.bottom + 16], [-1, m.bottom + 16]);
shortcut(8, n2.top + 12, m);
label(8, m.top - 18, "x + feed forward");

// 10 · final_norm
const fn = norm(10, Math.min(m.bottom, w2.bottom) - 30, "final_norm");
down(10, m.bottom, fn.top);

// 11 · out_head
const headTop = fn.bottom - 24;
const outHead = matrix(11, -124, headTop, 12, 6, { role: "weight" });
text(11, outHead.x0, headTop + 4, "out_head, tied to tok_emb");
down(11, fn.bottom, headTop);
const logits = lane(11, headTop, 10);
wire(11, [outHead.x1 + 1, outHead.bottom + 16], [-1, outHead.bottom + 16]);
label(11, headTop - 28, "logits");

// 12 · sample the next token
const last = dotX(10, 3);
wire(12, [last, logits.bottom - 1], [last, logits.bottom - 15]);
NEXT.forEach(([word, p], i) => {
  const z = logits.bottom - 16 - i * 11;
  text(12, -4, z - 6, word, "end", i === 0 ? "name" : "dim");
  scene.push({ step: 12, kind: "bar", z0: z - 7, z1: z, p, i });
  text(12, 6 + p * 160, z - 6, p.toFixed(2).slice(1));
});
label(12, logits.bottom - 22, "next token");

export const parts = {
  embedding: {
    steps: [0, 1],
    caption:
      "Each id lights one column of tok_emb, each position one column of pos_emb, and their sum is x: one 768-number vector per token.",
  },
  attention: {
    steps: [2, 3, 4, 5],
    caption:
      "x is normalized, projected into queries, keys and values for 12 heads, scored with the future masked, mixed, and added back onto the x that came in.",
  },
  feedForward: {
    steps: [6, 7, 8],
    caption:
      "norm2, a Linear layer four times wider with GELU, a Linear layer back to 768, and added back onto its input.",
  },
  output: {
    steps: [10, 11, 12],
    caption:
      "final_norm, then out_head scores all 50,257 tokens at every position, and the last token's scores become the next token.",
  },
};
