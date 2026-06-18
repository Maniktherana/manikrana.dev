import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full resize-y rounded-md border border-transparent bg-[color-mix(in_srgb,var(--background)_70%,var(--muted))] px-2 py-2 font-sans text-[13px] leading-[1.6] font-normal shadow-[var(--shadow-control)] transition-colors outline-none placeholder:text-muted-foreground hover:border-transparent focus-visible:border-ring focus-visible:shadow-[var(--shadow-control-focus)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60 aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_1px_var(--destructive),var(--shadow-control)] aria-invalid:ring-0 aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--destructive),0_0_0_2px_color-mix(in_srgb,var(--destructive)_36%,transparent),var(--shadow-control)]",
  {
    variants: {
      variant: {
        default: "",
        muted: "bg-muted!",
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
