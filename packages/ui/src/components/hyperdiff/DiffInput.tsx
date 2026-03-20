"use client"
import { useState } from "react"

type DiffInputProps = {
  onCompare: () => void
}

const textareaStyle = {
  background: "transparent",
  border: "1px solid var(--terminal-text)",
  fontFamily: "inherit",
  fontSize: "0.75rem",
  lineHeight: "1rem",
  color: "var(--terminal-text)",
  padding: "0.5rem",
  width: "100%",
  resize: "vertical" as const,
  minHeight: "200px",
  outline: "none",
  boxSizing: "border-box" as const,
}

const labelStyle = {
  fontSize: "0.625rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--terminal-mid)",
}

const buttonStyle = {
  background: "transparent",
  border: "none",
  fontFamily: "inherit",
  fontSize: "0.75rem",
  color: "var(--terminal-text)",
  textDecoration: "underline",
  cursor: "pointer",
  padding: "0",
  width: "max-content",
  alignSelf: "center",
}

const buttonDisabledStyle = {
  ...buttonStyle,
  opacity: 0.4,
  cursor: "not-allowed",
}

export function DiffInput({ onCompare }: DiffInputProps) {
  const [textA, setTextA] = useState("")
  const [textB, setTextB] = useState("")

  function handleCompare() {
    sessionStorage.setItem("hyperdiff_input", JSON.stringify({ textA, textB }))
    onCompare()
  }

  const isDisabled = !textA && !textB

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={labelStyle}>File A</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            style={textareaStyle}
            placeholder="Paste original text..."
          />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label style={labelStyle}>File B</label>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            style={textareaStyle}
            placeholder="Paste modified text..."
          />
        </div>
      </div>
      <button
        onClick={handleCompare}
        disabled={isDisabled}
        style={isDisabled ? buttonDisabledStyle : buttonStyle}
      >
        Compare →
      </button>
    </div>
  )
}
