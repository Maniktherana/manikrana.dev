import { motion } from "motion/react";
import { GripGlyph } from "@/components/work/agentsims/glyphs";
import { IPhone } from "@manikrana/ui/components/iphone";

const SURFACE = {
  spring: { type: "spring", bounce: 0, duration: 0.3 } as const,
  enterY: 8,
  enterScale: 0.96,
};

export function DemoPhones({
  androidVisible,
  androidStreaming,
}: {
  androidVisible: boolean;
  androidStreaming: boolean;
}) {
  return (
    <div className="absolute top-0 left-0 flex w-full items-center justify-center gap-[5cqw]">
      <motion.div
        className="relative w-[46cqw] flex-none"
        initial={false}
        animate={{ x: androidVisible ? "0%" : "51.63%" }}
        transition={SURFACE.spring}
      >
        <DeviceNamePill name="iPhone 17" />
        <IPhone className="w-full">
          <img
            src="/work/agentsims/iphone-17-screen.webp"
            alt=""
            width={603}
            height={1311}
            className="size-full"
          />
        </IPhone>
        <ResizeHandle device="iphone" />
      </motion.div>
      <motion.div
        className="relative aspect-[1080/2424] w-[42.5cqw] flex-none rounded-[14%/6.24%] bg-linear-[155deg,oklch(0.224584_0.026372_258.317),oklch(0.189824_0.027443_258.29)_52%,oklch(0.157319_0.017155_256.284)] shadow-[inset_0_1px_0_oklch(1_0_0/7%),inset_0_0_0_1px_oklch(1_0_0/14%),0_14px_24px_oklch(0_0_0/53%)]"
        initial={false}
        animate={{
          opacity: androidVisible ? 1 : 0,
          y: androidVisible ? 0 : SURFACE.enterY,
          scale: androidVisible ? 1 : SURFACE.enterScale,
        }}
        transition={SURFACE.spring}
      >
        <DeviceNamePill name="Pixel 10" />
        <motion.img
          src="/work/agentsims/pixel-10-screen.webp"
          alt=""
          width={540}
          height={1212}
          className="absolute inset-px size-[calc(100%-2px)] rounded-[inherit] object-cover"
          initial={false}
          animate={{ opacity: androidStreaming ? 1 : 0 }}
          transition={{ type: "tween", duration: 0.18, ease: "easeInOut" }}
        />
        <span className="absolute top-[1.8%] left-1/2 aspect-square w-[7.7%] -translate-x-1/2 rounded-full bg-black" />
        <ResizeHandle device="android" />
      </motion.div>
    </div>
  );
}

function DeviceNamePill({ name }: { name: string }) {
  return (
    <div className="absolute bottom-[calc(100%+2cqw)] left-1/2 flex h-8 w-55 origin-bottom -translate-x-1/2 scale-(--scale) items-center gap-2.5 rounded-lg bg-popover px-2.5 shadow-raised">
      <GripGlyph className="text-muted-foreground" />
      <span className="text-xs leading-none font-semibold text-foreground">{name}</span>
    </div>
  );
}

const RESIZE_ARCS = {
  android: { size: 29, path: "M 25.226 13.863 A 15.600 15.600 0 0 1 13.863 25.226" },
  iphone: { size: 31, path: "M 26.863 14.405 A 17.103 17.103 0 0 1 14.405 26.863" },
};

function ResizeHandle({ device }: { device: keyof typeof RESIZE_ARCS }) {
  const { size, path } = RESIZE_ARCS[device];
  // Scaling a zero-size anchor on the corner scales the arc and its offset together.
  return (
    <div className="absolute right-0 bottom-0 scale-(--scale)">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="absolute -right-3.5 -bottom-3.5 overflow-visible"
      >
        <path
          d={path}
          stroke="oklch(0.53653 0.017264 260.712)"
          strokeWidth={2.65}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="opacity-38"
        />
      </svg>
    </div>
  );
}
