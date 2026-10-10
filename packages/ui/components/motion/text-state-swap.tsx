"use client";

import type { ComponentProps } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

type TextStateSwapProps = Omit<ComponentProps<"span">, "children"> & {
  children: string | number;
};

function TextStateSwap({ children, className, ...props }: TextStateSwapProps) {
  const reducedMotion = useReducedMotion();

  return (
    <span {...props} data-slot="text-state-swap" className={cn("inline-grid min-w-0", className)}>
      <span className="sr-only">{children}</span>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={children}
          aria-hidden="true"
          className="col-start-1 row-start-1 min-w-0"
          initial={reducedMotion ? false : { y: 4, filter: "blur(2px)", opacity: 0 }}
          animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: -4, filter: "blur(2px)", opacity: 0 }}
          transition={{
            type: "tween",
            duration: reducedMotion ? 0 : 0.15,
            ease: [0.42, 0, 0.58, 1],
          }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export { TextStateSwap, type TextStateSwapProps };
