import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { DiffView } from "@workspace/ui/components/hyperdiff/DiffView"
import { KeyboardHint } from "@workspace/ui/components/hyperdiff/KeyboardHint"
import { PageWipe } from "@workspace/ui/components/hyperdiff/PageWipe"
import { NavRow } from "@workspace/ui/components/nav-row"
import { TerminalButton } from "@workspace/ui/components/terminal-button"
import { useEffect, useState } from "react"
import { useKeyboardNav } from "../hooks/useKeyboardNav"

export const Route = createFileRoute("/diff")({ component: DiffPage })

function DiffPage() {
  const navigate = useNavigate()
  const [texts, setTexts] = useState<{ textA: string; textB: string } | null>(
    null
  )
  const [mode, setMode] = useState<"unified" | "split">("unified")
  useKeyboardNav("[data-section='diff']")

  useEffect(() => {
    const stored = sessionStorage.getItem("hyperdiff_input")
    if (!stored) {
      navigate({ to: "/" })
      return
    }
    setTexts(JSON.parse(stored))
  }, [navigate])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const tag = target.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable)
        return
      if (e.key === "u") {
        setMode((m) => (m === "unified" ? "split" : "unified"))
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!texts) return null

  return (
    <>
      <PageWipe trigger={0} />
      <main data-section="diff" className="flex flex-col gap-4 p-8">
        {/* <div className="flex items-center gap-4">
          <TerminalButton
            variant="secondary"
            onClick={() => navigate({ to: "/" })}
          >
            ← Back
          </TerminalButton>
          <h1
            tabIndex={0}
            className="m-0 text-[1.5rem] leading-[2rem] font-normal text-(--terminal-text)"
          >
            02 Diff
          </h1>
          <TerminalButton
            variant="secondary"
            onClick={() => setMode((m) => (m === "unified" ? "split" : "unified"))}
          >
            [U] {mode === "unified" ? "Split" : "Unified"}
          </TerminalButton>
        </div> */}

        <DiffView
          textA={texts.textA}
          textB={texts.textB}
          mode={mode}
          language={undefined}
        />

        {/* <hr className="m-0 border-0 border-t border-t-(--terminal-text) opacity-25" /> */}

        {/* <NavRow>
          <TerminalButton variant="default">Default</TerminalButton>
          <TerminalButton variant="secondary">Secondary</TerminalButton>
          <TerminalButton variant="solid">Solid</TerminalButton>
        </NavRow> */}
      </main>
      <KeyboardHint />
    </>
  )
}
