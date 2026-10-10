import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

// Pills, sized like transitions.dev's controls (36px default): one filled
// primary, a flat neutral fill, a transparent ghost and one flat tint per hue.
// `bordered` adds the shared edge to any of them.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full text-sm font-medium whitespace-nowrap transition-[scale,background-color,color] duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-control text-foreground hover:bg-control-hover",
        ghost:
          "text-control-foreground hover:bg-control hover:text-foreground aria-expanded:bg-control aria-expanded:text-foreground",
        blue: "bg-blue-surface text-blue-foreground hover:bg-blue-surface-hover",
        cyan: "bg-cyan-surface text-cyan-foreground hover:bg-cyan-surface-hover",
        green: "bg-green-surface text-green-foreground hover:bg-green-surface-hover",
        amber: "bg-amber-surface text-amber-foreground hover:bg-amber-surface-hover",
        red: "bg-red-surface text-red-foreground hover:bg-red-surface-hover",
      },
      size: {
        sm: "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        default:
          "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        "icon-sm": "size-8",
        icon: "size-9",
        "icon-lg": "size-10",
      },
      // The shared edge (highlight, inner ring, soft drop) on any variant.
      bordered: {
        true: "shadow-control",
        false: "",
      },
      // Press feedback per better-ui: scale to 0.96; `static` turns it off.
      static: {
        true: "",
        false: "active:not-disabled:scale-[0.96]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      bordered: false,
      static: false,
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  bordered = false,
  static: isStatic = false,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, bordered, static: isStatic, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
