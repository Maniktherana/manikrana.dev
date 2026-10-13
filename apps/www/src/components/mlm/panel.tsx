import type { CSSProperties, ReactNode } from "react";
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

export function Panel({
  title,
  legend,
  children,
}: {
  title: ReactNode;
  legend?: readonly { label: string; dashed?: boolean }[];
  children: ReactNode;
}) {
  return (
    <figure className="my-8 flex flex-col gap-2 rounded-3xl bg-card p-3">
      <figcaption className="flex min-h-7 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2.5 py-1">
        <span className="text-sm leading-snug font-medium text-foreground">{title}</span>
        {legend ? (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
      </figcaption>
      {children}
    </figure>
  );
}

export function Plot({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className="relative h-48 overflow-hidden rounded-stage bg-stage shadow-stage sm:h-56"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full stroke-foreground/8"
        >
          {[25, 50, 75].map((at) => (
            <g key={at}>
              <line x1={at} x2={at} y1={0} y2={100} vectorEffect="non-scaling-stroke" />
              <line x1={0} x2={100} y1={at} y2={at} vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>
        {children}
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
      strokeWidth={1.5}
      strokeDasharray={dashed ? "4 4" : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={cn("fill-none stroke-foreground", dashed && "opacity-60")}
    />
  );
}

export function Guide({ y }: { y: number }) {
  return (
    <div
      style={{ "--y": `${y}%` } as CSSProperties}
      className="pointer-events-none absolute inset-x-0 top-(--y) h-px bg-[repeating-linear-gradient(90deg,var(--color-foreground)_0_4px,transparent_4px_8px)] opacity-20"
    />
  );
}

export function Dot({ x, y, dim }: { x: number; y: number; dim?: boolean }) {
  return (
    <span
      style={{ "--x": `${x}%`, "--y": `${y}%` } as CSSProperties}
      className={cn(
        "pointer-events-none absolute top-(--y) left-(--x) size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-stage",
        dim ? "bg-muted-foreground" : "bg-foreground",
      )}
    />
  );
}

export function Label({
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
