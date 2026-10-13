import { Curve, Lines, Panel, Plot, fmt, plotPath, type Domain } from "@/components/chart";

const X: Domain = [-24, 24];
const Y: Domain = [0, 1.1];
const SCALE = Math.sqrt(64);

function weight(gap: number, divisor: number) {
  return 1 / (1 + Math.exp(-gap / divisor));
}

export function SoftmaxGraph() {
  return (
    <Panel caption="Softmax over two keys: the weight on one, by the gap between their scores">
      <Plot
        label={`Weight on key A against the score gap sA − sB, from −24 to 24. Divided by √64, a gap of 8 gives ${fmt(weight(8, SCALE))}. Without scaling it gives ${fmt(weight(8, 1))}, so the curve is almost a step.`}
        x={X}
        y={Y}
        xLabel="score gap"
        yLabel="weight"
        xTicks={[-12, 12]}
        yTicks={[1]}
        yTick={(tick) => String(tick)}
        legend={[{ label: "÷ √64" }, { label: "no scaling", dashed: true }]}
      >
        <Lines>
          <Curve d={plotPath((gap) => weight(gap, 1), X, Y, 480)} dashed />
          <Curve d={plotPath((gap) => weight(gap, SCALE), X, Y)} />
        </Lines>
      </Plot>
    </Panel>
  );
}
