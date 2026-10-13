import {
  Curve,
  Dot,
  Label,
  Lines,
  Panel,
  Plot,
  fmt,
  point,
  toPercent,
  type Domain,
} from "@/components/mlm/panel";
import { train, val } from "@/components/mlm/training";

const X: Domain = [0, 61];
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
    <Panel
      title="My run: loss every 1000 steps"
      legend={[{ label: "train" }, { label: "validation", dashed: true }]}
    >
      <Plot
        label={`Training and validation loss over ${last},000 steps. Train loss falls from ${fmt(train[0]!)} at step 1000 to ${fmt(train[last - 1]!)}, validation from ${fmt(val[0]!)} to ${fmt(val[last - 1]!)}.`}
      >
        <Lines>
          <Curve d={path(val)} dashed />
          <Curve d={path(train)} />
        </Lines>
        <Dot x={toPercent(1, X)} y={100 - toPercent(train[0]!, Y)} />
        <Label x={toPercent(1, X)} y={100 - toPercent(train[0]!, Y)} className="pt-1 pl-3">
          {fmt(train[0]!)}
        </Label>
        <Dot x={toPercent(last, X)} y={100 - toPercent(val[last - 1]!, Y)} />
        <Label
          x={toPercent(last, X)}
          y={100 - toPercent(val[last - 1]!, Y)}
          className="-translate-x-full -translate-y-full pr-2 pb-2"
        >
          val {fmt(val[last - 1]!)}
        </Label>
        {[20, 40, 60].map((tick) => (
          <Label
            key={tick}
            x={toPercent(tick, X)}
            y={100}
            className="-translate-x-1/2 -translate-y-4"
          >
            {tick}k
          </Label>
        ))}
        {[4, 6, 8].map((tick) => (
          <Label key={tick} x={0} y={100 - toPercent(tick, Y)} className="-translate-y-1/2 pl-2">
            {tick}
          </Label>
        ))}
      </Plot>
    </Panel>
  );
}
