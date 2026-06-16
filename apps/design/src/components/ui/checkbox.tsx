"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { cn } from "@/lib/utils";
import { CheckIcon, MinusIcon } from "lucide-react";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox relative flex size-5 shrink-0 items-center justify-center outline-none after:absolute after:-inset-x-2 after:-inset-y-2 group-has-disabled/field:opacity-50 disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:text-[var(--interactive-foreground)] data-indeterminate:text-[var(--interactive-foreground)]",
        "hover:[&_[data-slot=checkbox-box]]:bg-muted focus-visible:[&_[data-slot=checkbox-box]]:shadow-[var(--shadow-button-primary-focus)]",
        "aria-invalid:[&_[data-slot=checkbox-box]]:shadow-[0_0_0_1px_color-mix(in_srgb,var(--destructive)_35%,transparent),var(--shadow-button-neutral)]",
        "data-checked:[&_[data-slot=checkbox-box]]:bg-[var(--interactive)] data-checked:[&_[data-slot=checkbox-box]]:shadow-[var(--shadow-control-interactive)]",
        "data-indeterminate:[&_[data-slot=checkbox-box]]:bg-[var(--interactive)] data-indeterminate:[&_[data-slot=checkbox-box]]:shadow-[var(--shadow-control-interactive)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="checkbox-box"
        className={cn(
          "absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-[var(--component)] transition-colors",
          "shadow-[var(--shadow-button-neutral)]",
        )}
      />
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="relative z-10 grid size-[15px] place-content-center text-current transition-none [&>svg]:size-[15px]"
      >
        <CheckIcon className="group-data-indeterminate/checkbox:hidden" />
        <MinusIcon className="hidden group-data-indeterminate/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
