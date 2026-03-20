import type { CSSProperties, ComponentProps } from "react"

type TerminalKbdProps = ComponentProps<"kbd"> & { active?: boolean }

function TerminalKbd({ active = false, style, children, ...props }: TerminalKbdProps) {
  const baseStyle: CSSProperties = {
    display: "inline-block",
    fontFamily: "monospace",
    fontSize: "0.75rem",
    lineHeight: active ? "0.75rem" : "1rem",
    padding: "0 calc(0.5ch - 0.0625rem)",
    border: "0.0625rem solid var(--terminal-text)",
    borderBottomWidth: active ? "0.0625rem" : "0.125rem",
    marginTop: active ? "0.1rem" : "0",
    background: active ? "var(--terminal-text)" : "transparent",
    color: active ? "var(--terminal-bg)" : "var(--terminal-text)",
    userSelect: "none",
    ...style,
  }

  return (
    <kbd style={baseStyle} {...props}>
      {children}
    </kbd>
  )
}

function TerminalKbdGroup({ style, ...props }: ComponentProps<"div">) {
  const groupStyle: CSSProperties = {
    display: "inline-flex",
    gap: "1ch",
    ...style,
  }

  return <div style={groupStyle} {...props} />
}

export { TerminalKbd, TerminalKbdGroup }
