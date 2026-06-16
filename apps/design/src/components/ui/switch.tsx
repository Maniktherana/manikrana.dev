"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex h-5 shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-[size=default]:w-8 data-[size=sm]:w-7 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "focus-visible:[&_[data-slot=switch-track]]:shadow-[var(--shadow-button-primary-focus)]",
        "aria-invalid:[&_[data-slot=switch-track]]:shadow-[0_0_0_1px_color-mix(in_srgb,var(--destructive)_35%,transparent),var(--shadow-switch-track)]",
        "data-checked:[&_[data-slot=switch-track]]:bg-[var(--interactive)] data-unchecked:[&_[data-slot=switch-track]]:bg-input",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="switch-track"
        className="pointer-events-none absolute top-1/2 left-0 h-[18px] w-full -translate-y-1/2 overflow-hidden rounded-full bg-input shadow-[var(--shadow-switch-track)] transition-colors"
      />
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none relative z-10 block rounded-full bg-[var(--interactive-foreground)] shadow-[var(--shadow-switch-thumb)] ring-0 transition-transform group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-3.5 group-data-[size=default]/switch:data-unchecked:translate-x-0.5 group-data-[size=sm]/switch:data-unchecked:translate-x-0.5 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
