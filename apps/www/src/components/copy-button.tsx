import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CheckIcon, CopyIcon } from "@/components/icons";

const RESET_MS = 1600;

// The contextual icon swap: scale, opacity and blur on a spring with no bounce.
const ICON = {
  hidden: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  shown: { opacity: 1, scale: 1, filter: "blur(0px)" },
  spring: { type: "spring", duration: 0.3, bounce: 0 },
} as const;

// Copies text and confirms with a check that swaps in for the icon. `value`
// may be a function, so a long prompt is only built when someone copies it.
export function CopyButton({
  value,
  label,
  copiedLabel = "Copied",
  icon = <CopyIcon />,
  iconOnly = false,
  className,
}: {
  value: string | (() => string);
  label: string;
  copiedLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      variant="secondary"
      size={iconOnly ? "icon" : "default"}
      aria-label={iconOnly ? label : undefined}
      className={cn(
        "rounded-xl font-normal text-control-foreground hover:text-foreground",
        !iconOnly && "gap-2 ps-2.5 pe-3",
        className,
      )}
      onClick={async () => {
        await navigator.clipboard.writeText(typeof value === "function" ? value() : value);
        setCopied(true);
      }}
    >
      <span className="grid size-4 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "copied" : "idle"}
            className="grid"
            initial={ICON.hidden}
            animate={ICON.shown}
            exit={ICON.hidden}
            transition={ICON.spring}
          >
            {copied ? <CheckIcon /> : icon}
          </motion.span>
        </AnimatePresence>
      </span>
      {!iconOnly && <span>{copied ? copiedLabel : label}</span>}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  );
}
