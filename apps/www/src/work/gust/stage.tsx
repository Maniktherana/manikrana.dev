import { LivePriceExample } from "@/work/gust/live-price";

export function Stage() {
  return (
    <div className="grid size-full place-items-center p-6">
      <div className="relative grid h-72 w-full max-w-80 place-items-center px-5">
        <LivePriceExample />
      </div>
    </div>
  );
}
