import { SceneDiagram } from "@/components/mlm/scene-diagram";
import { DOT, MARGIN, type Item } from "@/components/mlm/scene";
import { bottom, chip, matrix, middle, text, top, wire, type Matrix } from "@/components/mlm/build";

const LINE = 80;
const table = matrix(0, 48, LINE, 201, {
  cols: 3,
  group: 3,
  rows: 10,
  role: "pick",
  pick: [2, 4, 6, 8],
  per: "row",
});
const rowOf = (m: Matrix, r: number) => top(m) + MARGIN + (r + 0.5) * DOT;
const PROMPT = ["<bos>", "The", "cat", "is"];

const PLATE = { x0: 74, x1: 226, y0: LINE - 28, y1: LINE + 28 };
const plate = (offset: number): Item => ({
  kind: "shell",
  step: 1,
  level: 0,
  offset,
  x0: PLATE.x0,
  x1: PLATE.x1,
  z0: -PLATE.y1,
  z1: -PLATE.y0,
});
const sublayer = (x0: number, label: string): Item => ({
  kind: "box",
  step: 1,
  label,
  x0,
  x1: x0 + 46,
  z0: -(LINE + 7),
  z1: -(LINE - 7),
});
const SECOND = 4;
const BACK = 18;
const plus = (x: number): Item => ({ kind: "plus", step: 1, x, z: -LINE });
const join = (x: number): Item => ({ kind: "join", step: 1, x, z: -LINE });
const ARC = LINE - 18;
const [ADD_ATTN, ADD_FF] = [145, 216];

const normScale = matrix(2, 270, LINE, 205, { cols: 1, group: 1, rows: 6, role: "weight" });
const normShift = matrix(2, 280, LINE, 206, { cols: 1, group: 1, rows: 6, role: "weight" });
const logits = matrix(3, 320, LINE, 207, {
  cols: 4,
  group: 1,
  rows: 10,
  omittedRows: [4, 5],
});
const outHead = matrix(3, 320, LINE - 50, 208, { cols: 4, group: 4, rows: 3, role: "weight" });
const OVERVIEW_STEPS = [0, 1, 2, 3, 4];
const OVERVIEW_SCENE: Item[] = [
  ...PROMPT.flatMap((word, i) => chip(-1, 17, rowOf(table, table.pick[i]!), word)),
  ...PROMPT.map((_, i) => {
    const y = rowOf(table, table.pick[i]!);
    return wire(0, [29, y], [table.x0 - 1, y]);
  }),
  table,
  wire(0, [table.x1 + 1, LINE], [PLATE.x0 - 1, LINE]),

  plate(BACK),
  ...[8, 11, 14].map((o): Item => ({ kind: "join", step: 1, x: PLATE.x1 + o, z: -(LINE - o) })),
  plate(SECOND),
  {
    kind: "box",
    step: 1,
    label: "",
    container: true,
    x0: PLATE.x0,
    x1: PLATE.x1,
    z0: -PLATE.y1,
    z1: -PLATE.y0,
  },
  wire(1, [PLATE.x0 + 1, LINE], [85, LINE]),
  wire(1, [80, LINE], [80, ARC], [ADD_ATTN, ARC], [ADD_ATTN, LINE - 3.5]),
  sublayer(86, "norm1 · attn"),
  wire(1, [133, LINE], [ADD_ATTN - 3.5, LINE]),
  plus(ADD_ATTN),
  join(80),
  wire(1, [ADD_ATTN + 3.5, LINE], [156, LINE]),
  wire(1, [152, LINE], [152, ARC], [ADD_FF, ARC], [ADD_FF, LINE - 3.5]),
  sublayer(157, "norm2 · ff"),
  wire(1, [204, LINE], [ADD_FF - 3.5, LINE]),
  plus(ADD_FF),
  join(152),
  wire(1, [ADD_FF + 3.5, LINE], [PLATE.x1 - 1, LINE]),

  wire(
    2,
    [PLATE.x1 + BACK + 1, LINE - BACK],
    [PLATE.x1 + BACK + 8, LINE - BACK],
    [PLATE.x1 + BACK + 8, LINE],
    [normScale.x0 - 1, LINE],
  ),
  normScale,
  normShift,
  wire(3, [normShift.x1 + 1, LINE], [logits.x0 - 1, LINE]),
  wire(3, [middle(outHead), bottom(outHead) + 1], [middle(outHead), top(logits) - 1]),
  outHead,
  logits,
  { ...wire(4, [logits.x1 + 1, LINE], [361, LINE]), take: [3] } as Item,
  ...chip(4, 372, LINE, "a", 20),

  text(0, middle(table), bottom(table) + 9, "embedding"),
  {
    kind: "brace",
    step: 1,
    from: [PLATE.x0 - 2, -(PLATE.y0 - 2)],
    to: [PLATE.x0 + BACK - 2, -(PLATE.y0 - BACK - 2)],
  },
  text(1, PLATE.x0 + BACK / 2 - 8, PLATE.y0 - BACK / 2 - 6, "12", "end"),
  text(1, (PLATE.x0 + PLATE.x1) / 2 + BACK / 2, PLATE.y0 - BACK - 6, "trf_blocks"),
  ...[
    { n: "2", o: SECOND },
    { n: "12", o: BACK },
  ].map(({ n, o }) => text(1, PLATE.x1 + o + 3, PLATE.y1 - o + 7, n, "start")),
  text(1, PLATE.x1 - 2, PLATE.y1 + 9, "1", "end"),
  text(2, (normScale.x0 + normShift.x1) / 2, top(normScale) - 6, "final_norm"),
  text(3, middle(outHead), top(outHead) - 5, "out_head"),
  text(3, middle(logits), bottom(logits) + 9, "logits"),
  text(4, 372, LINE + 15, "next token"),
];

export function ModelDiagram() {
  return (
    <SceneDiagram
      source={OVERVIEW_SCENE}
      steps={OVERVIEW_STEPS}
      frameHeight={128.6}
      caption="MLM: Manik Language Model"
      description="The whole of mlm. Each token id looks up its row of tok_emb, plus its position's row of pos_emb. The result runs through twelve transformer blocks in turn, drawn as a stack: each adds attention to its input and then a feed-forward network to that, with a layer norm before each. final_norm follows, then out_head, which reuses tok_emb's weights, scores all 50,257 tokens at every position, and generate samples the next token from the last position's scores only."
    />
  );
}
