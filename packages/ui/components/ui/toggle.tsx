import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

const toggleVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full bg-control text-sm font-medium whitespace-nowrap text-control-foreground transition-[scale,background-color,color] duration-150 ease-out outline-none select-none hover:bg-control-hover hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50 data-pressed:bg-control-selected data-pressed:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      size: {
        sm: "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        default:
          "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
      },
      bordered: {
        true: "shadow-control",
        false: "",
      },
      static: {
        true: "",
        false: "active:not-disabled:scale-[0.96]",
      },
    },
    defaultVariants: {
      size: "default",
      bordered: true,
      static: false,
    },
  },
);

function Toggle({
  className,
  size = "default",
  bordered = true,
  static: isStatic = false,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ size, bordered, static: isStatic, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
