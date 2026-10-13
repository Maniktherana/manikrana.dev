import type { ComponentProps } from "react";
import { cn } from "@manikrana/ui/lib/utils";

export function Bar({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("block h-3 shrink-0 rounded-full bg-control-selected", className)}
      {...props}
    />
  );
}

export function Blob({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("block shrink-0 rounded-full bg-control-selected", className)}
      {...props}
    />
  );
}
