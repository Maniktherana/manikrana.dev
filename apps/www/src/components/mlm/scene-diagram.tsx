import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { BAR, DOT, STACK, LABEL, MARGIN, dotX, noise, type Item } from "@/components/mlm/scene";

const WIDTH = 400;
/** Space above and below a laid-out diagram, in view box units. */
const PADDING = 22;
/** Label sizes by tone, in view box units, matching the classes they render with. */
const TEXT_SIZE = { chip: 6, name: 8, dim: 6.5, shape: 5.5 } as const;
const DEPTH = 0.55;
const DIM = 0.1;
/** Without a matrix at its start, a wire carries one packet per token of “<bos> The cat is”. */
const TOKENS = 4;
const REACH = 4;
const LANDS = 6;
const SPEED = 150;
const ARRIVE = 700;
const STAGGER = 120;
const TOKEN_GAP = 160;
const SETTLE = 1000;

const lengthOf = (points: Point[]) =>
  points.reduce(
    (sum, point, index) =>
      index
        ? sum + Math.hypot(point[0] - points[index - 1]![0], point[1] - points[index - 1]![1])
        : sum,
    0,
  );
/** How far behind the front plate a stacked head sits, so the back one reaches STACK up and right. */
const behind = (level: number, offset?: number) =>
  offset === undefined ? (-(2 - level) * STACK) / (2 * DEPTH) : -offset / DEPTH;
const FILL = 260;
const HOLD = 2600;
const LAST_HOLD = 3600;

type State = "done" | "on" | "off";
type Point = [number, number];
type Matrix = Extract<Item, { kind: "matrix" }>;
type Wire = Extract<Item, { kind: "wire" }>;

/** How far a point lies outside a box in the scene's x and z. */
const outside = (
  { x0, x1, z0, z1 }: { x0: number; x1: number; z0: number; z1: number },
  [x, z]: Point,
) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1));

/** The matrix or ⊕ at a point, by its index in `items`: a matrix within `reach` of its box, or a ⊕ within `reach` of its centre. */
function nodeAt(items: Item[], point: Point, reach: number, step?: number) {
  return items
    .map((item, index) => ({
      index,
      gap:
        step !== undefined && item.step !== step
          ? Infinity
          : item.kind === "matrix"
            ? outside(item, point)
            : item.kind === "plus"
              ? Math.max(Math.hypot(item.x - point[0], item.z - point[1]) - 3.5, 0)
              : item.kind === "neuron"
                ? Math.max(Math.hypot(item.x - point[0], item.z - point[1]) - item.r, 0)
                : item.kind === "box" && !item.container
                  ? outside(item, point)
                  : Infinity,
    }))
    .filter(({ gap }) => gap < reach)
    .sort((a, b) => a.gap - b.gap)[0]?.index;
}

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

/**
 * What runs down a wire, as scene points. A wire from a token chip carries that one id. A wire from an
 * activation carries one packet per column it reads (all of them, or the ones it takes), each peeling off
 * that column's dot nearest the wire; from the score grid, one per row. A weight never changes, so what leaves it is the transformed
 * activation, one packet per token, and so is what leaves a ⊕ or a branch.
 */
