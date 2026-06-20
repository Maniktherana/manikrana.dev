"use client";

import * as React from "react";
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

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant={variant} size={size} type="button" aria-label="Copy" {...props} />}
        onClick={() => {
          void navigator.clipboard?.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {children ?? (copied ? <CheckIcon /> : <CopyIcon />)}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
    </Tooltip>
  );
}

export { CopyButton };
