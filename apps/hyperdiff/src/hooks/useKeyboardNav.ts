import { useEffect } from "react"

function addShake(el: HTMLElement | null, cls: string) {
  if (!el) return
  el.classList.remove(cls)
  void el.offsetHeight
  el.classList.add(cls)
  el.addEventListener("animationend", () => el.classList.remove(cls), { once: true })
}

function getFocusables(root: Element): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[tabindex='0'], button:not(:disabled), a[href]")
  ).filter(el => el.offsetParent !== null)
}

// For vertical nav: deduplicate items inside [data-nav-axis="horizontal"] rows.
// Only the first item of each row is kept as the representative stop.
function getVerticalStops(section: Element): HTMLElement[] {
  const seen = new Set<Element>()
  return getFocusables(section).filter(el => {
    const row = el.closest("[data-nav-axis='horizontal']")
    if (!row) return true
    if (seen.has(row)) return false
    seen.add(row)
    return true
  })
}

export function useKeyboardNav(sectionSelector: string) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isVertical = e.key === "ArrowUp" || e.key === "ArrowDown"
      const isHorizontal = e.key === "ArrowLeft" || e.key === "ArrowRight"
      if (!isVertical && !isHorizontal) return

      const section = document.querySelector(sectionSelector)
      if (!section) return

      const focused = document.activeElement as HTMLElement

      // --- Horizontal nav: only within a row ---
      if (isHorizontal) {
        const row = focused.closest<HTMLElement>("[data-nav-axis='horizontal']")
        if (!row) return
        e.preventDefault()
        const siblings = getFocusables(row)
        const idx = siblings.indexOf(focused)
        if (e.key === "ArrowRight") {
          const next = siblings[idx + 1]
          if (next) next.focus()
          else addShake(focused, "shake-right")
        } else {
          const prev = siblings[idx - 1]
          if (prev) prev.focus()
          else addShake(focused, "shake-left")
        }
        return
      }

      // --- Vertical nav ---
      e.preventDefault()
      const currentRow = focused.closest<HTMLElement>("[data-nav-axis='horizontal']")

      if (currentRow) {
        // Currently inside a row — exit it vertically
        const allInSection = getFocusables(section)
        const rowItems = getFocusables(currentRow)
        if (e.key === "ArrowDown") {
          const lastInRow = rowItems[rowItems.length - 1]
          const afterRow = allInSection[allInSection.indexOf(lastInRow) + 1]
          if (afterRow) afterRow.focus()
          else addShake(focused, "shake-down")
        } else {
          const firstInRow = rowItems[0]
          const beforeRow = allInSection[allInSection.indexOf(firstInRow) - 1]
          if (beforeRow) beforeRow.focus()
          else addShake(focused, "shake-up")
        }
        return
      }

      // Normal vertical nav using deduped stops
      const stops = getVerticalStops(section)
      const idx = stops.indexOf(focused)
      if (e.key === "ArrowDown") {
        const next = stops[idx + 1]
        if (next) next.focus()
        else addShake(focused, "shake-down")
      } else {
        const prev = stops[idx - 1]
        if (prev) prev.focus()
        else addShake(focused, "shake-up")
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [sectionSelector])
}
