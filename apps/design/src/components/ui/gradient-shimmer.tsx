"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const BAND_CORE_RATIO = 0.44;
const DEFAULT_ANGLE = 90;
const DEFAULT_DURATION_SECONDS = 2;
const DEFAULT_SPREAD = 2;

const gradientShimmerVariants = cva(
  "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent tracking-normal [-webkit-background-clip:text] [background-repeat:no-repeat,padding-box]",
  {
    variants: {
      variant: {
        default: "[--base-color:var(--foreground)] [--base-gradient-color:var(--foreground)]",
        inherit: "",
        muted: "[--base-color:var(--muted-foreground)] [--base-gradient-color:var(--foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type GradientShimmerStop = {
  color: string;
  position: number;
};

type GradientShimmerProps = Omit<React.HTMLAttributes<HTMLElement>, "children" | "style"> &
  VariantProps<typeof gradientShimmerVariants> & {
    children: string;
    as?: React.ElementType;
    baseColor?: string;
    className?: string;
    duration?: number;
    gradient?: string;
    highlightColor?: string;
    spread?: number;
    style?: React.CSSProperties;
  };

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function buildGradientShimmerGradient(stops: GradientShimmerStop[], angle = DEFAULT_ANGLE) {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const safeAngle = finiteOr(angle, DEFAULT_ANGLE);

  if (sorted.length === 0) {
    return "linear-gradient(90deg, transparent, currentColor, transparent)";
  }

  const core = sorted
    .map((stop) => {
      const position = Math.min(1, Math.max(0, stop.position));
      const factor = (position - 0.5) * 2 * BAND_CORE_RATIO;

      return `${stop.color} calc(50% + var(--gradient-shimmer-spread) * ${factor.toFixed(4)})`;
    })
    .join(", ");

  return [
    `linear-gradient(${safeAngle}deg`,
    `transparent calc(50% - var(--gradient-shimmer-spread))`,
    core,
    `transparent calc(50% + var(--gradient-shimmer-spread)))`,
  ].join(", ");
}

function cssVariableStyle({
  baseColor,
  highlightColor,
}: {
  baseColor?: string;
  highlightColor?: string;
}) {
  return {
    ...(baseColor ? { "--base-color": baseColor } : null),
    ...(highlightColor ? { "--base-gradient-color": highlightColor } : null),
  } as React.CSSProperties;
}

function GradientShimmerComponent({
  as: Component = "p",
  baseColor,
  children,
  className,
  duration = DEFAULT_DURATION_SECONDS,
  gradient,
  highlightColor,
  spread = DEFAULT_SPREAD,
  style,
  variant,
  ...props
}: GradientShimmerProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const safeDuration = Math.max(0.001, finiteOr(duration, DEFAULT_DURATION_SECONDS));
  const dynamicSpread = React.useMemo(
    () => `${children.length * Math.max(0, finiteOr(spread, DEFAULT_SPREAD))}px`,
    [children, spread],
  );
  const shimmerGradient =
    gradient ??
    "linear-gradient(90deg, transparent calc(50% - var(--gradient-shimmer-spread)), var(--base-gradient-color), transparent calc(50% + var(--gradient-shimmer-spread)))";

  React.useEffect(() => {
    const el = ref.current;

    if (!el || typeof el.animate !== "function") return undefined;

    const animation = el.animate(
      [{ backgroundPosition: "100% center, 0 0" }, { backgroundPosition: "0% center, 0 0" }],
      {
        duration: safeDuration * 1000,
        easing: "linear",
        iterations: Infinity,
      },
    );

    return () => animation.cancel();
  }, [safeDuration]);

  return (
    <Component
      ref={ref}
      className={cn(gradientShimmerVariants({ variant, className }))}
      data-slot="gradient-shimmer"
      style={
        {
          ...cssVariableStyle({ baseColor, highlightColor }),
          "--gradient-shimmer-spread": dynamicSpread,
          backgroundImage: `${shimmerGradient}, linear-gradient(var(--base-color), var(--base-color))`,
          backgroundPosition: "100% center, 0 0",
          WebkitTextFillColor: "transparent",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </Component>
  );
}

const GradientShimmer = React.memo(GradientShimmerComponent);

export { GradientShimmer, buildGradientShimmerGradient, gradientShimmerVariants };
export type { GradientShimmerProps, GradientShimmerStop };
