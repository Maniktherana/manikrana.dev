"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion as m } from "motion/react";
import { DEFAULT_MOTION, Gust, type GustMotionOptions } from "@maniktherana/gust";
import { CheckIcon } from "@/components/icons/check";
import { usePrefersReducedMotion } from "@/components/work/gust/use-prefers-reduced-motion";

const steps = [
  { color: "text-muted-foreground", key: "queued", label: "Queued" },
  { color: "text-amber-300", key: "building", label: "Building" },
  { color: "text-sky-400", key: "deploying", label: "Deploying" },
  { color: "text-emerald-400", key: "live", label: "Live" },
] as const;

type StepKey = (typeof steps)[number]["key"];

const layoutTransition = {
  type: "tween",
  duration: 0.25,
  ease: [0.25, 1, 0.5, 1],
} as const;

const glyphTransition =
  "transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";

function StatusGlyph({ children, shown }: { children: ReactNode; shown: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`col-start-1 row-start-1 grid place-items-center ${glyphTransition} ${shown ? "scale-100 opacity-100 blur-none" : "scale-25 opacity-0 blur-xs"}`}
    >
      {children}
    </span>
  );
}

function StatusIcon({ active, animating }: { active: StepKey; animating: boolean }) {
  return (
    <>
      <StatusGlyph shown={active === "queued"}>
        <span
          className={`size-4 rounded-full border-2 border-current ${animating ? "motion-safe:animate-pulse" : ""}`}
        />
      </StatusGlyph>
      <StatusGlyph shown={active === "building"}>
        <svg
          viewBox="0 0 20 20"
          className={`size-4.5 ${animating ? "motion-safe:animate-[spin_1s_linear_infinite_reverse]" : ""}`}
        >
          <path
            d="m5,5.101c1.271-1.297,3.041-2.101,5-2.101,3.866,0,7,3.134,7,7s-3.134,7-7,7c-2.792,0-5.203-1.635-6.326-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <polygon
            points="4.367 3.044 3.771 6.798 7.516 6.145 4.367 3.044"
            fill="currentColor"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </StatusGlyph>
      <StatusGlyph shown={active === "deploying"}>
        <span className="relative grid place-items-center">
          <span
            className={`absolute size-5 rounded-full border-[1.5px] border-current ${animating ? "motion-safe:animate-ping" : ""}`}
          />
          <span className="relative size-2.5 rounded-full bg-current" />
        </span>
      </StatusGlyph>
      <StatusGlyph shown={active === "live"}>
        <CheckIcon className="size-5" />
      </StatusGlyph>
    </>
  );
}

export function StatusDemo({
  motion = DEFAULT_MOTION,
  paused = false,
}: {
  motion?: GustMotionOptions;
  paused?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const step = steps[index] ?? steps[0];

  useEffect(() => {
    if (paused || reducedMotion) return undefined;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % steps.length),
      2100,
    );

    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  return (
    <m.span
      layout={!reducedMotion}
      initial={false}
      transition={{ layout: layoutTransition }}
      style={{ borderRadius: 9999 }}
      className="flex items-center gap-2.5 rounded-full bg-foreground/5 px-4 py-1.5"
    >
      <m.span
        layout={reducedMotion ? false : "position"}
        transition={{ layout: layoutTransition }}
        className="flex items-center gap-2.5"
      >
        <span
          className={`grid size-5 place-items-center transition-colors duration-500 ${step.color}`}
        >
          <StatusIcon active={step.key} animating={!paused && !reducedMotion} />
        </span>
        <Gust motion={motion} className={`text-xl font-semibold ${step.color}`}>
          {step.label}
        </Gust>
      </m.span>
    </m.span>
  );
}
