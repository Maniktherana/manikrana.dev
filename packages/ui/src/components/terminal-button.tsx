import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "@workspace/ui/lib/utils"

type TerminalButtonVariant = "default" | "secondary" | "solid"

type TerminalButtonProps = Omit<ButtonPrimitive.Props, "variant"> & {
  variant?: TerminalButtonVariant
}

// Base: exact match to commit-mono button styles
const base =
  "align-top border-0 bg-transparent font-[inherit] text-[0.75rem] leading-[1rem] w-max whitespace-nowrap text-left relative [text-decoration-skip-ink:none] underline-offset-[0.24ch] cursor-pointer disabled:opacity-40 disabled:pointer-events-none"

const variants: Record<TerminalButtonVariant, string> = {
  // default: no underline, light dither on hover (was ghost)
  default:
    "no-underline hover:dither-25 active:dither-75",
  // secondary: underlined, heavy dither on hover (was default)
  secondary:
    "underline hover:dither-75 hover:text-(--terminal-bg) hover:no-underline active:dither-75",
  // solid: dark bg, light text (was inverted)
  solid:
    "bg-(--terminal-text) text-(--terminal-bg) no-underline hover:dither-75 active:dither-75",
}

function TerminalButton({
  className,
  variant = "default",
  ...props
}: TerminalButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="terminal-button"
      className={cn(base, variants[variant], className)}
      {...props}
    />
  )
}

export { TerminalButton }
export type { TerminalButtonProps, TerminalButtonVariant }
