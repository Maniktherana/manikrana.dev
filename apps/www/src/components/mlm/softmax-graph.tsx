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

const X: Domain = [-24, 24];
const Y: Domain = [-0.2, 1.2];
const SCALE = Math.sqrt(64);
const GAP = 8;

function weight(gap: number, divisor: number) {
  return 1 / (1 + Math.exp(-gap / divisor));
}

export function SoftmaxGraph() {
  const scaled = weight(GAP, SCALE);
  const raw = weight(GAP, 1);

  return (
    <Panel
      title="Softmax over two keys, by score gap Δ"
      legend={[{ label: "÷ √64" }, { label: "no scaling", dashed: true }]}
    >
      <Plot
        label={`Weight on key A against the score gap Δ = sA − sB, from −24 to 24. Divided by √64, a gap of ${GAP} gives ${fmt(scaled)}. Without scaling it gives ${fmt(raw)}, so the curve is almost a step.`}
      >
        <Guide y={100 - toPercent(0.5, Y)} />
        <Lines>
          <Curve d={plotPath((gap) => weight(gap, 1), X, Y, 480)} dashed />
          <Curve d={plotPath((gap) => weight(gap, SCALE), X, Y)} />
        </Lines>
        <Dot x={toPercent(GAP, X)} y={100 - toPercent(raw, Y)} dim />
        <Label
          x={toPercent(GAP, X)}
          y={100 - toPercent(raw, Y)}
          className="-translate-x-1/2 -translate-y-full pb-3"
        >
          {fmt(raw)}
        </Label>
        <Dot x={toPercent(GAP, X)} y={100 - toPercent(scaled, Y)} />
        <Label x={toPercent(GAP, X)} y={100 - toPercent(scaled, Y)} className="pt-2 pl-3">
          Δ = {GAP} → {fmt(scaled)}
        </Label>
        {[-12, 0, 12].map((tick) => (
          <Label
            key={tick}
            x={toPercent(tick, X)}
            y={100}
            className="-translate-x-1/2 -translate-y-4"
          >
            {fmt(tick, 0)}
          </Label>
        ))}
        <Label x={0} y={100 - toPercent(1, Y)} className="-translate-y-1/2 pl-2">
          1
        </Label>
        <Label x={0} y={100 - toPercent(0.5, Y)} className="-translate-y-full pb-1 pl-2">
          0.5
        </Label>
      </Plot>
    </Panel>
  );
}
