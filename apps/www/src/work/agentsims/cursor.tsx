import { arc, motion } from "motion/react";
import type { CursorPoint } from "@/work/agentsims/use-cursor-targets";

const POINTER = {
  travel: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  path: arc({ strength: 0.3, peak: 0.15, rotate: 0.9, direction: "cw" }),
  fade: { duration: 0.12 },
};

// Travels on an arc between targets and turns about its tip, which is inset
// 3.58 units in the 24-unit artwork.
export function DemoCursor({ target, visible }: { target: CursorPoint; visible: boolean }) {
  return (
    <motion.div
      className="absolute top-0 left-0 aspect-square w-[5cqw] origin-[14.917%_14.917%] drop-shadow-[0_2px_2px_oklch(0_0_0/53%)]"
      initial={false}
      animate={target}
      transition={{ ...POINTER.travel, path: POINTER.path }}
    >
      <motion.svg
        className="block size-full"
        viewBox="0 0 24 24"
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={POINTER.fade}
      >
        <path
          d="M18.5762 8.94287L4.87859 3.58295C4.06653 3.26519 3.26519 4.06653 3.58295 4.8786L8.94287 18.5762C9.20565 19.2477 10.0713 19.4288 10.5812 18.9189L12.1465 17.3536C12.3417 17.1583 12.6583 17.1583 12.8536 17.3536L16.6465 21.1465C16.8417 21.3417 17.1583 21.3417 17.3536 21.1465L21.1465 17.3536C21.3417 17.1583 21.3417 16.8417 21.1465 16.6465L17.3536 12.8536C17.1583 12.6583 17.1583 12.3417 17.3536 12.1465L18.9189 10.5812C19.4288 10.0713 19.2477 9.20565 18.5762 8.94287Z"
          fill="black"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}
