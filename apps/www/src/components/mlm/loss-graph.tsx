import {
  Curve,
  Dot,
  Guide,
  Label,
  Lines,
  Panel,
  Plot,
  fmt,
  point,
  toPercent,
  type Domain,
} from "@/components/mlm/panel";

const X: Domain = [-0.05, 1.05];
const Y: Domain = [-2, 13];
const VOCAB = 50257;
const RANDOM = Math.log(VOCAB);

const PATH = Array.from({ length: 676 }, (_, index) => {
  const loss = 13.5 - index * 0.02;
  return `${index === 0 ? "M" : "L"}${point(toPercent(Math.exp(-loss), X), 100 - toPercent(loss, Y))}`;
}).join("");

function at(p: number) {
  return { x: toPercent(p, X), y: 100 - toPercent(-Math.log(p), Y) };
}

export function LossGraph() {
  return (
    <Panel title="Cross-entropy for one token: −ln p">
      <Plot
        label={`Loss −ln p against p, the probability given to the correct token. p = 0.5 gives ${fmt(-Math.log(0.5))}, p = 0.05 gives ${fmt(-Math.log(0.05))}, and a uniform guess over ${VOCAB} tokens gives ${fmt(RANDOM)}.`}
      >
        <Guide y={100 - toPercent(RANDOM, Y)} />
        <Label
          x={100}
          y={100 - toPercent(RANDOM, Y)}
          className="-translate-x-full -translate-y-full pr-2 pb-1"
        >
          random guess: ln({VOCAB}) ≈ {fmt(RANDOM)}
        </Label>
        <Lines>
          <Curve d={PATH} />
        </Lines>
        <Dot {...at(0.5)} />
        <Label {...at(0.5)} className="-translate-x-1/2 -translate-y-full pb-3">
          p 0.5 → {fmt(-Math.log(0.5))}
        </Label>
        <Dot {...at(0.05)} />
        <Label {...at(0.05)} className="-translate-y-full pb-2 pl-3">
          p 0.05 → {fmt(-Math.log(0.05))}
        </Label>
        {[0, 0.5, 1].map((tick) => (
          <Label
            key={tick}
            x={toPercent(tick, X)}
            y={100}
            className="-translate-x-1/2 -translate-y-4"
          >
            {tick}
          </Label>
        ))}
      </Plot>
    </Panel>
  );
}
