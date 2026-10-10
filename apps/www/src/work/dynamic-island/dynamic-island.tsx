import { useEffect, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { CloseSmallIcon, PauseIcon, PlayIcon } from "@/components/icons";

export type IslandView = "idle" | "ring" | "timer";

type ExitTarget = {
  scale?: number;
  scaleX?: number;
  y?: number;
};

const EXIT_TARGETS: Record<string, ExitTarget> = {
  "idle-ring": { scale: 0.9, scaleX: 0.9 },
  "ring-idle": { scale: 0.9, scaleX: 0.9 },
  "ring-timer": { scale: 1.4, y: 7.5 },
  "timer-idle": { scale: 0.7, y: -7.5 },
  "timer-ring": { scale: 0.7, y: -7.5 },
};

const BOUNCES: Record<string, number> = {
  idle: 0.5,
  "idle-ring": 0.5,
  "idle-timer": 0.3,
  "ring-idle": 0.5,
  "ring-timer": 0.35,
  "timer-idle": 0.3,
  "timer-ring": 0.35,
};

const exitVariants: Variants = {
  exit: (target: ExitTarget = {}) => ({
    ...target,
    opacity: [1, 0],
    filter: "blur(5px)",
  }),
};

export function DynamicIsland({
  view,
  onViewChange,
}: {
  view: IslandView;
  onViewChange?: (view: IslandView) => void;
}) {
  const reduceMotion = useReducedMotion();
  // Remember the shown view so a change can be keyed from-to.
  const [shownView, setShownView] = useState(view);
  const [change, setChange] = useState<string>(view);

  if (view !== shownView) {
    setShownView(view);
    setChange(`${shownView}-${view}`);
  }

  const bounce = reduceMotion ? 0 : (BOUNCES[change] ?? 0.35);
  const exitTarget = reduceMotion ? {} : (EXIT_TARGETS[change] ?? {});
  const transition = reduceMotion ? { duration: 0.01 } : { type: "spring" as const, bounce };
  const content = <IslandContent view={view} onTimerExit={() => onViewChange?.("idle")} />;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex justify-center">
        {/* The radius is in `style` so layout animations correct it while the island stretches. */}
        <motion.div
          layout
          className="min-w-25 shrink-0 overflow-hidden bg-black"
          style={{ borderRadius: 32 }}
          transition={transition}
          whileTap={view === "idle" && !reduceMotion ? { scale: 0.9 } : undefined}
        >
          <motion.div
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              transition: { delay: reduceMotion ? 0 : 0.05 },
            }}
            initial={
              reduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0, filter: "blur(5px)" }
            }
            key={view}
          >
            {content}
          </motion.div>
        </motion.div>

        {/* An overlaid copy of the content plays the exit while the island morphs underneath. */}
        <div className="pointer-events-none absolute top-0 left-1/2 flex w-80 -translate-x-1/2 items-start justify-center">
          <AnimatePresence custom={exitTarget} mode="popLayout">
            <motion.div exit="exit" initial={{ opacity: 0 }} key={view} variants={exitVariants}>
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

function IslandContent({ view, onTimerExit }: { view: IslandView; onTimerExit: () => void }) {
  switch (view) {
    case "ring":
      return <Ring />;
    case "timer":
      return <Timer onExit={onTimerExit} />;
    case "idle":
      return <div className="h-7 w-25" />;
  }
}

