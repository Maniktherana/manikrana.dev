"use client";

import { TickerDemo } from "@/components/work/gust/ticker-demo";
import type { GustProps } from "@maniktherana/gust";

export const livePriceMotion: Omit<GustProps, "value"> = {
  duration: 320,
  exitDuration: 320,
  stagger: 20,
  entranceOvershoot: 8,
  entranceHeight: 100,
  exitHeight: 90,
  scale: true,
  exitBlur: 4,
};

export function LivePriceExample({
  paused = false,
  motion = livePriceMotion,
}: {
  paused?: boolean;
  motion?: Omit<GustProps, "value">;
}) {
  return (
    <div className="relative h-full w-full">
      <TickerDemo motion={motion} paused={paused} />
    </div>
  );
}
