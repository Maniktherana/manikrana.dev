import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

export type GradientStop = { color: string; at: number };

export type GradientProps = {
  stops?: readonly GradientStop[];
  paused?: boolean;
  appear?: boolean;
  className?: string;
};

const GREEN: readonly GradientStop[] = [
  { color: "#fff", at: 40 },
  { color: "#76ED5E73", at: 60 },
  { color: "#76ED5Eb3", at: 70 },
  { color: "#26EE9F", at: 90 },
];

const SIZE = 80;
const RANGE = 10;
const SPEED = 0.9;
const HIDDEN = { opacity: 0, scale: 1.5 } as const;
const REST = { opacity: 1, scale: 1 } as const;
const ENTRANCE = { duration: 2, ease: [0.25, 0.1, 0.25, 1] } as const;

// The layer is 130% of the box, so the box's 80% radius and 20% centre become these shares of it.
// The layer's transform origin repeats the centre, so scaling it is the same as resizing the radius.
const SHAPE = "61.538% 61.538% at 50% 26.923%";

const BREATHING: Keyframe[] = [
  { offset: 0, transform: "scale(1)" },
  { offset: 0.25, transform: `scale(${1 + RANGE / SIZE})` },
  { offset: 0.75, transform: `scale(${1 - RANGE / SIZE})` },
  { offset: 1, transform: "scale(1)" },
];
const BREATHING_MS = ((4 * RANGE) / SPEED) * 1000;

export function Gradient({
  stops = GREEN,
  paused = false,
  appear = true,
  className,
}: GradientProps) {
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(false);
  const layer = useRef<HTMLDivElement>(null);
  const breathing = useRef<Animation>(null);
  const colors = stops.map(({ color, at }) => `${color} ${at}%`).join(", ");

  if (!paused && !started) setStarted(true);

  useEffect(() => {
    const animation = layer.current?.animate(BREATHING, {
      duration: BREATHING_MS,
      iterations: Infinity,
      easing: "linear",
    });
    if (!animation) return;
    animation.pause();
    breathing.current = animation;
    return () => animation.cancel();
  }, []);

  useEffect(() => {
    const animation = breathing.current;
    if (!animation) return;
    if (reduced) animation.currentTime = 0;
    if (paused || reduced) animation.pause();
    else animation.play();
  }, [paused, reduced]);

  return (
    <motion.div
      data-slot="gradient"
      aria-hidden="true"
      initial={appear ? HIDDEN : false}
      animate={started || !appear || reduced ? REST : HIDDEN}
      transition={reduced ? { duration: 0 } : ENTRANCE}
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <div
        ref={layer}
        style={{ "--gradient": `radial-gradient(${SHAPE}, ${colors})` } as CSSProperties}
        className="absolute -inset-[15%] origin-[50%_26.923%] bg-(image:--gradient)"
      />
    </motion.div>
  );
}
