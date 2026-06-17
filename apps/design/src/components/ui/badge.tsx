import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-[18px] w-fit shrink-0 items-center justify-center gap-px overflow-hidden rounded border-[0.5px] px-[4.5px] py-[2.5px] text-center text-xs leading-[1.1] font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-0.5 [&>svg]:pointer-events-none [&>svg]:size-[15px]!",
  {
    variants: {
      variant: {
        default:
          "border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b] dark:border-[#3f3f46] dark:bg-[#27272a] dark:text-[#d4d4d8]",
        neutral:
          "border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b] dark:border-[#3f3f46] dark:bg-[#27272a] dark:text-[#d4d4d8]",
        secondary:
          "border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b] dark:border-[#3f3f46] dark:bg-[#27272a] dark:text-[#d4d4d8]",
        information:
          "border-[#93c5fd] bg-[#dbeafe] text-[#1e40af] dark:border-[#2563eb99] dark:bg-[#1d4ed833] dark:text-[#93c5fd]",
        success:
          "border-[#6ee7b7] bg-[#d1fae5] text-[#047857] dark:border-[#10b98199] dark:bg-[#064e3b66] dark:text-[#6ee7b7]",
        warning:
          "border-[#fdba74] bg-[#ffedd5] text-[#9a3412] dark:border-[#f9731699] dark:bg-[#7c2d1266] dark:text-[#fdba74]",
        destructive:
          "border-[#fda4af] bg-[#ffe4e6] text-[#9f1239] dark:border-[#f43f5e99] dark:bg-[#88133766] dark:text-[#fda4af]",
        error:
          "border-[#fda4af] bg-[#ffe4e6] text-[#9f1239] dark:border-[#f43f5e99] dark:bg-[#88133766] dark:text-[#fda4af]",
        feature:
          "border-[#c4b5fd] bg-[#ede9fe] text-[#5b21b6] dark:border-[#8b5cf699] dark:bg-[#4c1d9566] dark:text-[#c4b5fd]",
        alpha:
          "border-[rgb(24_24_27_/_10%)] bg-[rgb(24_24_27_/_40%)] text-white backdrop-blur-[5px]",
        beta: "relative h-[17px] overflow-hidden border-transparent bg-transparent px-1 py-0 text-[#1e40af]",
        outline: "border-border bg-background text-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-muted",
        link: "h-auto border-transparent bg-transparent px-0 py-0 text-foreground hover:underline",
      },
      radius: {
        rounded: "rounded",
        full: "rounded-full px-[6px]",
      },
    },
    defaultVariants: {
      radius: "rounded",
      variant: "default",
    },
  },
);

function Badge({
  className,
  radius = "rounded",
  render,
  variant = "default",
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ radius, variant }), className),
      },
      props,
    ),
    render,
    state: {
      radius,
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
