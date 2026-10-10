"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "motion/react";
import { easeOut } from "@manikrana/ui/lib/motion";

const ReducedMotionContext = createContext(false);
const tags = {
  div: motion.div,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  span: motion.span,
  strong: motion.strong,
};

type StaggerRevealProps = Omit<HTMLMotionProps<"div">, "animate" | "initial" | "variants"> & {
  show: boolean;
};

function StaggerReveal({ show, ...props }: StaggerRevealProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const [shownOnce, setShownOnce] = useState(show);
  useEffect(() => {
    if (show) setShownOnce(true);
  }, [show]);
  return (
    <ReducedMotionContext value={reducedMotion}>
      <motion.div
        {...props}
        data-slot="stagger-reveal"
        initial={show ? "shown" : "hidden"}
        animate={show ? "shown" : shownOnce ? "hiding" : "hidden"}
        variants={{
          hidden: {},
          shown: { transition: { staggerChildren: reducedMotion ? 0 : 0.04 } },
          hiding: { transition: { staggerChildren: 0 } },
        }}
        inert={!show}
        aria-hidden={!show}
      />
    </ReducedMotionContext>
  );
}

function StaggerLine({
  as = "div",
  className,
  children,
}: {
  as?: keyof typeof tags;
  className?: string;
  children?: ReactNode;
}) {
  const reducedMotion = useContext(ReducedMotionContext);
  const Tag = tags[as];
  const variants = {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : 12,
      filter: reducedMotion ? "blur(0px)" : "blur(3px)",
    },
    shown: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "tween", duration: reducedMotion ? 0 : 0.5, ease: easeOut },
    },
    hiding: {
      opacity: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        opacity: { type: "tween", duration: reducedMotion ? 0 : 0.2, ease: [0.25, 0.1, 0.25, 1] },
        y: { duration: 0 },
        filter: { duration: 0 },
      },
    },
  } satisfies Variants;

  return (
    <Tag data-slot="stagger-line" className={className} variants={variants}>
      {children}
    </Tag>
  );
}

export { StaggerReveal, StaggerLine, type StaggerRevealProps };
