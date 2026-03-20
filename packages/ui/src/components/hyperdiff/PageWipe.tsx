import { useEffect, useRef } from "react"

export function PageWipe({ trigger }: { trigger: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove("page-wipe-active")
    setTimeout(() => el.classList.add("page-wipe-active"), 10)
  }, [trigger])

  return (
    <div
      ref={ref}
      className="page-wipe-overlay"
      style={{ pointerEvents: "none" }}
    />
  )
}
