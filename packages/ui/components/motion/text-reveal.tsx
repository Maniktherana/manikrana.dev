import type { ComponentProps, CSSProperties, ElementType } from "react";
import { cn } from "@manikrana/ui/lib/utils";

type TextRevealProps<T extends ElementType = "div"> = {
  as?: T;
  index?: number;
  play?: boolean;
} & Omit<ComponentProps<T>, "as">;

// Plays once on mount, so remount it (a new key) to play it again.
function TextReveal<T extends ElementType = "div">({
  as,
  index = 0,
  play = true,
  className,
  style,
  ...props
}: TextRevealProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      data-slot="text-reveal"
      className={cn(play && "motion-safe:animate-text-reveal", className)}
      style={{ "--reveal-index": index, ...style } as CSSProperties}
      {...props}
    />
  );
}

export { TextReveal, type TextRevealProps };
