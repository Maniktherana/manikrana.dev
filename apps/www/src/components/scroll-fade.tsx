import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ProgressiveBlur } from "@/components/progressive-blur";

export function ScrollFade() {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, [0, 64], [0, 1]);

  return (
    <motion.div
      aria-hidden="true"
      style={reducedMotion ? { opacity: progress } : { scaleY: progress }}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-22 origin-top"
    >
      <ProgressiveBlur
        direction="top"
        blurLayers={9}
        blurIntensity={0.25}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-scroll-fade" />
    </motion.div>
  );
}
