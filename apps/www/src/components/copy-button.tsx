import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { Gust } from "@maniktherana/gust";
import { IconSwap } from "@manikrana/ui/components/motion/icon-swap";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CheckIcon } from "@/components/icons/check";
import { CopyIcon } from "@/components/icons/copy";
import type { Sound } from "@/lib/sounds";

const RESET_MS = 1600;
const MotionButton = motion.create(Button);
const layoutTransition: Transition = {
  type: "tween",
  duration: 0.25,
  ease: [0.25, 1, 0.5, 1],
};

export function CopyButton({
  value,
  label,
  copiedLabel = "Copied",
  iconOnly = false,
  sound = "copy",
  className,
}: {
  value: string | (() => string);
  label: string;
  copiedLabel?: string;
  iconOnly?: boolean;
  sound?: Sound;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const reducedMotion = useReducedMotion();
  const animateLayout = !iconOnly && !reducedMotion;
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), RESET_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <MotionButton
      layout={animateLayout}
      initial={false}
      transition={{ layout: layoutTransition }}
      style={{ borderRadius: 12 }}
      variant="resource"
      size={iconOnly ? "icon" : "default"}
      aria-label={iconOnly ? label : undefined}
      data-sound={sound}
      className={cn("font-normal", !iconOnly && "gap-2 ps-2.5 pe-3", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(typeof value === "function" ? value() : value);
        setCopied(true);
      }}
    >
      <motion.span
        layout={animateLayout ? "position" : false}
        transition={{ layout: layoutTransition }}
        className="inline-flex items-center gap-2"
      >
        <IconSwap
          state={copied ? "b" : "a"}
          a={<CopyIcon />}
          b={<CheckIcon />}
          className="size-4"
        />
        {!iconOnly && <Gust motion={{ exitBlur: 2 }}>{copied ? copiedLabel : label}</Gust>}
      </motion.span>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </MotionButton>
  );
}
