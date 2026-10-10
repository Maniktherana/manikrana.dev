import { Fragment, type ReactNode } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";

// Puch's reveal pace, from its web and mobile markdown: the first word 80ms after the reply
// starts, then a word every 46ms. Each word rises out of a light blur as it lands.
export const STREAM = {
  start: 80, // ms before the first word
  perWord: 46, // ms between words
  rise: 4, // px each word rises
  blur: 4, // px of blur each word clears
  word: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } satisfies Transition, // ease-out-quint
};

// How long `count` tokens take to stream, in ms, until the last one has settled.
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

// The tokens hold their place while hidden, so the text never reflows as it streams. With
// reduced motion they appear together, at once.
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
