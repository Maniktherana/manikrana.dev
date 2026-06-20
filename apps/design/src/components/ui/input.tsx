import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  cn(
    "flex h-8 min-h-[var(--control-height)] w-full min-w-0 rounded-[6px] border border-transparent bg-clip-border px-2 py-0 font-sans text-[13px] leading-[1.1] font-normal outline-none transition-colors",
    // surface + elevation
    "bg-transparent shadow-[var(--shadow-card)]",
    // file input
    "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    // placeholder
    "placeholder:text-muted-foreground",
    // hover keeps the transparent border (elevation only)
    "hover:border-transparent",
    // focus ring (keyboard / text-entry focus only)
    "focus-visible:ring-1 focus-visible:ring-ring focus-visible:shadow-[var(--shadow-card)]",
    // disabled
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60",
    // invalid
    "aria-invalid:shadow-[0_0_0_1px_var(--destructive),var(--shadow-card)]",
    "aria-invalid:focus-visible:ring-destructive/40 aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--destructive),var(--shadow-card)]",
  ),
  {
    variants: {
      controlSize: {
        default: "",
        sm: "h-7! min-h-7!",
      },
      radius: {
        squared: "",
        rounded: "rounded-full!",
      },
      variant: {
        default: "",
        component: "bg-background!",
        muted: "bg-[var(--muted)]!",
      },
    },
    defaultVariants: {
      controlSize: "default",
      radius: "squared",
      variant: "default",
    },
  },
);

function Input({
  className,
  controlSize = "default",
  radius = "squared",
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={controlSize}
      data-radius={radius}
      data-variant={variant}
      className={cn(inputVariants({ controlSize, radius, variant }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
