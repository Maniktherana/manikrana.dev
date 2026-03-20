import { motion, useReducedMotion } from "motion/react"

function Arc({
  className,
  innerClassName,
}: {
  className: string
  innerClassName: string
}) {
  return (
    <div className={className}>
      <div className={innerClassName} />
    </div>
  )
}

export function LavenderArcAnimation() {
  const prefersReducedMotion = useReducedMotion()
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] as const }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-0 aspect-square w-[30%] -translate-x-1/2"
        initial={{ y: "-14%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-14%", opacity: 0 }}
        transition={transition}
      >
        <Arc
          className="absolute left-1/2 top-[-58%] aspect-square w-[172%] -translate-x-1/2 rounded-full bg-[#cbc7ec]"
          innerClassName="absolute left-1/2 top-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8f89e8]"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-1/2 aspect-square w-[30%] -translate-x-1/2"
        initial={{ y: "14%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "14%", opacity: 0 }}
        transition={transition}
      >
        <Arc
          className="absolute bottom-[-58%] left-1/2 aspect-square w-[172%] -translate-x-1/2 rounded-full bg-[#d8d4f0]"
          innerClassName="absolute left-1/2 top-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8b3ef]"
        />
      </motion.div>
    </div>
  )
}
