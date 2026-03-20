import { motion, useReducedMotion } from "motion/react"

export function OrangeSplitAnimation() {
  const prefersReducedMotion = useReducedMotion()
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: [0.215, 0.61, 0.355, 1] as const }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 aspect-square w-[23%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff7d2e]"
        initial={{ scale: 0.92, y: "10%", opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: "10%", opacity: 0 }}
        transition={transition}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-[#ffd7b0]"
          initial={{ scaleY: 0, originY: 1, opacity: 0 }}
          animate={{ scaleY: 1, originY: 1, opacity: 1 }}
          exit={{ scaleY: 0, originY: 1, opacity: 0 }}
          transition={{ ...transition, duration: prefersReducedMotion ? 0 : 0.16 }}
        />
      </motion.div>
    </div>
  )
}
