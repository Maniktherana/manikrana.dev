import type { ComponentProps } from "react";
import { cn } from "@manikrana/ui/lib/utils";

// Independent of the content: a 2px lit ring and a 3px page-color gap.
// Set the outer dimensions with className and let the child fill its inset.
// Round by default; set --ring-radius for a rounded square, and give the child
// a radius of calc(var(--ring-radius) - 5px) so the three shapes stay concentric.
function AnimatedRing({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="animated-ring"
      className={cn(
        "relative isolate inline-flex shrink-0 rounded-[var(--ring-radius,9999px)] p-0.5",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 overflow-hidden rounded-[inherit] bg-white/10"
      >
        <span className="absolute -inset-1/2 animate-ring-spin bg-conic from-transparent to-white/90 to-10% mask-conic-from-25% mask-conic-to-35% motion-reduce:animate-none" />
      </span>
      <div className="flex size-full rounded-[calc(var(--ring-radius,9999px)_-_2px)] bg-background p-0.75">
        {children}
      </div>
    </div>
  );
}

export { AnimatedRing };
