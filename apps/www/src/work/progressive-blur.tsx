import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";

export type ProgressiveBlurProps = Omit<ComponentProps<"div">, "children"> & {
  side?: "top" | "bottom" | "left" | "right";
  size?: number;
  max?: number;
  layers?: number;
};

// A clip-path on this or its frame makes Chrome ignore the layer masks and blur the whole box.
export function ProgressiveBlur({
  side = "bottom",
  size,
  max = 64,
  layers = 8,
  className,
  style,
  ...props
}: ProgressiveBlurProps) {
  const at = (step: number) => `calc(100% - var(--size) * ${1 - step / (layers + 1)})`;

  return (
    <div
      aria-hidden="true"
      data-slot="progressive-blur"
      style={{ "--size": size === undefined ? "100%" : `${size}px`, ...style } as CSSProperties}
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      {...props}
    >
      {Array.from({ length: layers }, (_, index) => (
        <div
          key={index}
          style={
            {
              "--blur": `${max / 2 ** (layers - 1 - index)}px`,
              "--mask": `linear-gradient(to ${side}, transparent ${at(index)}, #000 ${at(index + 1)}, #000 ${at(index + 2)}, transparent ${at(index + 3)})`,
            } as CSSProperties
          }
          className="absolute inset-0 rounded-[inherit] mask-(--mask) backdrop-blur-(--blur)"
        />
      ))}
    </div>
  );
}
