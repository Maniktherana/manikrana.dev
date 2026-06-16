import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-0 text-sm leading-[1.1] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-0",
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
        muted: "",
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
