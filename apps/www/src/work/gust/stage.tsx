import { LivePriceExample } from "@/work/gust/live-price";

// The same card at its size on gust.manikrana.dev, so the chart keeps its
// proportions on the wide stage.
export function Stage() {
  return (
    <div className="grid size-full place-items-center p-6">
      <div className="relative grid h-72 w-full max-w-80 place-items-center px-5">
        <LivePriceExample />
      </div>
    </div>
  );
}
