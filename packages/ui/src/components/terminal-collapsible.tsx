"use client"
import { type CSSProperties, type ReactNode, useId, useState } from "react"
import { TerminalButton } from "./terminal-button"

type TerminalCollapsibleProps = {
  label: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  /** Renders a full-width bordered row — used for diff hunk headers */
  bordered?: boolean
  /** Number of lines in the content — when provided, makes each animation step reveal exactly one line */
  lines?: number
}

function TerminalCollapsible({
  label,
  children,
  defaultOpen = false,
  bordered = false,
  lines,
}: TerminalCollapsibleProps) {
  const revealStyle: CSSProperties | undefined = lines != null
    ? {
        animationDuration: `${Math.max(128, lines * 32)}ms`,
        animationTimingFunction: `steps(${lines}, jump-start)`,
      }
    : undefined
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  if (bordered) {
    return (
      <div>
        <div
          style={{
            borderTop: "1px solid var(--terminal-text)",
            borderBottom: "1px solid var(--terminal-text)",
          }}
        >
          <TerminalButton
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((o) => !o)}
            style={{ width: "100%", padding: "0 0.5rem" }}
          >
            {open ? "▼" : "▶"} {label}
          </TerminalButton>
        </div>
        {open && (
          <div id={id} className="terminal-collapsible-content" style={revealStyle}>
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <TerminalButton
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "▼" : "▶"} {label}
      </TerminalButton>
      {open && (
        <div
          id={id}
          className="terminal-collapsible-content"
          style={{ marginTop: "0.5rem", ...revealStyle }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export { TerminalCollapsible }
export type { TerminalCollapsibleProps }
