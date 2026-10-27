import { SceneDiagram } from "@/components/mlm/scene-diagram";
import { type Item } from "@/components/mlm/scene";
import { bottom, matrix, middle, shape, text, top, wire } from "@/components/mlm/build";

const NORM_Y = 70;
const NORM_ZOOM = 1.6;
const normX = matrix(-1, 33.75, NORM_Y, 101, { rows: 6 });
const normalized = matrix(1, 131.75, NORM_Y, 104, { rows: 6 });
const STATS_X = (normX.x1 + normalized.x0) / 2;
const mean = matrix(0, STATS_X, 22, 102, { cols: 4, group: 1, rows: 1 });
const variance = matrix(0, STATS_X, 38, 103, { cols: 4, group: 1, rows: 1 });
const scale = matrix(-1, 201.75, 26, 105, { cols: 1, group: 1, rows: 6, role: "weight" });
const shift = matrix(-1, 223.75, 26, 106, { cols: 1, group: 1, rows: 6, role: "weight" });
const normOut = matrix(2, 212.75, NORM_Y, 107, { rows: 6 });
const NORM_STEPS = [0, 1, 2];
const NORM_SCENE: Item[] = [
  wire(0, [middle(normX) - 8, top(normX) - 1], [middle(normX) - 8, 22], [mean.x0 - 1, 22]),
  wire(0, [middle(normX) + 8, top(normX) - 1], [middle(normX) + 8, 38], [variance.x0 - 1, 38]),
  wire(1, [normX.x1 + 1, NORM_Y], [normalized.x0 - 1, NORM_Y]),
  wire(
    1,
    [mean.x1 + 1, 22],
    [middle(normalized) + 8, 22],
    [middle(normalized) + 8, top(normalized) - 1],
  ),
  wire(
    1,
    [variance.x1 + 1, 38],
    [middle(normalized) - 8, 38],
    [middle(normalized) - 8, top(normalized) - 1],
  ),
  wire(2, [normalized.x1 + 1, NORM_Y], [normOut.x0 - 1, NORM_Y]),
  wire(2, [middle(scale), bottom(scale) + 1], [middle(scale), top(normOut) - 1]),
  wire(2, [middle(shift), bottom(shift) + 1], [middle(shift), top(normOut) - 1]),
  normX,
  mean,
  variance,
  normalized,
  scale,
  shift,
  normOut,
  text(0, mean.x0, bottom(mean) + 4.75, "mean", "start"),
  shape(0, mean, "(4, 1)", "right", 4.75),
  text(0, variance.x0, bottom(variance) + 4.75, "var", "start"),
  shape(0, variance, "(4, 1)", "right", 4.75),
  text(-1, scale.x0 - 2.5, 24, "scale", "end"),
  {
    kind: "text",
    step: -1,
    x: scale.x0 - 2.5,
    z: -30,
    value: "(768)",
    anchor: "end",
    tone: "shape",
  },
  text(-1, shift.x1 + 2.5, 24, "shift", "start"),
  {
    kind: "text",
    step: -1,
    x: shift.x1 + 2.5,
    z: -30,
    value: "(768)",
    anchor: "start",
    tone: "shape",
  },
  ...[
    { m: normX, name: "x", step: -1 },
    { m: normalized, name: "norm_x", step: 1 },
    { m: normOut, name: "out", step: 2 },
  ].flatMap(({ m, name, step }) => [
    text(step, m.x0, bottom(m) + 6, name, "start"),
    shape(step, m, "(4, 768)"),
  ]),
];

export function LayerNormDiagram() {
  return (
    <SceneDiagram
      source={NORM_SCENE}
      steps={NORM_STEPS}
      frameHeight={104}
      zoom={NORM_ZOOM}
      caption="Layer norm"
      description="LayerNorm in mlm. For each of the four tokens, the mean and variance of its 768 features are taken, the token is shifted by its mean and divided by the square root of its variance plus 1e-5, then multiplied by the learned scale and offset by the learned shift, both 768 long and shared by every token. The output has the same shape as the input."
    />
  );
}