function packetsOf(wire: Wire, items: Item[]) {
  const start = wire.pts[0]!;
  const chip = items
    .filter((item) => item.kind === "chip")
    .findIndex((item) => outside(item, start) < REACH);
  if (chip >= 0) return [{ pts: wire.pts, delay: chip * (STAGGER + TOKEN_GAP) }];
  const at = nodeAt(items, start, REACH);
  const source = at === undefined ? undefined : items[at];
  if (source?.kind === "neuron") return [{ pts: wire.pts, delay: wire.delay ?? 0 }];
  if (source?.kind !== "matrix" || source.role === "weight")
    return range(TOKENS).map((index) => ({
      pts: wire.pts,
      delay: index * (STAGGER + TOKEN_GAP),
    }));
  // Row i of the score grid is token i's attention, and a lookup by row hands over the rows it picked:
  // either way, what leaves is one packet per row.
  if (source.role === "scores" || (source.role === "pick" && source.per === "row"))
    return (source.role === "pick" ? source.pick : range(source.rows)).map((r, index) => {
      const z = source.z1 - MARGIN - (r + 0.5) * DOT;
      const x = range(source.role === "pick" ? source.cols : r + 1)
        .map((c) => source.x0 + dotX(c, source.group))
        .sort(
          (a, b) => Math.hypot(a - start[0], z - start[1]) - Math.hypot(b - start[0], z - start[1]),
        )[0]!;
      return { pts: [[x, z] as Point, ...wire.pts], delay: index * (STAGGER + TOKEN_GAP) };
    });
  return (wire.take ?? range(source.cols)).map((c, index) => {
    const x = source.x0 + dotX(c, source.group);
    const z = range(source.rows)
      .map((r) => source.z1 - MARGIN - (r + 0.5) * DOT)
      .sort(
        (a, b) => Math.hypot(x - start[0], a - start[1]) - Math.hypot(x - start[0], b - start[1]),
      )[0]!;
    return {
      pts: [[x, z] as Point, ...wire.pts],
      delay: wire.take
        ? index * (STAGGER + TOKEN_GAP)
        : c * STAGGER + Math.floor(c / source.group) * TOKEN_GAP,
    };
  });
}

/** The parts a matrix lights up in as data arrives: tokens, columns or rows. */
function unitsOf(item: Matrix) {
  if (item.per === "row") return item.role === "pick" ? item.pick.length : item.rows;
  if (item.per === "col") return item.role === "pick" ? item.pick.length : item.cols;
  return Math.ceil(item.cols / item.group);
}

function unitOf(item: Matrix, r: number, c: number) {
  if (item.per === "row") return item.role === "pick" ? item.pick.indexOf(r) : r;
  if (item.per === "col") return item.role === "pick" ? item.pick.indexOf(c) : c;
  return Math.floor(c / item.group);
}

/** The landing time that lights part `unit` of `units` on one input: the last packet of its share. */
const landingOf = (times: number[], unit: number, units: number) =>
  times[Math.min(Math.ceil(((unit + 1) / units) * times.length) - 1, times.length - 1)]!;

/** A part lights once every input has delivered its share: a sum waits for both of its operands. */
const landing = (inputs: number[][], unit: number, units: number) =>
  Math.max(...inputs.map((times) => landingOf(times, unit, units)));

/**
 * The active step as a timeline, following the data. A wire leaves once what it reads is ready: a
 * matrix or ⊕ in this step when everything coming into it has landed, anything earlier at once. A
 * matrix lights each part once every wire into it has delivered that part, so a residual sum waits
 * for both the block's output and the shortcut. Wires that each carry a share of the parts (one id
 * each into tok_emb) count as one input. pos_emb, with nothing coming in, lights alongside tok_emb:
 * token i and position i are looked up together.
 */
