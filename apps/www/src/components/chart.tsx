import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";

export type Domain = readonly [number, number];

export function fmt(value: number, digits = 2) {
  const text = value.toFixed(digits);
  return Number(text) === 0 ? (0).toFixed(digits) : text.replace("-", "−");
}

export function toPercent(value: number, [from, to]: Domain) {
  return ((value - from) / (to - from)) * 100;
}

/** One path point, rounded so server and browser math agree to the digit. */
export const point = (x: number, y: number) => `${x.toFixed(3)},${y.toFixed(3)}`;

export function plotPath(fn: (x: number) => number, x: Domain, y: Domain, steps = 240) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const at = x[0] + (index / steps) * (x[1] - x[0]);
    return `${index === 0 ? "M" : "L"}${point(toPercent(at, x), 100 - toPercent(fn(at), y))}`;
  }).join("");
}

/** Where an axis sits: through zero when zero is in range, otherwise along the near edge. */
const axisAt = (domain: Domain) => Math.min(Math.max(toPercent(0, domain), 0), 100);

export function Panel({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="my-8">
      {children}
      <figcaption className="mt-3 text-center text-xs text-pretty text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

export function Plot({
  label,
  x,
  y,
  xTicks = [],
  yTicks = [],
  xTick = (tick) => fmt(tick, 0),
  yTick = (tick) => fmt(tick, 0),
  legend,
  legendAt = "start",
  tall,
  bleed,
  xLabel,
  yLabel,
  children,
}: {
  label: string;
  x: Domain;
  y: Domain;
  xTicks?: number[];
  yTicks?: number[];
  xTick?: (tick: number) => string;
  yTick?: (tick: number) => string;
  legend?: readonly { label: string; dashed?: boolean }[];
  legendAt?: "start" | "end";
  tall?: boolean;
  /** The domain runs to the frame's edges, so the edges are the limits; same size as a padded frame. */
  bleed?: boolean;
  /** What the axes measure, for charts of real data. */
  xLabel?: string;
  yLabel?: string;
  children: ReactNode;
}) {
  const across = 100 - axisAt(y);
  const up = axisAt(x);
  return (
    <>
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className={cn(
          "relative overflow-hidden rounded-stage bg-plot shadow-stage",
          !bleed && "px-9 pt-10 pb-14",
        )}
      >
        <div
          className={cn(
            "relative",
            bleed ? "h-60 sm:h-68" : tall ? "h-60 sm:h-84" : "h-36 sm:h-44",
          )}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible stroke-foreground/25"
          >
            {xTicks.map((tick) => (
              <line
                key={`x${tick}`}
                x1={toPercent(tick, x)}
                x2={toPercent(tick, x)}
                y1={-100}
                y2={200}
                vectorEffect="non-scaling-stroke"
                className="stroke-foreground/6"
              />
            ))}
            {yTicks.map((tick) => (
              <line
                key={`y${tick}`}
                x1={-100}
                x2={200}
                y1={100 - toPercent(tick, y)}
                y2={100 - toPercent(tick, y)}
                vectorEffect="non-scaling-stroke"
                className="stroke-foreground/6"
              />
            ))}
            <line x1={-100} x2={200} y1={across} y2={across} vectorEffect="non-scaling-stroke" />
            <line x1={up} x2={up} y1={-100} y2={200} vectorEffect="non-scaling-stroke" />
          </svg>
          {xTicks.map((tick) => (
            <Fragment key={tick}>
              <Notch x={toPercent(tick, x)} y={across} className="h-1.5 w-px" />
              <Tick x={toPercent(tick, x)} y={across} className="-translate-x-1/2 pt-2.5">
                {xTick(tick)}
              </Tick>
            </Fragment>
          ))}
          {yTicks.map((tick) => (
            <Fragment key={tick}>
              <Notch x={up} y={100 - toPercent(tick, y)} className="h-px w-1.5" />
              <Tick
                x={up}
                y={100 - toPercent(tick, y)}
                className={cn("-translate-y-1/2", up < 1 ? "-translate-x-full pr-2.5" : "pl-2.5")}
              >
                {yTick(tick)}
              </Tick>
            </Fragment>
          ))}
          {xLabel ? (
            <Tick x={100} y={across} className="-translate-x-full pt-8">
              {xLabel}
            </Tick>
          ) : null}
          {yLabel ? (
            <Tick x={up} y={0} className="-translate-y-full pb-2 pl-2.5">
              {yLabel}
            </Tick>
          ) : null}
          {children}
        </div>
        {legend ? (
          <span
            className={cn(
              "absolute top-3 flex flex-col gap-1.5 rounded-md bg-plot p-1",
              legendAt === "start" ? "left-3" : "right-3 items-end",
            )}
          >
            {legend.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-2 font-mono text-xs leading-none whitespace-nowrap text-muted-foreground"
              >
                <span
                  className={cn(
                    "h-0.5 w-4",
                    item.dashed
                      ? "bg-[repeating-linear-gradient(90deg,var(--color-foreground)_0_4px,transparent_4px_6px)] opacity-60"
                      : "rounded-full bg-foreground",
                  )}
                />
                {item.label}
              </span>
            ))}
          </span>
        ) : null}
      </div>
    </>
  );
}

export function Lines({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
    >
      {children}
    </svg>
  );
}

export function Curve({ d, dashed }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      strokeWidth={1.2}
      strokeDasharray={dashed ? "4 4" : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={cn("fill-none stroke-foreground", dashed && "opacity-60")}
    />
  );
}

function Tick({
  x,
  y,
  className,
  children,
}: {
  x: number;
  y: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
      className={cn(
        "pointer-events-none absolute top-(--y) left-(--x) font-mono text-xs leading-none whitespace-nowrap text-muted-foreground tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Notch({ x, y, className }: { x: number; y: number; className: string }) {
  return (
    <span
      style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
      className={cn(
        "pointer-events-none absolute top-(--y) left-(--x) -translate-x-1/2 -translate-y-1/2 bg-foreground/25",
        className,
      )}
    />
  );
}
