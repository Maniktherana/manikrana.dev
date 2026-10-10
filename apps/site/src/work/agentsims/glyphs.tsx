import type { SVGProps } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import type { DeviceType } from "@/work/agentsims/devices";
import type { DevicePhase } from "@/work/agentsims/storyboard";

// The agentsims workspace's own glyphs, kept as its artwork: 24-unit stroke
// icons with round caps, drawn at size-3.5 unless a size-* class says otherwise.
function Glyph({ className, strokeWidth = 2, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-3.5 shrink-0", className)}
      {...props}
    />
  );
}

export function DevicesGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
      <path d="M10 19v-3.96 3.15" />
      <path d="M7 19h5" />
      <rect width="6" height="10" x="16" y="12" rx="2" />
    </Glyph>
  );
}

export function SettingsGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      <circle cx="12" cy="12" r="3" />
    </Glyph>
  );
}

export function RefreshGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </Glyph>
  );
}

export function SearchGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </Glyph>
  );
}

export function EyeGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </Glyph>
  );
}

export function EyeOffGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </Glyph>
  );
}

export function PowerGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
    </Glyph>
  );
}

export function GripGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </Glyph>
  );
}

function LoaderGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </Glyph>
  );
}

// Device-family glyphs: a screen that lights up while the device streams,
// under the device's outline.
const DEVICE_ART = {
  iphone: {
    screen: { x: 6, y: 3, width: 11, height: 19, rx: 2 },
    outline: (
      <>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2.8" />
        <line x1="10.5" y1="5" x2="13.5" y2="5" />
      </>
    ),
  },
  ipad: {
    screen: { x: 5, y: 3, width: 15, height: 19, rx: 1.65 },
    outline: (
      <>
        <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
        <line x1="12" y1="18.5" x2="12" y2="18.5" />
      </>
    ),
  },
  android: {
    screen: { x: 6, y: 2.75, width: 12, height: 18.5, rx: 2.4 },
    outline: (
      <>
        <rect x="6" y="2.5" width="12" height="19" rx="3" />
        <circle cx="12" cy="5" r="0.85" />
        <line x1="10.25" y1="18.5" x2="13.75" y2="18.5" />
      </>
    ),
  },
};

export function DeviceGlyph({ type, screenOn }: { type: DeviceType; screenOn: boolean }) {
  const { screen, outline } = DEVICE_ART[type];
  return (
    <Glyph className="size-5" strokeWidth={1.6}>
      <motion.rect
        {...screen}
        fill="oklch(0.58 0.1 245)"
        stroke="none"
        initial={false}
        animate={{ opacity: screenOn ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      {outline}
    </Glyph>
  );
}

const STATUS_COLOR = {
  booting: "text-amber-foreground/80",
  connecting: "text-amber-foreground/80",
  streaming: "text-green-foreground",
  "shutting-down": "text-muted-foreground",
};
const ICON_HIDDEN = { opacity: 0, filter: "blur(2px)", scale: 0.25 };
const ICON_VISIBLE = { opacity: 1, filter: "blur(0px)", scale: 1 };
// Status animations stop with the rest of the scene while it is paused.
const SPIN =
  "motion-safe:animate-[spin_900ms_linear_infinite_reverse] group-data-[playing=false]/scene:paused";

// A badge on the device's tile: a spinner while it boots and connects, a dot
// while it streams, and a breathing ring while it shuts down.
export function DeviceStatusGlyph({ phase }: { phase: DevicePhase }) {
  if (phase === "available") return null;
  return (
    <span
      className={cn(
        "absolute -right-2 -bottom-2 grid size-4 place-items-center",
        STATUS_COLOR[phase],
      )}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={phase}
          className="col-start-1 row-start-1 grid place-items-center"
          initial={ICON_HIDDEN}
          animate={ICON_VISIBLE}
          exit={ICON_HIDDEN}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {phase === "booting" ? (
            <RefreshGlyph className={SPIN} />
          ) : phase === "connecting" ? (
            <LoaderGlyph className={SPIN} />
          ) : phase === "shutting-down" ? (
            // Breathes from 82% size and 38% opacity to full size and 90%.
            <span className="size-2.5 rounded-full border border-current opacity-90 duration-575 ease-out repeat-infinite direction-alternate fade-in-38 zoom-in-82 motion-safe:animate-in group-data-[playing=false]/scene:paused" />
          ) : (
            <span className="size-1.5 rounded-full bg-current" />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
