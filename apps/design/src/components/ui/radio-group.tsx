"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex size-5 shrink-0 items-center justify-center rounded-full outline-none after:absolute after:-inset-x-2 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        "data-unchecked:hover:[&_[data-slot=radio-visual]]:bg-[var(--control-unchecked-hover-bg)] data-unchecked:hover:[&_[data-slot=radio-visual]]:shadow-[var(--shadow-control-unchecked-hover)] focus-visible:[&_[data-slot=radio-visual]]:shadow-[var(--shadow-control-focus)]",
        "aria-invalid:[&_[data-slot=radio-visual]]:shadow-[0_0_0_1px_color-mix(in_srgb,var(--destructive)_35%,transparent),var(--shadow-control-unchecked)]",
        "data-checked:[&_[data-slot=radio-visual]]:bg-[var(--interactive)] data-checked:[&_[data-slot=radio-visual]]:shadow-[var(--shadow-control-interactive)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="radio-visual"
        className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--control-unchecked-bg)] shadow-[var(--shadow-control-unchecked)] transition-colors"
      />
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative z-10 flex size-[15px] items-center justify-center"
      >
        <span className="size-1.5 rounded-full bg-[var(--interactive-foreground)] shadow-[0_1px_2px_0_rgba(30,58,138,0.6)]" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
