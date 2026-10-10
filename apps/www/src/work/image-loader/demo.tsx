import { useEffect, useState, type ComponentProps, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import type { DotGridOptions } from "./dot-grid";
import { ImageLoader } from "./image-loader";

export const PATTERNS: { label: string; grid: DotGridOptions }[] = [
  { label: "Spark", grid: { pattern: "spark" } },
  { label: "Weave", grid: { pattern: "weave" } },
];

// The app's exit timing, for fading one pattern out before the next enters.
const EXIT = { duration: 0.24, ease: [0.32, 0.72, 0, 1] } as const;

// Counts up every `every` ms while `playing`, to step through the patterns.
export function useCycle(playing: boolean, every: number) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setCycle((current) => current + 1), every);
    return () => window.clearInterval(id);
  }, [playing, every]);
  return cycle;
}

// tan(atan2(a, b)) is the unitless a / b: the box's width and height, less
// `inset` across and down, over the loader's 320px, up to `max`.
const fit = (inset: { x: number; y: number }, max: number) =>
  `max(0.1, min(tan(atan2(100cqw - ${inset.x}px, 320px)), tan(atan2(100cqh - ${inset.y}px, 320px)), ${max}))`;

export const TILE_FIT = fit({ x: 48, y: 48 }, 1);
export const STAGE_FIT = fit({ x: 48, y: 160 }, 1.25);

// A 320px loader, about a phone's chat column, scaled to fit its box. It only
// ever generates; a new `cycle` fades it out and enters it again.
export function Showcase({
  cycle,
  grid,
  fit,
  className,
  ...props
}: ComponentProps<"div"> & { cycle: number; grid: DotGridOptions; fit: string }) {
  return (
    <div
      className={cn("@container-size flex size-full items-center justify-center", className)}
      {...props}
    >
      <div style={{ "--fit": fit } as CSSProperties} className="w-80 shrink-0 scale-(--fit)">
        <AnimatePresence mode="wait">
          <motion.div key={cycle} exit={{ opacity: 0 }} transition={EXIT}>
            <ImageLoader
              status="generating"
              alt="Generating image"
              grid={grid}
              className="max-w-none"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
