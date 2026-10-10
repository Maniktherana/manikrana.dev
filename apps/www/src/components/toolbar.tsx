import { useId, type ComponentProps } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

const glide = { type: "spring", duration: 0.3, bounce: 0 } as const;

export function Toolbar({ className, children, ...props }: ComponentProps<"div">) {
  const group = useId();
  return (
    <div
      role="toolbar"
      className={cn(
        "absolute bottom-4 left-1/2 z-10 flex h-10 -translate-x-1/2 items-center gap-1 rounded-2xl bg-popover p-1 shadow-raised",
        className,
      )}
      {...props}
    >
      <LayoutGroup id={group}>{children}</LayoutGroup>
    </div>
  );
}

export function ToolbarGroup({ className, children, ...props }: ComponentProps<"fieldset">) {
  const group = useId();
  return (
    <fieldset className={cn("flex min-w-0 items-center gap-1", className)} {...props}>
      <LayoutGroup id={group}>{children}</LayoutGroup>
    </fieldset>
  );
}

export function ToolbarSeparator({ className, ...props }: ComponentProps<"hr">) {
  return (
    <hr
      aria-orientation="vertical"
      className={cn("mx-1 h-4 w-px shrink-0 border-0 bg-border", className)}
      {...props}
    />
  );
}

export function ToolbarButton({
  className,
  iconOnly = false,
  children,
  ...props
}: ComponentProps<"button"> & { iconOnly?: boolean }) {
  const reducedMotion = useReducedMotion();
  const pressed = props["aria-pressed"] === true || props["aria-pressed"] === "true";
  return (
    <button
      type="button"
      className={cn(
        "relative isolate flex h-8 transform-gpu items-center gap-1.5 rounded-xl px-3 text-sm leading-none whitespace-nowrap text-control-foreground outline-none [backface-visibility:hidden] transition-[background-color,color,scale] duration-150 ease-out select-none hover:bg-control hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 aria-pressed:text-foreground [&_svg]:size-4",
        iconOnly && "w-8 justify-center px-0",
        className,
      )}
      {...props}
    >
      {pressed && (
        <motion.span
          layoutId="pressed"
          transition={reducedMotion ? { duration: 0 } : glide}
          className="absolute inset-0 -z-10 rounded-xl bg-control-selected"
        />
      )}
      {children}
    </button>
  );
}
