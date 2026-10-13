import { Curve, Lines, Panel, Plot, fmt, plotPath, type Domain } from "@/components/chart";

const X: Domain = [-4, 4];
const Y: Domain = [-1, 4];

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
    <Panel caption="GELU and ReLU">
      <Plot
        label={`GELU and ReLU from x = −4 to 4. Unlike ReLU, GELU dips below zero, to ${fmt(gelu(DIP))} at x = ${fmt(DIP)}.`}
        x={X}
        y={Y}
        xTicks={[-2, 2]}
        yTicks={[2]}
        bleed
        legend={[{ label: "GELU" }, { label: "ReLU", dashed: true }]}
      >
        <Lines>
          <Curve d={plotPath(relu, X, Y)} dashed />
          <Curve d={plotPath(gelu, X, Y)} />
        </Lines>
      </Plot>
    </Panel>
  );
}
