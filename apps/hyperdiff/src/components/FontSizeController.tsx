"use client"
import { useEffect } from "react"

const STEP = 0.125
const MIN = 0.5
const MAX = 1.5
const DEFAULT = 0.75
const SESSION_KEY = "hyperdiff_font_size"

function getSize(): number {
  const stored = sessionStorage.getItem(SESSION_KEY)
  return stored ? parseFloat(stored) : DEFAULT
}

function applySize(size: number) {
  const lineHeight = Math.round((size * (4 / 3)) / 0.125) * 0.125
  document.documentElement.style.setProperty("--editor-font-size", `${size}rem`)
  document.documentElement.style.setProperty("--editor-line-height", `${lineHeight}rem`)
  sessionStorage.setItem(SESSION_KEY, String(size))
}

export function FontSizeController() {
  useEffect(() => {
    applySize(getSize())

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return

      if (e.key === "+" || e.key === "=") {
        const next = Math.min(MAX, Math.round((getSize() + STEP) * 1000) / 1000)
        applySize(next)
      } else if (e.key === "-") {
        const next = Math.max(MIN, Math.round((getSize() - STEP) * 1000) / 1000)
        applySize(next)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return null
}
