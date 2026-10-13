import { useRef, type ComponentType } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { ColorSwatchesExample } from "@/components/work/gust/color-swatches";
import { DownloadExample } from "@/components/work/gust/download";
import { GuestsExample } from "@/components/work/gust/guests";
import { LivePriceExample } from "@/components/work/gust/live-price";
import { OtpDemo } from "@/components/work/gust/otp-demo";
import { StageGrid, type StageSlide } from "@/components/work/gust/stage-grid";
import { StatusDemo } from "@/components/work/gust/status-demo";
import { useWatching } from "@manikrana/ui/hooks/use-watching";

function Card({
  demo: Demo,
  className,
}: {
  demo: ComponentType<{ paused?: boolean }>;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);

  return (
    <div
      ref={ref}
      className="relative grid h-full overflow-hidden rounded-xl bg-(--surface-raised)"
    >
      <div className={cn("grid h-full min-w-0 place-items-center", className)}>
        <Demo paused={!watching} />
      </div>
    </div>
  );
}

const slides: StageSlide[] = [
  { id: "guests", title: "Guest count", content: <Card demo={GuestsExample} className="px-5" /> },
  {
    id: "color-swatches",
    title: "Color picker",
    content: <Card demo={ColorSwatchesExample} className="px-5" />,
  },
  { id: "status", title: "Status", content: <Card demo={StatusDemo} className="px-6" /> },
  { id: "otp", title: "One-time code", content: <Card demo={OtpDemo} className="px-6" /> },
  {
    id: "download",
    title: "File download",
    content: <Card demo={DownloadExample} className="px-5" />,
  },
  { id: "live-price", title: "Live price", content: <Card demo={LivePriceExample} /> },
];

export function Stage() {
  return <StageGrid slides={slides} />;
}
