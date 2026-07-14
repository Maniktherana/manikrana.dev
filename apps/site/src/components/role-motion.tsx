"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const defaultRoleMotionRoles = [
  "Web Developer",
  "OSS Contributor",
  "Gym rat",
  "SQL > NoSQL",
  "Polyglot Programmer",
  "Check out my talks",
  "Always learning",
];

const ROLE_HOLD_MS = 1600;
const ENTER_DELAY_SECONDS = 0;
const ENTER_STAGGER_SECONDS = 0.012;
const EXIT_STAGGER_SECONDS = 0.008;
const easeOutStrong: [number, number, number, number] = [0.16, 1, 0.3, 1];
type RoleMotionProps = {
  className?: string;
  index?: number;
  roles?: string[];
  style?: CSSProperties;
};

function splitCharacters(text: string) {
  return Array.from(text).map((character, index) => ({
    character,
    key: `${index}-${character}`,
  }));
}

export default function RoleMotion({
  className,
  index: controlledIndex,
  roles = defaultRoleMotionRoles,
  style,
}: RoleMotionProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const safeRoles = roles.length > 0 ? roles : defaultRoleMotionRoles;
  const activeIndex = controlledIndex ?? internalIndex;
  const role = safeRoles[activeIndex % safeRoles.length] ?? "";
  const characters = useMemo(() => splitCharacters(role), [role]);

  const textLayerMotion = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: {},
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      initial: {},
      animate: {
        opacity: 1,
        transition: {
          delayChildren: ENTER_DELAY_SECONDS,
          staggerChildren: ENTER_STAGGER_SECONDS,
        },
      },
      exit: {
        opacity: 1,
        transition: {
          staggerChildren: EXIT_STAGGER_SECONDS,
          staggerDirection: 1,
        },
      },
    };
  }, [reduceMotion]);

  const characterMotion = useMemo(() => {
    if (reduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      initial: {
        opacity: 0,
        y: "72%",
        scale: 0.58,
        filter: "blur(3px)",
      },
      animate: {
        opacity: 1,
        y: ["72%", "-8%", "0%"],
        scale: [0.18, 1],
        filter: ["blur(3px)", "blur(0.5px)", "blur(0px)"],
        transition: {
          opacity: {
            duration: 0.48,
            ease: easeOutStrong,
          },
          filter: {
            duration: 0.42,
            ease: easeOutStrong,
          },
          y: {
            duration: 0.44,
            ease: easeOutStrong,
            times: [0, 1],
          },
          scale: {
            duration: 0.44,
            ease: easeOutStrong,
            times: [0, 1],
          },
        },
      },
      exit: {
        opacity: 0,
        y: "-58%",
        scale: 0.48,
        filter: "blur(3px)",
        transition: {
          opacity: {
            duration: 0.36,
            ease: easeOutStrong,
          },
          filter: {
            duration: 0.34,
            ease: easeOutStrong,
          },
          y: {
            duration: 0.36,
            ease: easeOutStrong,
          },
          scale: {
            duration: 0.36,
            ease: easeOutStrong,
          },
        },
      },
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (controlledIndex !== undefined) return;

    const longestRoleLength = Math.max(...safeRoles.map((nextRole) => nextRole.length));
    const transitionWindowMs =
      (0.24 + ENTER_DELAY_SECONDS + longestRoleLength * ENTER_STAGGER_SECONDS) * 1000;
    const interval = window.setInterval(
      () => {
        setInternalIndex((current) => (current + 1) % safeRoles.length);
      },
      Math.max(ROLE_HOLD_MS, transitionWindowMs + 700),
    );

    return () => window.clearInterval(interval);
  }, [controlledIndex, safeRoles]);

  return (
    <motion.p
      aria-live="polite"
      aria-label={role}
      className={cn(
        "relative -my-1 mx-auto inline-grid w-fit overflow-visible py-1 leading-tight md:mx-0",
        className,
      )}
      style={style}
    >
      <span aria-hidden className="col-start-1 row-start-1 whitespace-nowrap opacity-0">
        {role}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={role}
          className="col-start-1 row-start-1 inline-flex whitespace-nowrap select-none"
          variants={textLayerMotion}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {characters.map((part) => (
            <motion.span
              key={part.key}
              className="inline-block"
              variants={characterMotion}
              style={{ transformOrigin: "50% 50%" }}
            >
              {part.character === " " ? "\u00a0" : part.character}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </motion.p>
  );
}

export { defaultRoleMotionRoles };
