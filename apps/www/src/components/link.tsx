import { Link as BaseLink } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import type { ComponentProps } from "react";

export function Link({ className, ...props }: ComponentProps<typeof BaseLink>) {
  return (
    <BaseLink
      className={cn(
        "inline-flex items-baseline gap-1 whitespace-nowrap font-[450] motion-safe:duration-200 motion-safe:ease-[ease] motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
