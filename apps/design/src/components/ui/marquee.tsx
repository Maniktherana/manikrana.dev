import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const marqueeVariants = cva(
  "group/marquee relative flex overflow-hidden [--marquee-duration:20s] [--marquee-gap:1rem]",
  {
    variants: {
      direction: {
        horizontal: "w-full",
        vertical: "h-full flex-col",
      },
      speed: {
        slow: "[--marquee-duration:32s]",
        normal: "",
        fast: "[--marquee-duration:12s]",
      },
    },
    defaultVariants: {
      direction: "horizontal",
      speed: "normal",
    },
  },
);

type MarqueeProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> &
  VariantProps<typeof marqueeVariants> & {
    children: React.ReactNode;
    duration?: number | string;
    gap?: number | string;
    pauseOnHover?: boolean;
    reverse?: boolean;
  };

function toCssLength(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

function toCssDuration(value: number | string) {
  return typeof value === "number" ? `${value}s` : value;
}

function Marquee({
  children,
  className,
  direction = "horizontal",
  duration,
  gap = 16,
  pauseOnHover = false,
  reverse = false,
  speed = "normal",
  style,
  ...props
}: MarqueeProps) {
  const marqueeDirection = direction ?? "horizontal";
  const marqueeSpeed = speed ?? "normal";
  const marqueeStyle = {
    "--marquee-gap": toCssLength(gap),
    ...(duration !== undefined
      ? { "--marquee-duration": toCssDuration(duration) }
      : null),
    ...style,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        marqueeVariants({ direction: marqueeDirection, speed: marqueeSpeed }),
        className,
      )}
      data-direction={marqueeDirection}
      data-pause-on-hover={pauseOnHover || undefined}
      data-reverse={reverse || undefined}
      data-slot="marquee"
      data-speed={marqueeSpeed}
      style={marqueeStyle}
      {...props}
    >
      <div
        className="flex w-max min-w-full will-change-transform [animation:marquee-horizontal_var(--marquee-duration)_linear_infinite] motion-reduce:animate-none group-data-[pause-on-hover=true]/marquee:group-hover/marquee:[animation-play-state:paused] group-data-[reverse=true]/marquee:[animation-direction:reverse] group-data-[direction=vertical]/marquee:h-max group-data-[direction=vertical]/marquee:min-h-full group-data-[direction=vertical]/marquee:w-auto group-data-[direction=vertical]/marquee:min-w-0 group-data-[direction=vertical]/marquee:flex-col group-data-[direction=vertical]/marquee:[animation-name:marquee-vertical]"
        data-slot="marquee-track"
      >
        <div
          className="flex w-max min-w-full flex-none items-center gap-[var(--marquee-gap)] pe-[var(--marquee-gap)] group-data-[direction=vertical]/marquee:h-max group-data-[direction=vertical]/marquee:min-h-full group-data-[direction=vertical]/marquee:w-auto group-data-[direction=vertical]/marquee:min-w-0 group-data-[direction=vertical]/marquee:flex-col group-data-[direction=vertical]/marquee:pe-0 group-data-[direction=vertical]/marquee:pb-[var(--marquee-gap)]"
          data-slot="marquee-content"
        >
          {children}
        </div>
        <div
          aria-hidden="true"
          className="flex w-max min-w-full flex-none items-center gap-[var(--marquee-gap)] pe-[var(--marquee-gap)] motion-reduce:hidden group-data-[direction=vertical]/marquee:h-max group-data-[direction=vertical]/marquee:min-h-full group-data-[direction=vertical]/marquee:w-auto group-data-[direction=vertical]/marquee:min-w-0 group-data-[direction=vertical]/marquee:flex-col group-data-[direction=vertical]/marquee:pe-0 group-data-[direction=vertical]/marquee:pb-[var(--marquee-gap)]"
          data-marquee-copy="true"
          data-slot="marquee-content"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { Marquee, marqueeVariants };
export type { MarqueeProps };
