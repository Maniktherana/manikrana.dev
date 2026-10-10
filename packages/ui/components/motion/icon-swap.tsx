"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

/* ANIMATION STORYBOARD
 *   0ms   State changes; both icons crossfade, blur, and scale together.
 * 250ms   Selected icon is sharp at full scale; the other is hidden.
 * Reduced motion switches directly to the selected state.
 */
const TIMING = {
  swapDuration: 250, // Time for both icon layers to reach their next state.
};

const ICON = {
  states: ["a", "b"] as const, // Persistent layers share one grid cell.
  hidden: { opacity: 0, filter: "blur(2px)", scale: 0.25 }, // Departing icon.
  visible: { opacity: 1, filter: "blur(0px)", scale: 1 }, // Selected icon.
  transition: {
    type: "tween" as const, // Preserve the supplied crossfade curve.
    duration: TIMING.swapDuration / 1000,
    ease: [0.42, 0, 0.58, 1] as const, // Symmetric ease-in-out.
  },
  reducedTransition: { duration: 0 }, // Swap immediately without motion.
};

type IconSwapProps = Omit<ComponentProps<"span">, "children"> & {
  state: "a" | "b";
  a: ReactNode;
  b: ReactNode;
};

function IconSwap({ state, a, b, className, ...props }: IconSwapProps) {
  const reducedMotion = useReducedMotion();
  return (
    <span
      aria-hidden="true"
      {...props}
      data-slot="icon-swap"
      data-state={state}
      className={cn("relative inline-grid", className)}
    >
      {ICON.states.map((icon) => (
        <motion.span
          key={icon}
          data-icon={icon}
          className="col-start-1 row-start-1 grid place-items-center"
          initial={false}
          animate={icon === state ? ICON.visible : ICON.hidden}
          transition={reducedMotion ? ICON.reducedTransition : ICON.transition}
        >
          {icon === "a" ? a : b}
        </motion.span>
      ))}
    </span>
  );
}

export { IconSwap, type IconSwapProps };
