import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "./marquee.css";

const marqueeVariants = cva("relative flex overflow-hidden", {
  variants: {
    direction: {
      horizontal: "w-full",
      vertical: "h-full flex-col",
    },
    speed: {
      slow: "",
      normal: "",
      fast: "",
    },
  },
  defaultVariants: {
    direction: "horizontal",
    speed: "normal",
  },
});

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
      <div data-slot="marquee-track">
        <div data-slot="marquee-content">{children}</div>
        <div
          aria-hidden="true"
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
