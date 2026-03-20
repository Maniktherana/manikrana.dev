import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { NavRow } from "@workspace/ui/components/nav-row"
import { DiffInput } from "@workspace/ui/components/hyperdiff/DiffInput"
import { KeyboardHint } from "@workspace/ui/components/hyperdiff/KeyboardHint"
import { TerminalButton } from "@workspace/ui/components/terminal-button"
import { useKeyboardNav } from "../hooks/useKeyboardNav"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const navigate = useNavigate()
  useKeyboardNav("[data-section='main']")

  return (
    <>
      <main
        data-section="main"
        id="main-section"
        className="flex flex-col gap-4 p-8"
      >
        {/* <h1
          tabIndex={0}
          className="m-0 text-[1.5rem] leading-[2rem] font-normal text-(--terminal-text)"
        >
          01 Hyperdiff
        </h1>

        <p tabIndex={0} className="m-0 max-w-[60ch] text-(--terminal-text)">
          A terminal-first diff tool for inspecting and comparing text, structured
          data, and source files. Built for speed, designed for clarity.
        </p>

        <hr className="border-0 border-t border-t-(--terminal-text) m-0 opacity-25" /> */}

        <DiffInput onCompare={() => navigate({ to: "/diff" })} />

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
