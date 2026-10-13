import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { PauseIcon } from "@/components/icons/pause";
import { PlayIcon } from "@/components/icons/play";
import {
  DOT,
  LABEL,
  MARGIN,
  STEPS,
  dotX,
  noise,
  parts,
  scene,
  type Item,
} from "@/components/mlm/scene";

const WIDTH = 400;
const DEPTH = 0.55;
const DIM = 0.22;
const FILL = 260;
const SHIMMER = 700;
const HOLD = 2200;
const LAST_HOLD = 3600;

type State = "done" | "on" | "off";
type Point = [number, number];

function roundedRect([x0, y0]: Point, [x1, y1]: Point, r: number) {
  return `M${x0 + r},${y0}H${x1 - r}A${r},${r} 0 0 1 ${x1},${y0 + r}V${y1 - r}A${r},${r} 0 0 1 ${x1 - r},${y1}H${x0 + r}A${r},${r} 0 0 1 ${x0},${y1 - r}V${y0 + r}A${r},${r} 0 0 1 ${x0 + r},${y0}Z`;
}

/** Frames the steps' part of the scene in a WIDTH-wide view box, leaving room for the labels on the right. */
function layout(steps: number[]) {
  const items = scene.filter((item) => steps.includes(item.step));
  const flat = (x: number, y: number, z: number): Point => [x - DEPTH * y, -(z - DEPTH * y)];
  const points: Point[] = [];
  for (const item of items) {
    if (item.kind === "wire") points.push(...item.pts.map(([x, z]) => flat(x, 0, z)));
    else if (item.kind === "bar") points.push(flat(0, 0, item.z0), flat(56, 0, item.z1));
    else if (item.kind === "plus" || item.kind === "join")
      points.push(flat(item.x - 3, 0, item.z - 3), flat(item.x + 3, 0, item.z + 3));
    else if (item.kind === "matrix" || item.kind === "shell" || item.kind === "chip")
      points.push(
        flat(item.x0, item.kind === "shell" ? item.y : 0, item.z0),
        flat(item.x1, 0, item.z1),
      );
  }
  const texts = items.filter(
    (item): item is Extract<Item, { kind: "text" }> => item.kind === "text",
  );
  const labels = texts.filter((item) => item.x >= LABEL);
  const labelWidth = labels.length
    ? Math.max(...labels.map((item) => item.value.length * 4.8)) + 8
    : 0;
  const left = Math.min(
    ...points.map((p) => p[0]),
    ...texts.map((item) => item.x - (item.anchor === "end" ? item.value.length * 4 : 0)),
  );
  const right = Math.max(...points.map((p) => p[0]), labels.length ? LABEL : -Infinity);
  const scale = Math.min(2.6, (WIDTH - 32 - labelWidth) / (right - left));
  const ys = [...points.map((p) => p[1]), ...texts.map((item) => -item.z)];
  const ox = (WIDTH - labelWidth - (right - left) * scale) / 2 - left * scale;
  const oy = 28 - Math.min(...ys) * scale;
  const height = Math.ceil((Math.max(...ys) - Math.min(...ys)) * scale + 44);
  const at = (x: number, z: number, y = 0): Point => {
    const [fx, fy] = flat(x, y, z);
    return [ox + fx * scale, oy + fy * scale];
  };
  const rect = (x0: number, x1: number, z0: number, z1: number, y = 0, r = 2.4) =>
    roundedRect(at(x0, z1, y), at(x1, z0, y), r * scale);
  return { items, height, scale, at, rect };
}

/** How bright a dot is heading for, and after what delay, from its matrix's role and state. */
function brightness(
  item: Extract<Item, { kind: "matrix" }>,
  state: State,
  r: number,
  c: number,
  tick: number,
) {
  const v = 0.25 + 0.75 * noise(item.seed, r, c) ** 1.6;
  if (state === "off") return { o: DIM, delay: 0 };
  if (item.role === "pick") {
    const order = item.pick.indexOf(c);
    return { o: order < 0 ? DIM : 1, delay: state === "on" ? order * FILL : 0 };
  }
  if (state === "done") return { o: v, delay: 0 };
  if (item.role === "weight") {
    const phase = Math.floor(noise(item.seed, c, r) * 3);
    return {
      o: 0.25 + 0.75 * noise(item.seed, r, c, Math.floor((tick + phase) / 3)) ** 1.6,
      delay: 0,
    };
  }
  if (item.role === "scores") return { o: v, delay: r * FILL };
  return { o: v, delay: Math.floor(c / item.group) * FILL };
}

