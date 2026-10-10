import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";

export type ProgressiveBlurProps = Omit<ComponentProps<"div">, "children"> & {
  // The edge where the blur is strongest.
  side?: "top" | "bottom" | "left" | "right";
  // How far in from that edge the blur reaches, in px. Leave it out to ramp across the whole box.
  size?: number;
  // The strongest layer's blur in px. Each layer before it blurs half as hard.
  max?: number;
  layers?: number;
};

// Apple's progressive blur: backdrop blurs stacked toward `side`, each twice as strong as the
// one before and masked to its own band. The bands overlap, so the blur ramps without seams.
// A backdrop filter only sees what lies behind its own box, so this fills its parent: put it in
// the frame that clips the content it blurs, never in a box that reaches past that content.
// Never put a clip-path on this or on that frame: in Chrome it makes the layers ignore their
// masks, so the whole box blurs.
export function ProgressiveBlur({
  side = "bottom",
  size,
  max = 64,
  layers = 8,
  className,
  style,
  ...props
}: ProgressiveBlurProps) {
  // Where step k of the bands falls along the ramp, which ends at the strong edge. The last
  // band's fade-out lands past the end, so the strongest layer holds right up to the edge.
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
