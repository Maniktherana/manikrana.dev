import type { CSSProperties } from "react"

type NavRowProps = {
  children: React.ReactNode
  style?: CSSProperties
  className?: string
}

export function NavRow({ children, style, className }: NavRowProps) {
  return (
    <div
      data-nav-axis="horizontal"
      className={className}
      style={{ display: "flex", gap: "2ch", flexWrap: "wrap", ...style }}
    >
      {children}
    </div>
  )
}
