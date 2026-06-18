import * as React from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

import { Button } from "@/components/ui/button";

type IslandView = "idle" | "ring" | "timer";

type ExitTarget = {
  bounce?: number;
  scale?: number;
  scaleX?: number;
  y?: number;
};

const ANIMATION_VARIANTS: Record<string, ExitTarget> = {
  "idle-ring": {
    bounce: 0.5,
    scale: 0.9,
    scaleX: 0.9,
  },
  "ring-idle": {
    bounce: 0.5,
    scale: 0.9,
    scaleX: 0.9,
  },
  "ring-timer": {
    bounce: 0.35,
    scale: 1.4,
    y: 7.5,
  },
  "timer-idle": {
    bounce: 0.3,
    scale: 0.7,
    y: -7.5,
  },
  "timer-ring": {
    bounce: 0.35,
    scale: 0.7,
    y: -7.5,
  },
};

const BOUNCE_VARIANTS: Record<string, number> = {
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

function DynamicIsland() {
  return (
    <MotionConfig reducedMotion="user">
      <DynamicIslandRoot />
    </MotionConfig>
  );
}

function DynamicIslandRoot() {
  const [view, setView] = React.useState<IslandView>("idle");
  const [variantKey, setVariantKey] = React.useState("idle");
  const reduceMotion = useReducedMotion();
  const bounce = reduceMotion ? 0 : (BOUNCE_VARIANTS[variantKey] ?? 0.35);
  const content = getIslandContent(
    view,
    () => selectView("idle"),
  );
  const exitTarget = reduceMotion ? {} : (ANIMATION_VARIANTS[variantKey] ?? {});
  const transition = reduceMotion
    ? { duration: 0.01 }
    : {
        type: "spring" as const,
        bounce,
      };

  function selectView(nextView: IslandView) {
    if (nextView === view) return;

    setVariantKey(`${view}-${nextView}`);
    setView(nextView);
  }

  return (
    <div className="w-[min(760px,100%)] py-12">
      <div className="relative flex min-h-[380px] w-full flex-col justify-between gap-12">
        <div className="relative flex h-[250px] items-start justify-center pt-14">
          <div className="relative flex h-[200px] w-[300px] items-start justify-center">
            <motion.div
              layout
              className="mx-auto w-fit min-w-[100px] overflow-hidden rounded-full bg-black"
              style={{ borderRadius: 32 }}
              transition={transition}
              whileTap={
                view === "idle" && !reduceMotion ? { scale: 0.9 } : undefined
              }
            >
              <motion.div
                animate={{
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0px)",
                  originX: 0.5,
                  originY: 0.5,
                  transition: {
                    delay: reduceMotion ? 0 : 0.05,
                  },
                }}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        scale: 0.9,
                        opacity: 0,
                        filter: "blur(5px)",
                        originX: 0.5,
                        originY: 0.5,
                      }
                }
                key={view}
                transition={transition}
              >
                {content}
              </motion.div>
            </motion.div>

            <div className="pointer-events-none absolute top-0 left-1/2 flex h-[220px] w-[320px] -translate-x-1/2 items-start justify-center">
              <AnimatePresence
                custom={exitTarget}
                mode="popLayout"
              >
                <motion.div
                  exit="exit"
                  initial={{ opacity: 0 }}
                  key={view}
                  variants={exitVariants}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {(["idle", "ring", "timer"] as IslandView[]).map((item) => (
            <Button
              aria-pressed={view === item}
              className="w-24 capitalize"
              key={item}
              onClick={() => selectView(item)}
              size="sm"
              type="button"
              variant={view === item ? "default" : "outline"}
            >
              {capitalize(item)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getIslandContent(
  view: IslandView,
  onTimerExit: () => void,
) {
  switch (view) {
    case "ring":
      return <Ring />;
    case "timer":
      return <Timer onExit={onTimerExit} />;
    case "idle":
      return <IdleIsland />;
  }
}

function IdleIsland() {
  return <div className="h-7 w-[100px]" />;
}

function Ring() {
  const [isSilent, setIsSilent] = React.useState(false);
  const [firstTime, setFirstTime] = React.useState(true);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
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
        className="absolute left-[5px] h-[18px] rounded-full bg-[#FD4F30]"
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
        className="relative h-[12.75px] w-[11.25px]"
        initial={false}
      >
        <BellSvg />
        <motion.div
          animate={{
            opacity: isSilent ? 1 : 0,
          }}
          className="absolute inset-0 h-5 translate-x-[5.25px] -translate-y-[5px] rotate-[-40deg] overflow-hidden"
          initial={false}
          transition={{ duration: reduceMotion ? 0.01 : 0.12 }}
        >
          <div className="h-4 w-fit rounded-full">
            <motion.div
              animate={{ height: isSilent ? 16 : 0 }}
              className="flex w-[3px] items-center justify-center rounded-full bg-[#FD4F30]"
              initial={false}
              transition={{
                duration: reduceMotion ? 0.01 : 0.16,
                delay: isSilent && !reduceMotion ? 0.15 : 0,
                ease: "easeInOut",
              }}
            >
              <div className="h-full w-[0.75px] rounded-full bg-white" />
            </motion.div>
          </div>
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
            className={
              isSilent
                ? "text-xs font-medium text-[#FD4F30]"
                : "text-xs font-medium text-white"
            }
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
  const [isPaused, setIsPaused] = React.useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-[284px] items-center gap-2 py-3 pr-5 pl-3.5">
      <motion.button
        aria-label={isPaused ? "Play timer" : "Pause timer"}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5A3C07] transition-colors hover:bg-[#694608]"
        onClick={() => setIsPaused((paused) => !paused)}
        type="button"
        whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      >
        <AnimatePresence initial={false} mode="wait">
          {isPaused ? <PlaySvg key="play" /> : <PauseSvg key="pause" />}
        </AnimatePresence>
      </motion.button>

      <button
        aria-label="Exit"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3C3D3C] text-white transition-colors hover:bg-[#4A4B4A]"
        onClick={onExit}
        type="button"
      >
        <CloseSvg />
      </button>

      <div className="ml-auto flex items-baseline gap-1.5 pr-0.5 text-[#F7A815]">
        <span className="text-sm leading-none font-medium text-inherit">
          Timer
        </span>
        <Counter paused={isPaused} />
      </div>
    </div>
  );
}

function Counter({ paused }: { paused?: boolean }) {
  const [count, setCount] = React.useState(60);

  React.useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      setCount((current) => {
        if (current === 0) return 60;

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [paused]);

  const countArray = count.toString().padStart(2, "0").split("");

  return (
    <div className="relative w-[64px] overflow-hidden text-3xl font-light whitespace-nowrap">
      0:
      <AnimatePresence initial={false} mode="popLayout">
        {countArray.map((n, i) => (
          <motion.div
            className="inline-block tabular-nums"
            key={n + i}
            initial={{ y: "12px", filter: "blur(2px)", opacity: 0 }}
            animate={{ y: "0", filter: "blur(0px)", opacity: 1 }}
            exit={{ y: "-12px", filter: "blur(2px)", opacity: 0 }}
            transition={{ type: "spring", bounce: 0.35 }}
          >
            {n}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function BellSvg() {
  return (
    <svg
      className="absolute inset-0"
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

function PlaySvg({ key: _key }: { key?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      className="h-4 w-4 fill-current text-[#FDB000]"
      exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
      fill="none"
      initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
      transition={{ duration: reduceMotion ? 0.01 : 0.1 }}
      viewBox="0 0 12 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0.9375 13.2422C1.25 13.2422 1.51562 13.1172 1.82812 12.9375L10.9375 7.67188C11.5859 7.28906 11.8125 7.03906 11.8125 6.625C11.8125 6.21094 11.5859 5.96094 10.9375 5.58594L1.82812 0.3125C1.51562 0.132812 1.25 0.015625 0.9375 0.015625C0.359375 0.015625 0 0.453125 0 1.13281V12.1172C0 12.7969 0.359375 13.2422 0.9375 13.2422Z" />
    </motion.svg>
  );
}

function PauseSvg({ key: _key }: { key?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      className="h-4 w-4 fill-current text-[#FDB000]"
      exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
      fill="none"
      initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
      transition={{ duration: reduceMotion ? 0.01 : 0.1 }}
      viewBox="0 0 10 13"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.03906 12.7266H2.82031C3.5 12.7266 3.85938 12.3672 3.85938 11.6797V1.03906C3.85938 0.328125 3.5 0 2.82031 0H1.03906C0.359375 0 0 0.359375 0 1.03906V11.6797C0 12.3672 0.359375 12.7266 1.03906 12.7266ZM6.71875 12.7266H8.49219C9.17969 12.7266 9.53125 12.3672 9.53125 11.6797V1.03906C9.53125 0.328125 9.17969 0 8.49219 0H6.71875C6.03125 0 5.67188 0.359375 5.67188 1.03906V11.6797C5.67188 12.3672 6.03125 12.7266 6.71875 12.7266Z" />
    </motion.svg>
  );
}

function CloseSvg() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export { DynamicIsland };
