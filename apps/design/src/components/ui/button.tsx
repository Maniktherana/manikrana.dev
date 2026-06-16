import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-100 data-popup-open:bg-muted data-popup-open:text-foreground aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--button-primary)] bg-clip-border text-[var(--button-primary-foreground)] shadow-[var(--shadow-button-primary)] hover:bg-[var(--button-primary-hover)] active:bg-[var(--button-primary-pressed)]",
        outline:
          "bg-[var(--button-secondary)] bg-clip-border text-[var(--button-secondary-foreground)] shadow-[var(--shadow-button-secondary)] hover:bg-[var(--button-secondary-hover)] hover:text-[var(--button-secondary-foreground)] active:bg-[var(--button-secondary-pressed)] aria-expanded:bg-[var(--button-secondary-hover)] aria-expanded:text-[var(--button-secondary-foreground)] data-popup-open:bg-[var(--button-secondary-hover)] data-popup-open:text-[var(--button-secondary-foreground)]",
        secondary:
          "bg-[var(--button-secondary)] bg-clip-border text-[var(--button-secondary-foreground)] shadow-[var(--shadow-button-secondary)] hover:bg-[var(--button-secondary-hover)] hover:text-[var(--button-secondary-foreground)] active:bg-[var(--button-secondary-pressed)] aria-expanded:bg-[var(--button-secondary-hover)] aria-expanded:text-[var(--button-secondary-foreground)]",
        ghost:
          "text-foreground hover:bg-[var(--button-transparent-hover)] hover:text-foreground aria-expanded:bg-[var(--button-transparent-hover)] aria-expanded:text-foreground data-popup-open:bg-[var(--button-transparent-hover)] data-popup-open:text-foreground",
        destructive:
          "bg-[var(--button-danger)] bg-clip-border text-[var(--button-danger-foreground)] shadow-[var(--shadow-button-danger)] hover:bg-[var(--button-danger-hover)] active:bg-[var(--button-danger-pressed)] focus-visible:border-transparent focus-visible:ring-ring/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  nativeButton,
  render,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const resolvedNativeButton =
    render === undefined
      ? undefined
      : (nativeButton ?? (React.isValidElement(render) && render.type === "button"));

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      nativeButton={resolvedNativeButton}
      render={render}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
