import * as React from "react";

import { cn } from "@/lib/utils";

const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
} as const;

type ProgressiveBlurProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  blurIntensity?: number;
  blurLayers?: number;
  direction?: keyof typeof GRADIENT_ANGLES;
};

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function ProgressiveBlur({
  blurIntensity = 0.25,
  blurLayers = 8,
  className,
  direction = "bottom",
  ...props
}: ProgressiveBlurProps) {
  const layers = Math.max(Math.round(finiteOr(blurLayers, 8)), 2);
  const segmentSize = 1 / (layers + 1);
  const angle = GRADIENT_ANGLES[direction];
  const safeBlurIntensity = Math.max(finiteOr(blurIntensity, 0.25), 0);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative overflow-hidden rounded-[inherit]",
        className,
      )}
      data-slot="progressive-blur"
      {...props}
    >
      {Array.from({ length: layers }, (_, index) => {
        const gradientStops = [
          index * segmentSize,
          (index + 1) * segmentSize,
          (index + 2) * segmentSize,
          (index + 3) * segmentSize,
        ].map((position, positionIndex) => {
          const alpha = positionIndex === 1 || positionIndex === 2 ? 1 : 0;

          return `rgba(0, 0, 0, ${alpha}) ${position * 100}%`;
        });
        const gradient = `linear-gradient(${angle}deg, ${gradientStops.join(", ")})`;
        const blur = `${index * safeBlurIntensity}px`;

        return (
          <div
            className="absolute inset-0 rounded-[inherit]"
            key={index}
            style={{
              backdropFilter: `blur(${blur})`,
              maskImage: gradient,
              WebkitBackdropFilter: `blur(${blur})`,
              WebkitMaskImage: gradient,
            }}
          />
        );
      })}
    </div>
  );
}

export { GRADIENT_ANGLES, ProgressiveBlur };
export type { ProgressiveBlurProps };