function timingOf(items: Item[], step: number, at: (x: number, z: number) => Point) {
  type Packet = { pts: Point[]; delay: number; lands: number };
  const wires = new Map<number, { packets: Packet[]; travel: number }>();
  const into = new Map<number, Packet[][]>();
  let pending = items
    .map((item, index) => ({ item, index }))
    .filter(
      (entry): entry is { item: Wire; index: number } =>
        entry.item.kind === "wire" && entry.item.step === step,
    )
    .map((entry) => ({
      ...entry,
      from: nodeAt(items, entry.item.pts[0]!, REACH),
      to: nodeAt(items, entry.item.pts.at(-1)!, LANDS, step),
    }));

  const isPick = (index: number) => {
    const item = items[index]!;
    return item.kind === "matrix" && item.role === "pick";
  };
  const partner = (index: number) =>
    [...into.keys()].find((key) => key !== index && isPick(key) && isPick(index));
  const waiting = (index: number) =>
    pending.some(
      (wire) =>
        wire.to === index ||
        (isPick(index) && wire.to !== undefined && wire.to !== index && isPick(wire.to)),
    );
  const finishOf = (index: number | undefined) => {
    if (index === undefined || items[index]!.step !== step) return 0;
    const packets = into.get(index) ?? into.get(partner(index) ?? -1);
    return Math.max(0, ...(packets ?? []).flat().map((packet) => packet.lands));
  };

  while (pending.length) {
    const ready = pending.filter(
      ({ from }) => from === undefined || items[from]!.step !== step || !waiting(from),
    );
    const batch = ready.length ? ready : pending.slice(0, 1);
    for (const { item, index, from, to } of batch) {
      const leaves = finishOf(from);
      const packets = packetsOf(item, items).map(({ pts, delay }) => ({
        pts,
        delay: leaves + delay,
        lands: 0,
      }));
      const longest = Math.max(
        ...packets.map(({ pts }) => lengthOf(pts.map(([x, z]) => at(x, z)))),
      );
      const travel = Math.min(Math.max(longest / SPEED, 0.7), 1.6);
      for (const packet of packets) packet.lands = packet.delay + travel * 1000;
      wires.set(index, { packets, travel });
      if (to !== undefined) into.set(to, [...(into.get(to) ?? []), packets]);
    }
    pending = pending.filter((wire) => !batch.includes(wire));
  }

  const lands = new Map<number, number[][]>();
  items.forEach((item, index) => {
    if ((item.kind !== "matrix" && item.kind !== "neuron") || item.step !== step) return;
    const inputs = into.get(index) ?? into.get(partner(index) ?? -1);
    if (!inputs) return;
    const units = item.kind === "neuron" ? 1 : unitsOf(item);
    const shares = inputs.filter((packets) => packets.length < units).flat();
    const whole = inputs.filter((packets) => packets.length >= units);
    lands.set(
      index,
      [...whole, ...(shares.length ? [shares] : [])].map((packets) =>
        packets.map((packet) => packet.lands).sort((a, b) => a - b),
      ),
    );
  });
  const latest = Math.max(0, ...[...lands.values()].flat(2));
  return { wires, lands, latest };
}

function roundedRect([x0, y0]: Point, [x1, y1]: Point, r: number) {
  return `M${x0 + r},${y0}H${x1 - r}A${r},${r} 0 0 1 ${x1},${y0 + r}V${y1 - r}A${r},${r} 0 0 1 ${x1 - r},${y1}H${x0 + r}A${r},${r} 0 0 1 ${x0},${y1 - r}V${y0 + r}A${r},${r} 0 0 1 ${x0 + r},${y0}Z`;
}

