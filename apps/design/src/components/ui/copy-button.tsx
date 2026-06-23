"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type CopyButtonProps = React.ComponentProps<typeof Button> & {
  value: string;
};

function CopyButton({
  value,
  variant = "ghost",
  size = "icon",
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const resetCopiedRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    return () => window.clearTimeout(resetCopiedRef.current);
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant={variant} size={size} type="button" aria-label="Copy" {...props} />}
        onClick={() => {
          void navigator.clipboard?.writeText(value);
          window.clearTimeout(resetCopiedRef.current);
          setCopied(true);
          resetCopiedRef.current = window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {children ?? <CopyButtonIcon copied={copied} />}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
    </Tooltip>
  );
}

const COPY_ICON_TRANSITION = { type: "spring", duration: 0.3, bounce: 0 } as const;

function CopyButtonIcon({ copied }: { copied: boolean }) {
  return (
    <span aria-hidden="true" data-slot="copy-button-icon" className="relative block size-4">
      <motion.span
        className="absolute inset-0 flex"
        initial={false}
        animate={{
          scale: copied ? 0.25 : 1,
          opacity: copied ? 0 : 1,
          filter: copied ? "blur(4px)" : "blur(0px)",
        }}
        transition={COPY_ICON_TRANSITION}
      >
        <CopyIcon className="size-4" />
      </motion.span>
      <motion.span
        className="absolute inset-0 flex"
        initial={false}
        animate={{
          scale: copied ? 1 : 0.25,
          opacity: copied ? 1 : 0,
          filter: copied ? "blur(0px)" : "blur(4px)",
        }}
        transition={COPY_ICON_TRANSITION}
      >
        <CheckIcon className="size-4" />
      </motion.span>
    </span>
  );
}

export { CopyButton };
