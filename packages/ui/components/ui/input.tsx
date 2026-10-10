import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

// Match the 20px control line box with balanced vertical padding.
// Keep text-base below md so focusing the input does not zoom on iOS.
const inputVariants = cva(
  "h-9 w-full min-w-0 rounded-full bg-control px-4 py-0 text-base leading-5 text-foreground transition-[background-color] duration-150 ease-out outline-none placeholder:text-muted-foreground hover:bg-control-hover focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40 md:text-sm",
  {
    variants: {
      // The shared edge. transitions.dev's search has none, so it is off by default.
      bordered: {
        true: "shadow-control",
        false: "",
      },
    },
    defaultVariants: {
      bordered: false,
    },
  },
);

function Input({
  className,
  type,
  bordered = false,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ bordered, className }))}
      {...props}
    />
  );
}

export { Input };
