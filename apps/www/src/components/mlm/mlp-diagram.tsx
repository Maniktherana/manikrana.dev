import { SceneDiagram } from "@/components/mlm/scene-diagram";
import { noise, type Item } from "@/components/mlm/scene";
import { bottom, matrix, middle, text, wire, type Matrix } from "@/components/mlm/build";

// FeedForward: nn.Linear(768, 3072), GELU, nn.Linear(3072, 768), run on each token on its own.
// Every input feeds every hidden neuron, every hidden neuron applies GELU, and every hidden neuron
// feeds every output. Three of 768, five of 3072 and three of 768 are drawn.
type Neuron = Extract<Item, { kind: "neuron" }>;
const MLP_ZOOM = 1.18;
const COLUMNS = { input: 40, hidden: 170, output: 300 };
// The top neuron of each column is drawn larger with its function inside: x and out are linear, the
// hidden layer applies GELU.
const neurons = (
  step: number,
  x: number,
  ys: number[],
  r: number,
  glyph: "gelu" | "linear",
): Neuron[] =>
  ys.map((y, i) => ({
    kind: "neuron",
    step,
    x,
    z: -y,
    r: i === 0 ? r + 3 : r,
    value: 0.25 + 0.75 * noise(step + 32, i, 1),
    glyph: i === 0 ? glyph : undefined,
  }));
const INPUT = neurons(-1, COLUMNS.input, [78, 108, 164], 7, "linear");
const HIDDEN = neurons(0, COLUMNS.hidden, [50, 80, 108, 136, 192], 7.5, "gelu");
const OUTPUT = neurons(1, COLUMNS.output, [78, 108, 164], 7, "linear");
// Each Linear adds its bias: 3072 values into the hidden layer, 768 into out.
const hiddenBias = matrix(0, COLUMNS.hidden, 16, 117, {
  cols: 6,
  group: 6,
  rows: 1,
  role: "weight",
});
const outputBias = matrix(1, COLUMNS.output, 44, 118, {
  cols: 6,
  group: 6,
  rows: 1,
  role: "weight",
});

/** Every neuron of `from` to every neuron of `to`, edge to edge, so a signal arrives before its neuron lights. */
function connect(from: Neuron[], to: Neuron[]): Item[] {
  return from.flatMap((a, i) =>
    to.map((b, j): Item => {
      const distance = Math.hypot(b.x - a.x, b.z - a.z);
      const dx = (b.x - a.x) / distance;
      const dz = (b.z - a.z) / distance;
      return {
        kind: "wire",
        step: b.step,
        solid: true,
        delay: j * 160 + i * 90,
        pts: [
          [a.x + dx * (a.r + 0.6), a.z + dz * (a.r + 0.6)],
          [b.x - dx * (b.r + 0.6), b.z - dz * (b.r + 0.6)],
        ],
      };
    }),
  );
}

/** Three dots between two neurons of a column, for the ones not drawn. */
const ellipsis = (x: number, y: number): Item[] =>
  [-6, 0, 6].map((dy) => ({ kind: "join", step: -1, x, z: -(y + dy) }));

/** A bias block's wire into the top neuron below it, and its name and size to its left. */
function bias(m: Matrix, into: Neuron, size: string): Item[] {
  return [
    wire(m.step, [middle(m), bottom(m) + 1], [middle(m), -into.z - into.r - 1]),
    text(m.step, m.x0 - 3, -(m.z0 + m.z1) / 2 + 1, "bias", "end"),
    {
      kind: "text",
      step: m.step,
      x: m.x0 - 3,
      z: -(bottom(m) + 6),
      value: size,
      anchor: "end",
      tone: "shape",
    },
  ];
}

const MLP_STEPS = [0, 1];
const MLP_SCENE: Item[] = [
  ...connect(INPUT, HIDDEN),
  ...connect(HIDDEN, OUTPUT),
  ...bias(hiddenBias, HIDDEN[0]!, "(3072)"),
  ...bias(outputBias, OUTPUT[0]!, "(768)"),
  hiddenBias,
  outputBias,
  ...INPUT,
  ...HIDDEN,
  ...OUTPUT,
  ...ellipsis(COLUMNS.input, 136),
  ...ellipsis(COLUMNS.hidden, 164),
  ...ellipsis(COLUMNS.output, 136),
  text(0, COLUMNS.hidden + 14, 38, "GELU", "start"),
  // Each column is named for what it holds, just under its last neuron.
  ...[
    { column: INPUT, name: "x", size: "(768)", step: -1 },
    { column: HIDDEN, name: "hidden", size: "(3072)", step: 0 },
    { column: OUTPUT, name: "out", size: "(768)", step: 1 },
  ].flatMap(({ column, name, size, step }): Item[] => {
    const last = column.at(-1)!;
    const y = -last.z + last.r;
    return [
      text(step, last.x, y + 10, name),
      { kind: "text", step, x: last.x, z: -(y + 19), value: size, anchor: "middle", tone: "shape" },
    ];
  }),
];

export function MlpDiagram() {
  return (
    <SceneDiagram
      source={MLP_SCENE}
      steps={MLP_STEPS}
      frameHeight={224}
      zoom={MLP_ZOOM}
      caption="MLP block"
      description="The feed-forward network in mlm, run on each of the four tokens on its own. Every one of a token's 768 features connects to every one of 3072 hidden neurons, which add a bias of their own and apply GELU; every hidden neuron connects to every one of 768 outputs, which add their own bias and stay linear. Three, five and three neurons are drawn, with dots for the rest."
    />
  );
}
