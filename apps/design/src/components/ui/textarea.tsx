import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full resize-y rounded-md border border-transparent bg-transparent px-2 py-2 text-sm leading-[1.6] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-0 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-0",
  {
    variants: {
      variant: {
        default: "",
        muted: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
