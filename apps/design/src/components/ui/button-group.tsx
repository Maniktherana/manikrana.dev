import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const buttonGroupVariants = cva(
  "relative flex w-fit items-stretch overflow-visible rounded-[6px] shadow-[var(--shadow-card)] *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:items-center has-[>[data-slot=button-group]]:gap-2 has-[>[data-slot=button-group]]:overflow-visible has-[>[data-slot=button-group]]:rounded-none has-[>[data-slot=button-group]]:bg-transparent has-[>[data-slot=button-group]]:shadow-none has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-[6px] [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:border-0 [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:text-foreground [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:shadow-none [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:bg-clip-border [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator]):hover]:bg-accent [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])[aria-expanded=true]]:bg-accent [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])[data-popup-open]]:bg-accent [&>[data-slot=input]]:flex-1 [&>[data-slot=input]]:py-0 [&>[data-slot=input-group]]:flex-1 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--component)] [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:bg-[var(--component)]",
        base: "bg-background [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:bg-background",
        toolbar:
          "items-center gap-2 overflow-visible rounded-none border-0 bg-transparent shadow-none",
      },
      size: {
        default:
          "[&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:h-7! [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:min-h-7! [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=button-group]):not([data-slot=button-group-separator])]:gap-2 [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=button-group]):not([data-slot=button-group-separator])]:px-2 [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=button-group]):not([data-slot=button-group-separator])]:py-0! [&>[data-size^=icon]]:size-7! [&>[data-size^=icon]]:p-0!",
        compact:
          "[&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:h-5! [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:min-h-5! [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=button-group]):not([data-slot=button-group-separator])]:px-1.5 [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=button-group]):not([data-slot=button-group-separator])]:py-0! [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:text-xs [&>[data-size^=icon]]:size-5! [&>[data-size^=icon]]:p-0!",
      },
      orientation: {
        horizontal:
          "[&>[data-slot]:not([data-slot=button-group])]:rounded-none! [&>[data-slot]:not([data-slot=button-group]):first-child]:rounded-l-[6px]! [&>[data-slot]:not([data-slot=button-group]):last-child]:rounded-r-[6px]! [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])+[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:border-l! [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])+[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:border-border",
        vertical:
          "flex-col [&>[data-slot]:not([data-slot=button-group])]:rounded-none! [&>[data-slot]:not([data-slot=button-group]):first-child]:rounded-t-[6px]! [&>[data-slot]:not([data-slot=button-group]):last-child]:rounded-b-[6px]! [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])+[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:border-t! [&>[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])+[data-slot]:not([data-slot=button-group]):not([data-slot=button-group-separator])]:border-border",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      orientation: "horizontal",
    },
  },
);

function ButtonGroup({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ variant, size, orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({ className, render, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-7 min-h-7 items-center gap-2 rounded-none border-0 bg-[var(--component)] px-2 text-[13px] leading-[1.1] font-medium text-secondary-foreground [&_svg]:pointer-events-none [&_svg]:size-[15px]",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "button-group-text",
    },
  });
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative z-10 shrink-0 self-stretch bg-border data-horizontal:-mx-px data-horizontal:h-px data-horizontal:w-auto data-vertical:-my-px data-vertical:h-auto data-vertical:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };
