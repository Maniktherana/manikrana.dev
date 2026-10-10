import type { ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";

// The side buttons hang off the frame's left edge, except power on the right.
const BUTTON = "pointer-events-none absolute z-0 left-[0.881%] w-[3.524%]";

// The iPhone 17 from agentsims.dev's device art. The frame and side buttons
// are images and the screen is whatever you pass in. Every inset comes from the
// 454×908 artwork, so the device sizes from its width alone.
export function IPhone({
  className,
  screenClassName,
  children,
}: {
  className?: string;
  screenClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[454/908] drop-shadow-[0_14px_12px_oklch(0_0_0/0.533333)]",
        className,
      )}
    >
      <div className="absolute top-[1.872%] left-[5.727%] z-0 h-[96.256%] w-[88.546%] rounded-[15.174%/6.979%] bg-linear-[155deg,oklch(0.224584_0.026372_258.317),oklch(0.189824_0.027443_258.29)_52%,oklch(0.157319_0.017155_256.284)]" />
      <img
        src="/work/devices/iphone-frame.webp"
        alt=""
        width={436}
        height={908}
        className="pointer-events-none absolute inset-y-0 left-[1.982%] z-1 h-full w-[96.035%]"
      />
      <img
        src="/work/devices/iphone-action.webp"
        alt=""
        className={cn(BUTTON, "top-[17.621%] h-[3.744%]")}
      />
      <img
        src="/work/devices/iphone-volume.webp"
        alt=""
        className={cn(BUTTON, "top-[24.339%] h-[7.048%]")}
      />
      <img
        src="/work/devices/iphone-volume.webp"
        alt=""
        className={cn(BUTTON, "top-[33.04%] h-[7.048%]")}
      />
      <img
        src="/work/devices/iphone-power.webp"
        alt=""
        className={cn(BUTTON, "top-[28.855%] left-[95.154%] h-[11.123%]")}
      />
      <div
        className={cn(
          "absolute top-[1.872%] left-[5.727%] z-2 h-[96.256%] w-[88.546%] overflow-hidden rounded-[15.174%/6.979%]",
          screenClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
