import {
  Curve,
  Dot,
  Guide,
  Label,
  Lines,
  Panel,
  Plot,
  fmt,
  plotPath,
  toPercent,
  type Domain,
} from "@/components/mlm/panel";

const X: Domain = [-3, 3];
const Y: Domain = [-3, 3];
const W = 0.75;
const B = 0.5;

export function LinearGraph() {
  return (
    <Panel
      title={`y = ${fmt(W)}·x + b`}
      legend={[{ label: "bias=True (out_proj)" }, { label: "bias=False (W_query)", dashed: true }]}
    >
      <Plot
        label={`Two lines with slope w = ${fmt(W)}. With bias b = ${fmt(B)}, like out_proj, the line crosses x = 0 at ${fmt(B)}. Without bias, like W_query, it passes through the origin.`}
      >
        <Guide y={100 - toPercent(0, Y)} />
        <Lines>
          <Curve d={plotPath((x) => W * x, X, Y, 1)} dashed />
          <Curve d={plotPath((x) => W * x + B, X, Y, 1)} />
        </Lines>
        <Dot x={toPercent(0, X)} y={100 - toPercent(0, Y)} dim />
        <Label x={toPercent(0, X)} y={100 - toPercent(0, Y)} className="pt-2 pl-2">
          (0, 0)
        </Label>
        <Dot x={toPercent(0, X)} y={100 - toPercent(B, Y)} />
        <Label
          x={toPercent(0, X)}
          y={100 - toPercent(B, Y)}
          className="-translate-x-full -translate-y-full pr-2 pb-1"
        >
          b = {fmt(B)}
        </Label>
      </Plot>
    </Panel>
  );
}
