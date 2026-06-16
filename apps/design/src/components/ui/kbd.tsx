import { cn } from "@/lib/utils";

type KbdProps = React.ComponentProps<"kbd"> & {
  background?: "field" | "component" | "contrast";
};

function Kbd({ background = "field", className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      data-background={background}
      className={cn(
        "pointer-events-none inline-flex h-4 w-fit min-w-4 items-center justify-center gap-1 rounded-[4px] border-[0.5px] border-[var(--kbd-field-border)] bg-[var(--kbd-field-bg)] px-1 font-sans text-[11px] leading-[1.1] font-medium text-[var(--kbd-field-text)] shadow-none select-none data-[background=component]:border-[var(--kbd-component-border)] data-[background=component]:bg-[var(--kbd-component-bg)] data-[background=component]:text-[var(--kbd-component-text)] data-[background=contrast]:border-[var(--kbd-contrast-border)] data-[background=contrast]:bg-[var(--kbd-contrast-bg)] data-[background=contrast]:text-[var(--kbd-contrast-text)] in-data-[slot=tooltip-content]:border-[var(--kbd-contrast-border)] in-data-[slot=tooltip-content]:bg-[var(--kbd-contrast-bg)] in-data-[slot=tooltip-content]:text-[var(--kbd-contrast-text)] [&_svg:not([class*='size-'])]:size-3",
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
