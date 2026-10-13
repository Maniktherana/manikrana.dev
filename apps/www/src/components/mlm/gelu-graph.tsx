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

const X: Domain = [-4, 4];
const Y: Domain = [-1.25, 4.25];

function gelu(x: number) {
  return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
}

function relu(x: number) {
  return Math.max(0, x);
}

const DIP = Array.from({ length: 401 }, (_, index) => -2 + index / 200).reduce((low, x) =>
  gelu(x) < gelu(low) ? x : low,
);

export function GeluGraph() {
  return (
    <Panel title="GELU vs ReLU" legend={[{ label: "GELU" }, { label: "ReLU", dashed: true }]}>
      <Plot
        label={`GELU and ReLU from x = −4 to 4. Unlike ReLU, GELU dips below zero, to ${fmt(gelu(DIP))} at x = ${fmt(DIP)}.`}
      >
        <Guide y={100 - toPercent(0, Y)} />
        <Lines>
          <Curve d={plotPath(relu, X, Y)} dashed />
          <Curve d={plotPath(gelu, X, Y)} />
        </Lines>
        <Dot x={toPercent(DIP, X)} y={100 - toPercent(gelu(DIP), Y)} />
        <Label
          x={toPercent(DIP, X)}
          y={100 - toPercent(gelu(DIP), Y)}
          className="-translate-x-1/2 pt-2"
        >
          {fmt(gelu(DIP))}
        </Label>
        {[-2, 0, 2].map((tick) => (
          <Label
            key={tick}
            x={toPercent(tick, X)}
            y={100}
            className="-translate-x-1/2 -translate-y-4"
          >
            {fmt(tick, 0)}
          </Label>
        ))}
        {[2, 4].map((tick) => (
          <Label key={tick} x={0} y={100 - toPercent(tick, Y)} className="-translate-y-1/2 pl-2">
            {tick}
          </Label>
        ))}
      </Plot>
    </Panel>
  );
}
