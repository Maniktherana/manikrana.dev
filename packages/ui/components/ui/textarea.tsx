import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

// `text-base` below md stops iOS zooming on focus.
const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full rounded-stage bg-control px-4 py-3 text-base text-foreground transition-[background-color] duration-150 ease-out outline-none placeholder:text-muted-foreground hover:bg-control-hover focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40 md:text-sm",
  {
    variants: {
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

function Textarea({
  className,
  bordered = false,
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ bordered, className }))}
      {...props}
    />
  );
}

export { Textarea };
