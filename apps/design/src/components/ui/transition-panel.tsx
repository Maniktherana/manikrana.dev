"use client";

import * as React from "react";
import { AnimatePresence, type MotionProps, type Transition, type Variant, motion } from "motion/react";

import { cn } from "@/lib/utils";

export type TransitionPanelProps = {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

/**
 * Swaps between indexed panels with an enter/exit transition. The active panel
 * fills the (relative, clipped) container so it works for fixed-height shells
 * like a docked side panel or sheet.
 */
export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  ...motionProps
}: TransitionPanelProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <AnimatePresence initial={false} mode="popLayout" custom={motionProps.custom}>
        <motion.div
          key={activeIndex}
          className="absolute inset-0"
          variants={variants}
          transition={transition}
          initial="enter"
          animate="center"
          exit="exit"
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