/** Frames the steps' part of the scene in a WIDTH-wide view box, leaving room for the labels on the right. */
function layout(steps: number[], source: Item[], frameHeight?: number, zoom = 1) {
  const items = source.filter((item) => item.step < 0 || steps.includes(item.step));
  // A laid-out scene in view box units, scaled by `zoom`: geometry and dots grow, text keeps its size.
  if (frameHeight !== undefined) {
    const at = (x: number, z: number, y = 0): Point => [
      (x - DEPTH * y) * zoom,
      (-z + DEPTH * y) * zoom,
    ];
    const rect = (x0: number, x1: number, z0: number, z1: number, y = 0, r = 2.4) =>
      roundedRect(at(x0, z1, y), at(x1, z0, y), r * zoom);
    return { items, height: Math.ceil(frameHeight * zoom), scale: zoom, at, rect };
  }
  const flat = (x: number, y: number, z: number): Point => [x - DEPTH * y, -(z - DEPTH * y)];
  const points: Point[] = [];
  for (const item of items) {
    if (item.kind === "wire") points.push(...item.pts.map(([x, z]) => flat(x, 0, z)));
    else if (item.kind === "bar") points.push(flat(0, 0, item.z0), flat(56, 0, item.z1));
    else if (item.kind === "brace")
      points.push(flat(item.from[0], 0, item.from[1]), flat(item.to[0] + 5, 0, item.to[1]));
    else if (item.kind === "plus" || item.kind === "join")
      points.push(flat(item.x - 3, 0, item.z - 3), flat(item.x + 3, 0, item.z + 3));
    else if (item.kind === "matrix" || item.kind === "shell" || item.kind === "chip")
      points.push(
        flat(item.x0, item.kind === "shell" ? behind(item.level, item.offset) : 0, item.z0),
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
  // Vertical extent on screen, with each label's real height: it rises about 3/4 of its size above
  // the baseline and drops 1/4 below. The same padding then goes above and below.
  const tops = [
    ...points.map((p) => p[1] * scale),
    ...texts.map((item) => -item.z * scale - TEXT_SIZE[item.tone] * 0.75),
  ];
  const bottoms = [
    ...points.map((p) => p[1] * scale),
    ...texts.map((item) => -item.z * scale + TEXT_SIZE[item.tone] * 0.25),
  ];
  const ox = (WIDTH - labelWidth - (right - left) * scale) / 2 - left * scale;
  const oy = PADDING - Math.min(...tops);
  const height = Math.ceil(Math.max(...bottoms) - Math.min(...tops) + 2 * PADDING);
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
  item: Matrix,
  state: State,
  r: number,
  c: number,
  lands: number[][] | undefined,
  latest: number,
) {
  const v = item.values
    ? 0.08 + 0.92 * (item.values[r]?.[c] ?? 0)
    : 0.12 + 0.88 * noise(item.seed, r, c) ** 2.2;
  if (state === "off") return { o: DIM, delay: 0 };
  const unit = unitOf(item, r, c);
  if (item.role === "pick") {
    return {
      o: unit < 0 ? DIM : state === "on" ? 1 : 0.55,
      delay:
        state !== "on" || unit < 0 ? 0 : lands ? landing(lands, unit, unitsOf(item)) : unit * FILL,
    };
  }
  if (state === "done") return { o: v * 0.55, delay: 0 };
  if (item.role === "weight") return { o: v, delay: 0 };
  const base = latest ? latest + FILL : ARRIVE;
  return { o: v, delay: lands ? landing(lands, unit, unitsOf(item)) : base + unit * FILL };
}

/** Shared matrix styling and dependency-driven playback for every model diagram. */
export function SceneDiagram({
  source,
  steps,
  caption,
  description,
  frameHeight,
  zoom,
  labels,
}: {
  source: Item[];
  steps: number[];
  caption: string;
  description?: string;
  frameHeight?: number;
  /** How much a laid-out scene is scaled up to fill the frame. */
  zoom?: number;
  labels?: ReactNode;
}) {
  const { items, height, scale, at, rect } = useMemo(
    () => layout(steps, source, frameHeight, zoom),
    [steps, source, frameHeight, zoom],
  );
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(-1);
  const playing = inView && !reduced;
  const timing = useMemo(
    () => timingOf(items, step < 0 ? -1 : steps[step]!, (x, z) => at(x, z)),
    [items, step, steps, at],
  );
  const countdown = useRef({ step: -2, remaining: 0 });

  useEffect(() => {
    const hold =
      step < 0
        ? 300
        : Math.max(step === steps.length - 1 ? LAST_HOLD : HOLD, timing.latest + 4 * FILL + SETTLE);
    if (countdown.current.step !== step) countdown.current = { step, remaining: hold };
    if (!playing) return;
    const started = performance.now();
    const timer = window.setTimeout(
      () => setStep((s) => (s + 1) % steps.length),
      countdown.current.remaining,
    );
    return () => {
      window.clearTimeout(timer);
      countdown.current.remaining = Math.max(
        0,
        countdown.current.remaining - (performance.now() - started),
      );
    };
  }, [playing, step, steps.length, timing.latest]);

  // Freeze delayed dot fills as well as the packets; resume at the same point in the step.
  useEffect(() => {
    ref.current?.getAnimations({ subtree: true }).forEach((animation) => {
      if (playing) animation.play();
      else animation.pause();
    });
  }, [playing]);

  const arrivals = useMemo(
    () =>
      [...timing.wires.values()]
        .flatMap(({ packets }) => packets.map((packet) => packet.lands))
        .sort((a, b) => a - b),
    [timing],
  );

  const stateOf = (item: Item): State => {
    const own = steps.indexOf(item.step);
    return reduced || step < 0 || own < step ? "done" : own === step ? "on" : "off";
  };
  const stroke = (state: State) =>
    cn(
      "transition-[stroke] duration-300 motion-reduce:transition-none",
      state === "on"
        ? "stroke-foreground/75"
        : state === "off"
          ? "stroke-muted-foreground/30"
          : "stroke-muted-foreground/65",
    );

  return (
    <figure className="my-8 max-sm:-mx-5 lg:-mx-16">
      <div
        ref={ref}
        className="relative rounded-stage bg-plot shadow-stage"
        style={{ "--play-state": playing ? "running" : "paused" } as CSSProperties}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          aria-hidden={description ? undefined : true}
          role={description ? "img" : undefined}
          aria-label={description}
          className="block w-full font-mono [&_path]:[vector-effect:non-scaling-stroke] [&_circle]:[vector-effect:non-scaling-stroke] [&_circle]:[stroke-width:0.5] [&_path]:[stroke-width:0.5]"
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
                    item.kind === "shell" ? behind(item.level, item.offset) : 0,
                    item.kind === "chip" ? 2.6 : 2.4,
                  )}
                  className={cn(
                    item.kind === "chip"
                      ? cn(
                          "stroke-none transition-[fill] duration-300",
                          state === "on" ? "fill-foreground/20" : "fill-foreground/10",
                        )
                      : cn(
                          "fill-plot transition-[stroke] duration-300",
                          item.kind === "shell" && item.faint
                            ? "stroke-muted-foreground/20"
                            : item.kind === "shell" && state !== "off"
                              ? "stroke-muted-foreground/40"
                              : stroke(state),
                        ),
                  )}
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
                          className={cn(
                            "fill-none [stroke-linecap:round] transition-[stroke] duration-300 [stroke-width:1px]!",
                            state === "on" ? "stroke-foreground" : stroke(state),
                          )}
                        />
                      );
                    }
                    const { o, delay } = brightness(
                      item,
                      state,
                      r,
                      c,
                      state === "on" ? timing.lands.get(index) : undefined,
                      timing.latest,
                    );
                    return (
                      <circle
                        key={n}
                        cx={cx}
                        cy={cy}
                        r={(item.omittedRows?.includes(r) ? 0.4 : 1.05) * scale}
                        style={{ "--o": o.toFixed(3), "--delay": `${delay}ms` } as CSSProperties}
                        className="fill-foreground opacity-(--o) transition-opacity delay-(--delay) duration-300 ease-out motion-reduce:transition-none"
                      />
                    );
                  })}
                </g>
              );
            }
            if (item.kind === "neuron") {
              const [cx, cy] = at(item.x, item.z);
              const inputs = state === "on" ? timing.lands.get(index) : undefined;
              const delay = inputs ? landing(inputs, 0, 1) : 0;
              const opacity = state === "off" ? DIM : item.value * (state === "done" ? 0.65 : 1);
              return (
                <g key={index}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={item.r * scale}
                    className={cn("fill-plot", stroke(state))}
                  />
                  {item.glyph ? (
                    <path
                      d={glyphOf(item.glyph, cx, cy, (item.r - 1.6) * scale)}
                      style={{ opacity: Math.max(opacity, 0.35), transitionDelay: `${delay}ms` }}
                      className="fill-none stroke-foreground transition-opacity duration-300 ease-out [stroke-width:0.8] motion-reduce:transition-none"
                    />
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={(item.r - 1.4) * scale}
                      style={{ opacity, transitionDelay: `${delay}ms` }}
                      className="fill-foreground transition-opacity duration-300 ease-out motion-reduce:transition-none"
                    />
                  )}
                </g>
              );
            }
            if (item.kind === "wire") {
              const d = item.pts
                .map(([x, z], i) => `${i ? "L" : "M"}${at(x, z).join(",")}`)
                .join("");
              const ends = [item.pts[0]!, item.pts.at(-1)!].map(([x, z]) => at(x, z));
              const { packets, travel } =
                state === "on" && !reduced
                  ? (timing.wires.get(index) ?? { packets: [], travel: 0 })
                  : { packets: [], travel: 0 };
              return (
                <g key={index}>
                  <path
                    d={d}
                    className={cn(
                      "fill-none transition-[stroke] duration-300",
                      item.solid
                        ? state === "on"
                          ? "stroke-muted-foreground/40"
                          : "stroke-muted-foreground/20"
                        : state === "on"
                          ? "animate-flow stroke-foreground/60 [stroke-dasharray:2_4] motion-reduce:animate-none"
                          : "[stroke-dasharray:1_3]",
                      !item.solid && state === "off" && "stroke-muted-foreground/25",
                      !item.solid && state === "done" && "stroke-muted-foreground/50",
                      "[animation-play-state:var(--play-state)]",
                    )}
                  />
                  {packets.map(({ pts, delay }, packet) => (
                    <circle
                      key={`${step}-${packet}`}
                      r={0.9 * scale}
                      style={
                        {
                          "--path": `path("${pts
                            .map(
                              ([x, z], i) =>
                                `${i ? "L" : "M"}${at(x, z)
                                  .map((v) => v.toFixed(2))
                                  .join(",")}`,
                            )
                            .join("")}")`,
                          "--travel": `${travel}s`,
                          "--delay": `${delay}ms`,
                        } as CSSProperties
                      }
                      className="animate-[packet_var(--travel)_cubic-bezier(0.4,0,0.2,1)_var(--delay)_both] fill-foreground opacity-0 [animation-play-state:var(--play-state)] [offset-path:var(--path)] [offset-rotate:0deg]"
                    />
                  ))}
                  {!item.solid &&
                    ends.map(([cx, cy], end) => (
                      <circle
                        key={end}
                        cx={cx}
                        cy={cy}
                        r={0.55 * scale}
                        className={cn(
                          "fill-plot transition-[stroke] duration-300",
                          state === "on" ? "stroke-foreground/60" : "stroke-muted-foreground/40",
                        )}
                      />
                    ))}
                </g>
              );
            }
            if (item.kind === "box") {
              const [cx, cy] = at((item.x0 + item.x1) / 2, (item.z0 + item.z1) / 2);
              return (
                <g key={index}>
                  <path
                    d={rect(item.x0, item.x1, item.z0, item.z1, 0, 2)}
                    className={cn("fill-plot transition-[stroke] duration-300", stroke(state))}
                  />
                  <text
                    x={cx}
                    y={cy}
                    dominantBaseline="central"
                    textAnchor="middle"
                    className={cn(
                      "text-[5.5px] transition-[fill,opacity] duration-300",
                      CODE.test(item.label) ? "font-mono" : "font-sans",
                      state === "on" ? "fill-foreground" : "fill-muted-foreground",
                      state === "off" && "opacity-50",
                    )}
                  >
                    {item.label}
                  </text>
                </g>
              );
            }
            if (item.kind === "brace") {
              return (
                <path
                  key={index}
                  d={braceOf(at(...item.from), at(...item.to), 2.4 * scale)}
                  className={cn("fill-none", stroke(state))}
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
                      "fill-plot [stroke-width:0.6] [vector-effect:non-scaling-stroke]",
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
              const [x0] = at(0, item.z1);
              const [x1, y1] = at(Math.max(item.p * BAR, 1.2), item.z1);
              const [, y0] = at(0, item.z0);
              return (
                <Bar
                  key={`${index}-${step}`}
                  d={rect(0, Math.max(item.p * BAR, 1.2), item.z0, item.z1, 0, 1.2)}
                  p={item.p}
                  chosen={item.i === 0}
                  from={x0}
                  to={x1}
                  y={(y0 + y1) / 2}
                  stops={state === "off" ? [] : state === "on" && playing ? arrivals : undefined}
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
                  (item.tone === "shape" || !CODE.test(item.value)) && "font-sans",
                  item.tone === "shape"
                    ? "fill-muted-foreground text-[5.5px]"
                    : item.tone === "chip"
                      ? "fill-foreground text-[6px]"
                      : item.tone === "name"
                        ? "fill-control-foreground text-[8px]"
                        : "fill-muted-foreground text-[6.5px]",
                  item.tone !== "shape" && state === "on" && "fill-foreground",
                  state === "off" && "opacity-50",
                )}
              >
                {item.value}
              </text>
            );
          })}
        </svg>
        {labels}
      </div>
      <figcaption className="mt-3 text-center text-xs text-pretty text-muted-foreground max-sm:px-5">
        {caption}
      </figcaption>
    </figure>
  );
}

