"use client";

import type { ComponentType } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { easeOut } from "@manikrana/ui/lib/motion";

const tags = { div: motion.div, span: motion.span, li: motion.li, a: motion.a };

type Tag = keyof typeof tags;

type PresenceFadeProps<T extends Tag = "div"> = { as?: T } & Omit<
  HTMLMotionProps<T>,
  "initial" | "animate" | "exit"
>;

function PresenceFade<T extends Tag = "div">({ as, transition, ...props }: PresenceFadeProps<T>) {
  const Component = tags[as ?? "div"] as ComponentType<HTMLMotionProps<Tag>>;
  return (
    <Component
      data-slot="presence-fade"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: easeOut, ...transition }}
      {...props}
    />
  );
}

export { PresenceFade, type PresenceFadeProps };
