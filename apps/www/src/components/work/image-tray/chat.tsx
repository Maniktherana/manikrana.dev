import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { ImageStrip } from "@/components/work/image-tray/image-strip";
import { ImageTray, type WebImage } from "@/components/work/image-tray/image-tray";
import { images } from "@/components/work/image-tray/images";
import { Stream, streamDuration, words } from "@/components/work/image-tray/stream";

// tan(atan2(a, b)) is the unitless a / b. Zoom, not scale: under a scale transform Chrome clips
// the tray's blur and scrim a pixel short of the image, leaving a bright edge line.
const SCENE = { width: 400, height: 520, gutter: 32 };
const FIT = `min(tan(atan2(100cqw - ${SCENE.gutter}px, ${SCENE.width}px)), tan(atan2(100cqh, ${SCENE.height}px)), 1)`;

const QUESTION = "What talks has Manik given?";
const ANSWER = words("Four so far, from the Prometheus parser at PromCon to Rust in Delhi.");

export const ANSWER_MS = streamDuration(ANSWER.length);

const SEND = { y: 8, transition: { duration: 0.18, ease: "easeOut" } } as const;

const CLEAR = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } as const;

const TAP = {
  spots: ["left-18.5", "left-57.5"], // centers of the strip's first two 148px tiles
  landScale: 1.25,
  liftScale: 0.9,
  spring: { type: "spring", duration: 0.2, bounce: 0 },
} as const;

export type ChatBeat = {
  sent: boolean;
  found: boolean;
  answered: boolean;
  cleared?: boolean;
};

type ChatProps = ChatBeat & {
  image: WebImage | null;
  onSelect?: (image: WebImage) => void;
  onClose?: () => void;
  tap?: number | null;
};

export function Chat({
  sent,
  found,
  answered,
  cleared = false,
  image,
  onSelect,
  onClose,
  tap = null,
}: ChatProps) {
  const reduceMotion = useReducedMotion();
  const instant = { duration: 0 };

  return (
    <div
      style={{ "--fit": FIT } as CSSProperties}
      className="@container-size relative size-full overflow-hidden"
    >
      <div className="absolute inset-0 [zoom:var(--fit)]">
        <motion.div
          initial={false}
          animate={{ opacity: cleared ? 0 : 1 }}
          transition={cleared ? CLEAR : instant}
          className="absolute inset-x-0 bottom-0 mx-auto h-130 w-100 pt-2"
        >
          <div className="flex justify-end px-3 py-2">
            <motion.p
              initial={false}
              animate={sent ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : SEND.y }}
              transition={sent ? SEND.transition : instant}
              className="max-w-[88%] rounded-2xl rounded-br-md bg-white/4 px-4 py-2.5 text-base leading-6 font-medium text-[#f5f5f5]"
            >
              {QUESTION}
            </motion.p>
          </div>
          <div className="my-2 flex flex-col gap-2 px-3">
            <div className="relative -mx-3 h-26">
              <ImageStrip images={found ? images : []} onSelect={onSelect} />
              <AnimatePresence>
                {tap !== null && (
                  <motion.span
                    key={tap}
                    initial={{ opacity: 0, scale: TAP.landScale }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: TAP.liftScale }}
                    transition={TAP.spring}
                    className={cn(
                      "pointer-events-none absolute top-13 z-2 size-11 -translate-1/2 rounded-full bg-white/40",
                      TAP.spots[tap],
                    )}
                  />
                )}
              </AnimatePresence>
            </div>
            <p className="text-base leading-6 font-medium text-[#f5f5f5]">
              <Stream tokens={ANSWER} play={answered} />
            </p>
          </div>
        </motion.div>
        <ImageTray
          image={image}
          onClose={() => onClose?.()}
          className="absolute [--image-tray-max-width:368px]"
        />
      </div>
    </div>
  );
}