const GROW = 400;

/** Names straight from the code stay monospaced; words and tokens are set in the body face. */
const CODE = /_|^norm\d|^Linear|^(softmax|GELU|logits|mean|var|scale|shift)$/;

/** One next-token bar: flat, grows from zero once the last token's scores arrive, its number counting up with it. */
/**
 * One next-token bar, flat. It grows a step each time one of the last token's scores lands, its number
 * counting up with it, and reaches its probability with the last one; the sampled token then turns
 * white. `stops` are those landing times; none means it is already done, an empty list that it has not started.
 */
function Bar({
  d,
  p,
  chosen,
  from,
  to,
  y,
  stops,
}: {
  d: string;
  p: number;
  chosen: boolean;
  from: number;
  to: number;
  y: number;
  stops: number[] | undefined;
}) {
  const steps = Math.max(stops?.length ?? 1, 1);
  const [reached, setReached] = useState(stops ? 0 : 1);
  const label = useRef<SVGTextElement>(null);
  const shown = useRef(stops ? 0 : p);

  useEffect(() => {
    if (!stops?.length) return;
    const timers = stops.map((at, index) => window.setTimeout(() => setReached(index + 1), at));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [stops]);

  const fraction = reached / steps;
  useEffect(() => {
    const node = label.current;
    if (!node) return;
    const start = performance.now();
    const from = shown.current;
    const target = p * fraction;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / GROW, 1);
      shown.current = from + (target - from) * (1 - (1 - t) ** 3);
      node.textContent = shown.current.toFixed(2).slice(1);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [p, fraction]);

  return (
    <g
      style={
        {
          "--grow": fraction,
          "--shift": `${((1 - fraction) * (from - to)).toFixed(2)}px`,
          transformOrigin: `${from.toFixed(2)}px 0`,
        } as CSSProperties
      }
    >
      <path
        d={d}
        className={cn(
          "scale-x-(--grow) stroke-none transition-[scale,fill] duration-400 ease-out [transform-box:view-box] [transform-origin:inherit] motion-reduce:transition-none",
          chosen && fraction === 1 ? "fill-foreground" : "fill-foreground/20",
        )}
      />
      <text
        ref={label}
        x={to + 6}
        y={y}
        dominantBaseline="central"
        className="translate-x-(--shift) fill-muted-foreground font-sans text-[6.5px] tabular-nums transition-[translate] duration-400 ease-out motion-reduce:transition-none"
      >
        {(stops ? 0 : p).toFixed(2).slice(1)}
      </text>
    </g>
  );
}

/** A neuron's function from x = −3 to 3, drawn to fit inside a neuron of radius `r` centred on (cx, cy). */
function glyphOf(glyph: "gelu" | "linear", cx: number, cy: number, r: number) {
  const gelu = (x: number) =>
    glyph === "linear"
      ? (x + 3) * (3.17 / 6) - 0.17
      : 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
  const half = r * 0.85;
  return Array.from({ length: 25 }, (_, i) => {
    const x = -3 + (i / 24) * 6;
    const px = cx + (x / 3) * half;
    const py = cy + half * 0.55 - ((gelu(x) + 0.17) / 3.17) * half * 1.4;
    return `${i ? "L" : "M"}${px.toFixed(2)},${py.toFixed(2)}`;
  }).join("");
}

/** A curly brace from screen point a to b, `w` deep, its nib to the right of the way it runs. */
function braceOf([ax, ay]: Point, [bx, by]: Point, w: number) {
  const length = Math.hypot(bx - ax, by - ay);
  const [ux, uy] = [(bx - ax) / length, (by - ay) / length];
  const [nx, ny] = [uy, -ux];
  const along = (x: number, y: number, u: number, n: number) =>
    `${(x + ux * u + nx * n).toFixed(2)},${(y + uy * u + ny * n).toFixed(2)}`;
  const [mx, my] = [(ax + bx) / 2, (ay + by) / 2];
  return [
    `M${along(ax, ay, 0, 0)}`,
    `Q${along(ax, ay, 0, w)} ${along(ax, ay, w, w)}`,
    `L${along(mx, my, -w, w)}`,
    `Q${along(mx, my, 0, w)} ${along(mx, my, 0, 2 * w)}`,
    `Q${along(mx, my, 0, w)} ${along(mx, my, w, w)}`,
    `L${along(bx, by, -w, w)}`,
    `Q${along(bx, by, 0, w)} ${along(bx, by, 0, 0)}`,
  ].join("");
}
