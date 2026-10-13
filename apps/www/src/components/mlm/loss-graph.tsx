import { Curve, Lines, Panel, Plot, fmt, point, toPercent, type Domain } from "@/components/chart";

const X: Domain = [0, 1.05];
const Y: Domain = [0, 13];

const PATH = Array.from({ length: 676 }, (_, index) => {
  const loss = 13.5 - index * 0.02;
  return `${index === 0 ? "M" : "L"}${point(toPercent(Math.exp(-loss), X), 100 - toPercent(loss, Y))}`;
}).join("");

export function LossGraph() {
  return (
    <Panel caption="Cross-entropy for one token: −ln p, against the probability p given to the right token">
      <Plot
        label={`Loss −ln p against p, the probability given to the correct token. p = 0.5 gives ${fmt(-Math.log(0.5))} and p = 0.05 gives ${fmt(-Math.log(0.05))}.`}
        x={X}
        y={Y}
        xLabel="p"
        yLabel="loss"
        xTicks={[0.5, 1]}
        yTicks={[5, 10]}
        xTick={(tick) => String(tick)}
      >
        <Lines>
          <Curve d={PATH} />
        </Lines>
      </Plot>
    </Panel>
  );
}