export function Diagram({ part }: { part: keyof typeof parts }) {
  const { steps, caption } = parts[part];
  const { items, height, scale, at, rect } = useMemo(() => layout(steps), [steps]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(-1);
  const [tick, setTick] = useState(0);
  const playing = inView && !paused && !reduced;

  useEffect(() => {
    if (!playing) return;
    const hold = step === steps.length - 1 ? LAST_HOLD : step < 0 ? 300 : HOLD;
    const timer = window.setTimeout(() => setStep((s) => (s + 1) % steps.length), hold);
    return () => window.clearTimeout(timer);
  }, [playing, step, steps.length]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTick((t) => t + 1), SHIMMER);
    return () => window.clearInterval(timer);
  }, [playing]);

  const stateOf = (item: Item): State => {
    const own = steps.indexOf(item.step);
    return step < 0 || own < step ? "done" : own === step ? "on" : "off";
  };
  const stroke = (state: State) =>
    cn(
      "transition-[stroke] duration-300 motion-reduce:transition-none",
      state === "on"
        ? "stroke-foreground"
        : state === "off"
          ? "stroke-muted-foreground/35"
          : "stroke-muted-foreground/70",
    );

  return (
    <figure className="my-8">
      <div ref={ref} className="rounded-3xl bg-card">
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          aria-hidden="true"
          className="block w-full font-mono [&_path]:[vector-effect:non-scaling-stroke] [&_path]:[stroke-width:0.6]"
        >
          {items.map((item, index) => {
            const state = stateOf(item);
            if (item.kind === "matrix" || item.kind === "shell" || item.kind === "chip") {
              const outline = (
                <path
                  d={rect(
                    item.x0,
                    item.x1,
                    item.z0,
                    item.z1,
                    item.kind === "shell" ? item.y : 0,
                    item.kind === "chip" ? 2.6 : 2.4,
                  )}
                  className={cn("fill-card", stroke(state))}
                />
              );
              if (item.kind !== "matrix") return <g key={index}>{outline}</g>;
              return (
                <g key={index}>
                  {outline}
                  {Array.from({ length: item.rows * item.cols }, (_, n) => {
                    const r = Math.floor(n / item.cols),
                      c = n % item.cols;
                    const [cx, cy] = at(
                      item.x0 + dotX(c, item.group),
                      item.z1 - MARGIN - (r + 0.5) * DOT,
                    );
                    if (item.role === "scores" && c > r) {
                      const k = scale;
                      return (
                        <path
                          key={n}
                          d={`M${cx - k},${cy - k}L${cx + k},${cy + k}M${cx - k},${cy + k}L${cx + k},${cy - k}`}
                          className="fill-none stroke-muted-foreground/40"
                        />
                      );
                    }
                    const { o, delay } = brightness(item, state, r, c, tick);
                    return (
                      <circle
                        key={n}
                        cx={cx}
                        cy={cy}
                        r={0.85 * scale}
                        style={{ "--o": o.toFixed(3), "--delay": `${delay}ms` } as CSSProperties}
                        className="fill-foreground opacity-(--o) transition-opacity delay-(--delay) duration-700 ease-out motion-reduce:transition-none"
                      />
                    );
                  })}
                </g>
              );
            }
            if (item.kind === "wire") {
              const d = item.pts
                .map(([x, z], i) => `${i ? "L" : "M"}${at(x, z).join(",")}`)
                .join("");
              return (
                <path
                  key={index}
                  d={d}
                  strokeDasharray="1 3"
                  className={cn(
                    "fill-none transition-[stroke] duration-300",
                    state === "off" ? "stroke-muted-foreground/25" : "stroke-muted-foreground/60",
                  )}
                />
              );
            }
            if (item.kind === "join") {
              const [cx, cy] = at(item.x, item.z);
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={0.9 * scale}
                  className="fill-muted-foreground"
                />
              );
            }
            if (item.kind === "plus") {
              const [cx, cy] = at(item.x, item.z);
              const k = 1.3 * scale;
              return (
                <g key={index}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={2.6 * scale}
                    className={cn(
                      "fill-card [stroke-width:0.6] [vector-effect:non-scaling-stroke]",
                      stroke(state),
                    )}
                  />
                  <path
                    d={`M${cx - k},${cy}H${cx + k}M${cx},${cy - k}V${cy + k}`}
                    className={cn("fill-none", stroke(state))}
                  />
                </g>
              );
            }
            if (item.kind === "bar") {
              const grow = state === "off" ? 0 : 1;
              return (
                <path
                  key={index}
                  d={rect(0, item.p * 160, item.z0, item.z1, 0, 1.2)}
                  style={
                    {
                      "--grow": grow,
                      "--delay": `${state === "on" ? item.i * 90 : 0}ms`,
                    } as CSSProperties
                  }
                  className={cn(
                    "origin-left scale-x-(--grow) fill-card transition-[scale,stroke] delay-(--delay) duration-500 ease-out [transform-box:fill-box] motion-reduce:transition-none",
                    stroke(state),
                  )}
                />
              );
            }
            const [tx, ty] = at(item.x, item.z);
            return (
              <text
                key={index}
                x={tx}
                y={ty}
                textAnchor={item.anchor}
                className={cn(
                  "transition-[fill,opacity] duration-300",
                  item.tone === "chip"
                    ? "fill-foreground text-[6px]"
                    : item.tone === "name"
                      ? "fill-control-foreground text-[8px]"
                      : "fill-muted-foreground text-[6.5px]",
                  state === "on" && "fill-foreground",
                  state === "off" && "opacity-50",
                )}
              >
                {item.value}
              </text>
            );
          })}
        </svg>
        <div className="sticky bottom-0 flex min-h-12 items-center gap-3 rounded-b-3xl bg-card ps-5 pe-2">
          <output className="min-w-0 flex-1 truncate font-mono text-xs text-control-foreground">
            {step < 0 ? "" : STEPS[steps[step]!]}
          </output>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={paused ? "Play" : "Pause"}
            className="motion-reduce:hidden"
            onClick={() => setPaused(!paused)}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
          </Button>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-pretty text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
