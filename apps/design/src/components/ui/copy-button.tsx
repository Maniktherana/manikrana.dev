"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

function CopyButtonIcon({ copied }: { copied: boolean }) {
  const iconClassName =
    "absolute inset-0 size-[15px] transition-[opacity,filter,scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)]";

  return (
    <span aria-hidden="true" data-slot="copy-button-icon" className="relative block size-[15px]">
      <CopyIcon
        className={cn(
          iconClassName,
          copied ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
        )}
      />
      <CheckIcon
        className={cn(
          iconClassName,
          copied ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
        )}
      />
    </span>
  );
}

export { CopyButton };
