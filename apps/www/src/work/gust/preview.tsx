import { useRef } from "react";
import { useInView } from "motion/react";
import { LivePriceExample } from "@/work/gust/live-price";

// The live price example as it sits in a card on gust.manikrana.dev.
export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className="grid size-full place-items-center px-5">
      <LivePriceExample paused={!inView} />
    </div>
  );
}