function Ring() {
  const [isSilent, setIsSilent] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = window.setTimeout(
      () => {
        setFirstTime(false);
        setIsSilent((silent) => !silent);
      },
      firstTime ? 1000 : 2000,
    );

    return () => window.clearTimeout(id);
  }, [firstTime, isSilent]);

  return (
    <motion.div
      animate={{ width: isSilent ? 148 : 128 }}
      className="relative flex h-7 items-center justify-between px-2.5"
      transition={{
        type: "spring",
        bounce: reduceMotion ? 0 : 0.5,
      }}
    >
      <motion.div
        animate={{
          width: isSilent ? 40 : 0,
          opacity: isSilent ? 1 : 0,
          filter: isSilent ? "blur(0px)" : "blur(2px)",
        }}
        className="absolute left-1.25 h-4.5 rounded-full bg-[#FD4F30]"
        initial={false}
        transition={{
          type: "spring",
          bounce: reduceMotion ? 0 : 0.35,
        }}
      />

      <motion.div
        animate={{
          rotate: reduceMotion
            ? 0
            : isSilent
              ? [0, -15, 5, -2, 0]
              : [0, 20, -15, 12.5, -10, 10, -7.5, 7.5, -5, 5, 0],
          x: isSilent ? 9 : 0,
        }}
        className="relative"
        initial={false}
      >
        <BellSvg />
        {/* A pill-colored bar cuts through the bell; the white hairline inside it is the slash. */}
        <motion.div
          animate={{
            opacity: isSilent ? 1 : 0,
          }}
          className="absolute inset-0 h-5 translate-x-1.25 -translate-y-1.25 -rotate-40 overflow-hidden"
          initial={false}
          transition={{ duration: reduceMotion ? 0.01 : 0.12 }}
        >
          <motion.div
            animate={{ height: isSilent ? 16 : 0 }}
            className="flex w-0.75 items-center justify-center rounded-full bg-[#FD4F30]"
            initial={false}
            transition={{
              duration: reduceMotion ? 0.01 : 0.16,
              delay: isSilent && !reduceMotion ? 0.15 : 0,
              ease: "easeInOut",
            }}
          >
            <div className="h-full w-px rounded-full bg-white" />
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="ml-auto flex items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            className={cn("text-xs font-medium", isSilent ? "text-[#FD4F30]" : "text-white")}
            exit={{
              opacity: 0,
              scale: 0.92,
              filter: "blur(3px)",
              transformOrigin: isSilent ? "left center" : "right center",
            }}
            initial={{
              opacity: 0,
              scale: 0.92,
              filter: "blur(3px)",
              transformOrigin: isSilent ? "right center" : "left center",
            }}
            key={isSilent ? "silent" : "ring"}
            transition={{ duration: reduceMotion ? 0.01 : 0.14 }}
          >
            {isSilent ? "Silent" : "Ring"}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Timer({ onExit }: { onExit: () => void }) {
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const press = reduceMotion ? undefined : { scale: 0.9 };

  return (
    <div className="flex w-71 items-center gap-2 p-3 pr-5">
      <motion.button
        aria-label={isPaused ? "Play timer" : "Pause timer"}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#5A3C07] text-[#FDB000] outline-none transition-colors hover:bg-[#694608] focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={() => setIsPaused((paused) => !paused)}
        type="button"
        whileTap={press}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="flex"
            exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
            key={isPaused ? "play" : "pause"}
            transition={{ duration: reduceMotion ? 0.01 : 0.1 }}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <motion.button
        aria-label="Exit"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#3C3D3C] text-white outline-none transition-colors hover:bg-[#4A4B4A] focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={onExit}
        type="button"
        whileTap={press}
      >
        <CloseSmallIcon className="size-6" />
      </motion.button>

      <div className="ml-auto flex shrink-0 items-baseline gap-1.5 pr-0.5 whitespace-nowrap text-[#F7A815]">
        <span className="text-sm leading-none font-medium">Timer</span>
        <Counter paused={isPaused} />
      </div>
    </div>
  );
}

function Counter({ paused }: { paused: boolean }) {
  const [count, setCount] = useState(60);

  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      setCount((current) => (current === 0 ? 60 : current - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [paused]);

  const digits = count.toString().padStart(2, "0").split("");

  return (
    <div className="relative w-16 shrink-0 overflow-hidden text-3xl font-light whitespace-nowrap">
      0:
      <AnimatePresence initial={false} mode="popLayout">
        {digits.map((digit, index) => (
          <motion.div
            className="inline-block tabular-nums"
            key={digit + index}
            initial={{ y: "12px", filter: "blur(2px)", opacity: 0 }}
            animate={{ y: "0", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "-12px", filter: "blur(2px)", opacity: 0 }}
            transition={{ type: "spring", bounce: 0.35 }}
          >
            {digit}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function BellSvg() {
  return (
    <svg
      className="block"
      fill="none"
      height="12.75"
      viewBox="0 0 15 17"
      width="11.25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.17969 13.3125H13.5625C14.2969 13.3125 14.7422 12.9375 14.7422 12.3672C14.7422 11.5859 13.9453 10.8828 13.2734 10.1875C12.7578 9.64844 12.6172 8.53906 12.5547 7.64062C12.5 4.64062 11.7031 2.57812 9.625 1.82812C9.32812 0.804688 8.52344 0 7.36719 0C6.21875 0 5.40625 0.804688 5.11719 1.82812C3.03906 2.57812 2.24219 4.64062 2.1875 7.64062C2.125 8.53906 1.98438 9.64844 1.46875 10.1875C0.789062 10.8828 0 11.5859 0 12.3672C0 12.9375 0.4375 13.3125 1.17969 13.3125ZM7.36719 16.4453C8.69531 16.4453 9.66406 15.4766 9.76562 14.3828H4.97656C5.07812 15.4766 6.04688 16.4453 7.36719 16.4453Z"
        fill="white"
      />
    </svg>
  );
}
