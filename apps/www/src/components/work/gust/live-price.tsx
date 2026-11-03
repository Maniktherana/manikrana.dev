"use client";

import { TickerDemo } from "@/components/work/gust/ticker-demo";
import { DEFAULT_MOTION, type GustMotionOptions } from "@maniktherana/gust";

export function LivePriceExample({
  paused = false,
  motion = DEFAULT_MOTION,
}: {
  paused?: boolean;
  motion?: GustMotionOptions;
}) {
  return (
    <div className="relative h-full w-full">
      <TickerDemo motion={motion} paused={paused} />
    </div>
  );
}
