"use client";

import { useEffect } from "react";
import { motion, useAnimationControls, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { easeOut } from "@manikrana/ui/lib/motion";

type ErrorShakeProps = Omit<HTMLMotionProps<"div">, "animate" | "initial" | "transition"> & {
  shakeKey?: number;
};

function ErrorShake({ shakeKey = 0, className, ...props }: ErrorShakeProps) {
  const controls = useAnimationControls();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    controls.stop();
    controls.set({ x: 0 });
    if (shakeKey > 0 && !reducedMotion) {
      void controls.start({
        x: [0, 6, -6, 4, 0],
        transition: {
          duration: 0.28,
          times: [0, 0.2857, 0.5714, 0.7857, 1],
          ease: easeOut,
        },
      });
    }
    return () => controls.stop();
  }, [controls, shakeKey, reducedMotion]);

  return (
    <motion.div
      {...props}
      data-slot="error-shake"
      className={cn(
        "[&_[data-slot=input]]:transition-[background-color,box-shadow] [&_[data-slot=input]]:duration-150 [&_[data-slot=input][aria-invalid=true]]:duration-[280ms]",
        className,
      )}
      initial={false}
      animate={controls}
    />
  );
}

type ErrorMessageProps = Omit<
  HTMLMotionProps<"p">,
  "animate" | "initial" | "exit" | "transition"
> & {
  show: boolean;
};

function ErrorMessage({ show, className, ...props }: ErrorMessageProps) {
  return (
    <motion.p
      {...props}
      data-slot="error-message"
      role={show ? "alert" : undefined}
      aria-hidden={!show}
      className={cn("text-sm text-destructive", className)}
      initial={false}
      animate={{ opacity: show ? 1 : 0, visibility: show ? "visible" : "hidden" }}
      transition={{
        opacity: { type: "tween", duration: 0.28, ease: [0, 0, 0.58, 1] },
        visibility: { duration: 0, delay: show ? 0 : 0.28 },
      }}
    />
  );
}

export { ErrorShake, ErrorMessage, type ErrorShakeProps, type ErrorMessageProps };
