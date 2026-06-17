import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex min-h-0 shrink-0 items-center justify-center rounded-[6px] border border-transparent bg-clip-padding font-sans text-[13px] leading-[1.1] font-medium tracking-normal whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:border-[var(--button-disabled-border)] disabled:bg-[var(--button-disabled)] disabled:text-[var(--button-disabled-foreground)] disabled:shadow-none disabled:opacity-100 aria-disabled:pointer-events-none aria-disabled:border-[var(--button-disabled-border)] aria-disabled:bg-[var(--button-disabled)] aria-disabled:text-[var(--button-disabled-foreground)] aria-disabled:shadow-none data-[disabled]:pointer-events-none data-[disabled]:border-[var(--button-disabled-border)] data-[disabled]:bg-[var(--button-disabled)] data-[disabled]:text-[var(--button-disabled-foreground)] data-[disabled]:shadow-none data-[active=true]:bg-[var(--button-transparent-hover)] data-[active=true]:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 in-data-[slot=input-group]:shadow-none [&>:not(svg)]:leading-[inherit] [&_svg]:pointer-events-none [&_svg]:size-[15px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--button-primary)] bg-clip-border text-[var(--button-primary-foreground)] shadow-[var(--shadow-button-primary)] hover:bg-[var(--button-primary-hover)] hover:text-[var(--button-primary-foreground)] active:bg-[var(--button-primary-pressed)] focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-[var(--shadow-button-primary-focus)]",
        outline:
          "bg-[var(--button-secondary)] bg-clip-border text-[var(--button-secondary-foreground)] shadow-[var(--shadow-button-secondary)] hover:bg-[var(--button-secondary-hover)] hover:text-[var(--button-secondary-foreground)] active:bg-[var(--button-secondary-pressed)] aria-expanded:bg-[var(--button-secondary-hover)] aria-expanded:text-[var(--button-secondary-foreground)] data-popup-open:bg-[var(--button-secondary-hover)] data-popup-open:text-[var(--button-secondary-foreground)]",
        secondary:
          "bg-[var(--button-secondary)] bg-clip-border text-[var(--button-secondary-foreground)] shadow-[var(--shadow-button-secondary)] hover:bg-[var(--button-secondary-hover)] hover:text-[var(--button-secondary-foreground)] active:bg-[var(--button-secondary-pressed)] aria-expanded:bg-[var(--button-secondary-hover)] aria-expanded:text-[var(--button-secondary-foreground)]",
        ghost:
          "text-foreground shadow-none hover:bg-[var(--button-transparent-hover)] hover:text-foreground aria-expanded:bg-[var(--button-transparent-hover)] aria-expanded:text-foreground data-popup-open:bg-[var(--button-transparent-hover)] data-popup-open:text-foreground",
        destructive:
          "bg-[var(--button-danger)] bg-clip-border text-[var(--button-danger-foreground)] shadow-[var(--shadow-button-danger)] hover:bg-[var(--button-danger-hover)] hover:text-[var(--button-danger-foreground)] active:bg-[var(--button-danger-pressed)] focus-visible:border-transparent focus-visible:ring-ring/50",
        link:
          "h-auto min-h-0 gap-0 self-center border-transparent bg-transparent p-0 leading-[1.6] text-foreground shadow-none no-underline hover:bg-transparent hover:text-foreground hover:underline",
      },
      size: {
        default:
          "h-[var(--control-height)] min-h-[var(--control-height)] gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg]:size-3",
        "icon-sm": "size-7",
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
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
