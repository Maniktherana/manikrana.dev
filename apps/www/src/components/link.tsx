import { Link as BaseLink } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import type { ComponentProps } from "react";

export function Link({
  variant = "default",
  className,
  ...props
}: ComponentProps<typeof BaseLink> & { variant?: "default" | "prose" }) {
  return (
    <BaseLink
      className={cn(
        "font-[450] motion-safe:duration-200 motion-safe:ease-[ease] motion-reduce:transition-none",
        variant === "prose"
          ? "inline whitespace-normal"
          : "inline-flex items-baseline gap-1 whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}
