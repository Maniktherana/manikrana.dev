import { Curve, Lines, Panel, Plot, fmt, plotPath, type Domain } from "@/components/chart";

const X: Domain = [-4, 4];
const Y: Domain = [-2, 4];
const W = 0.5;
const B = 1;

export function LinearGraph() {
  return (
    <Panel caption={`y = ${W}·x + b, with and without a bias`}>
      <Plot
        label={`Two lines with slope w = ${fmt(W)}. With bias b = ${fmt(B)}, like out_proj, the line crosses x = 0 at ${fmt(B)}. Without bias, like W_query, it passes through the origin.`}
        x={X}
        y={Y}
        xTicks={[-2, 2]}
        yTicks={[2]}
        bleed
        legend={[
          { label: "bias=True (out_proj)" },
          { label: "bias=False (W_query)", dashed: true },
        ]}
      >
        <Lines>
          <Curve d={plotPath((x) => W * x, X, Y, 1)} dashed />
          <Curve d={plotPath((x) => W * x + B, X, Y, 1)} />
        </Lines>
      </Plot>
    </Panel>
  );
}
