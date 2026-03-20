import { motion, useReducedMotion } from "motion/react"

export function BlueRingAnimation() {
  const prefersReducedMotion = useReducedMotion()
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.215, 0.61, 0.355, 1] as const }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1ca8eb]"
        initial={{ scale: 0.92, x: "14%", opacity: 0 }}
        animate={{ scale: 1, x: 0, opacity: 1 }}
        exit={{ scale: 0.92, x: "14%", opacity: 0 }}
        transition={transition}
      >
        <div className="absolute left-[22%] top-1/2 aspect-square w-[56%] -translate-y-1/2 rounded-full bg-[#2f86e5]" />
        <div className="absolute left-[52%] top-1/2 aspect-square w-[44%] -translate-y-1/2 rounded-full bg-[#2fa1d8]" />
      </motion.div>
    </div>
  )
}
