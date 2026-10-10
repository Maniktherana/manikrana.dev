import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

// Small static pills: a selected-strength neutral, the resting control fill and
// one flat tint per hue. `bordered` adds the shared edge to any of them.
const badgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2 text-xs font-medium whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-control-selected text-foreground",
        secondary: "bg-control text-control-foreground",
        blue: "bg-blue-surface text-blue-foreground",
        cyan: "bg-cyan-surface text-cyan-foreground",
        green: "bg-green-surface text-green-foreground",
        amber: "bg-amber-surface text-amber-foreground",
        red: "bg-red-surface text-red-foreground",
      },
      bordered: {
        true: "shadow-control",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      bordered: false,
    },
  },
);

function Badge({
  className,
  variant = "default",
  bordered = false,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, bordered }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
