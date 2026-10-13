import { Fragment, type ReactNode } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";

export const STREAM = {
  start: 80,
  perWord: 46,
  rise: 4,
  blur: 4,
  word: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } satisfies Transition,
};

export function streamDuration(count: number) {
  return STREAM.start + (count - 1) * STREAM.perWord + STREAM.word.duration * 1000;
}

export function words(text: string) {
  return text.split(" ").filter(Boolean);
}

type StreamProps = {
  tokens: readonly ReactNode[];
  play: boolean;
};

export function Stream({ tokens, play }: StreamProps) {
  const reduceMotion = useReducedMotion();

  return tokens.map((token, index) => (
    <Fragment key={index}>
      {index > 0 && " "}
      <motion.span
        initial={false}
        animate={
          play
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: STREAM.rise, filter: `blur(${STREAM.blur}px)` }
        }
        transition={
          play && !reduceMotion
            ? { ...STREAM.word, delay: (STREAM.start + index * STREAM.perWord) / 1000 }
            : { duration: 0 }
        }
        className="inline-block"
      >
        {token}
      </motion.span>
    </Fragment>
  ));
}
