"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { easeOut } from "@manikrana/ui/lib/motion";
import { cn } from "@manikrana/ui/lib/utils";

type CardResizeProps = Omit<HTMLMotionProps<"div">, "animate" | "initial" | "transition"> & {
  width: number | string;
  height: number | string;
};

function CardResize({ width, height, className, ...props }: CardResizeProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      {...props}
      data-slot="card-resize"
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={{ width, height }}
      transition={reducedMotion ? { duration: 0 } : { type: "tween", duration: 0.3, ease: easeOut }}
    />
  );
}

export { CardResize, type CardResizeProps };
