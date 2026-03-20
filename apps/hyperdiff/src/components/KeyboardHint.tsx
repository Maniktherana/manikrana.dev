"use client"

import { type CSSProperties, useEffect, useState } from "react"
import { TerminalKbd } from "@workspace/ui/components/terminal-kbd"

const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"] as const
type ArrowKey = (typeof ARROW_KEYS)[number]

export function KeyboardHint() {
  const [pressed, setPressed] = useState<Set<ArrowKey>>(new Set())

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (ARROW_KEYS.includes(e.key as ArrowKey)) {
        setPressed((prev) => new Set([...prev, e.key as ArrowKey]))
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (ARROW_KEYS.includes(e.key as ArrowKey)) {
        setPressed((prev) => {
          const next = new Set(prev)
          next.delete(e.key as ArrowKey)
          return next
        })
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  const containerStyle: CSSProperties = {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, max-content)",
    gap: "0.25rem",
  }

  return (
    <div style={containerStyle}>
      {/* Row 1: up arrow centered in middle column */}
      <span />
      <TerminalKbd active={pressed.has("ArrowUp")}>↑</TerminalKbd>
      <span />

      {/* Row 2: left / down / right */}
      <TerminalKbd active={pressed.has("ArrowLeft")}>←</TerminalKbd>
      <TerminalKbd active={pressed.has("ArrowDown")}>↓</TerminalKbd>
      <TerminalKbd active={pressed.has("ArrowRight")}>→</TerminalKbd>
    </div>
  )
}
