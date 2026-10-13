import { Curve, Lines, Panel, Plot, fmt, point, toPercent, type Domain } from "@/components/chart";
import { train, val } from "@/components/mlm/training";

const X: Domain = [0, 64];
const Y: Domain = [3.4, 8.2];

const path = (losses: number[]) =>
  losses
    .map(
      (loss, i) => `${i === 0 ? "M" : "L"}${point(toPercent(i + 1, X), 100 - toPercent(loss, Y))}`,
    )
    .join("");

export function TrainingGraph() {
  const last = train.length;
  return (
    <Panel caption="My run: train and validation loss every 1000 steps">
      <Plot
        label={`Training and validation loss over ${last},000 steps. Train loss falls from ${fmt(train[0]!)} at step 1000 to ${fmt(train[last - 1]!)}, validation from ${fmt(val[0]!)} to ${fmt(val[last - 1]!)}.`}
        x={X}
        y={Y}
        xLabel="step"
        yLabel="loss"
        xTicks={[20, 40, 60]}
        yTicks={[4, 6, 8]}
        xTick={(tick) => `${tick}k`}
        legend={[{ label: "train" }, { label: "validation", dashed: true }]}
        legendAt="end"
        tall
      >
        <Lines>
          <Curve d={path(val)} dashed />
          <Curve d={path(train)} />
        </Lines>
      </Plot>
    </Panel>
  );
}
