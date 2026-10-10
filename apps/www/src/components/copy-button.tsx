import { useEffect, useState, type ReactNode } from "react";
import { Gust } from "@maniktherana/gust";
import { IconSwap } from "@manikrana/ui/components/motion/icon-swap";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { quietGust } from "@/lib/gust";

const RESET_MS = 1600;

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
      <IconSwap state={copied ? "b" : "a"} a={icon} b={<CheckIcon />} className="size-4" />
      {!iconOnly && <Gust value={copied ? copiedLabel : label} {...quietGust} />}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </Button>
  );
}
