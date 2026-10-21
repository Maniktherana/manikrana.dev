import type { ComponentProps } from "react";
import { cn } from "@manikrana/ui/lib/utils";

// For a rounded square, set --ring-radius and give the child calc(var(--ring-radius) - 5px).
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
