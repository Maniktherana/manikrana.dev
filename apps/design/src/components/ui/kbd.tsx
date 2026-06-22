import { cn } from "@/lib/utils";

type KbdProps = React.ComponentProps<"kbd">;

function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-[18px] w-fit min-w-[18px] translate-y-[-0.04em] items-center justify-center gap-1 rounded-[4px] border border-transparent bg-card bg-clip-border px-[5px] align-middle font-sans text-[11px] leading-none font-medium tabular-nums text-secondary-foreground shadow-[var(--shadow-card)] select-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
