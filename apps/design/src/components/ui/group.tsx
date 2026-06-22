import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const groupVariants = cva(
  "relative flex w-fit items-stretch overflow-visible rounded-lg shadow-[var(--shadow-card)] [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:active:scale-100! *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=group]]:items-center has-[>[data-slot=group]]:gap-2 has-[>[data-slot=group]]:overflow-visible has-[>[data-slot=group]]:rounded-none has-[>[data-slot=group]]:bg-transparent has-[>[data-slot=group]]:shadow-none has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:border-0 [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:text-foreground [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:shadow-none [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:bg-clip-border [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:before:hidden [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):not([data-slot=input]):not([data-slot=input-group]):hover]:bg-accent [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])[aria-expanded=true]]:bg-accent [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])[data-popup-open]]:bg-accent [&>[data-slot=input]]:flex-1 [&>[data-slot=input]]:py-0 [&>[data-slot=input-group]]:flex-1 [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--component)] [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:bg-[var(--component)]",
        base: "bg-background [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:bg-background",
        toolbar:
          "items-center gap-2 overflow-visible rounded-none border-0 bg-transparent shadow-none",
      },
      size: {
        default:
          "[&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:h-7! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:min-h-7! [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=group]):not([data-slot=group-separator])]:gap-2 [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=group]):not([data-slot=group-separator])]:px-2 [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=group]):not([data-slot=group-separator])]:py-0! [&>[data-size^=icon]]:size-7! [&>[data-size^=icon]]:p-0!",
        compact:
          "[&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:h-5! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:min-h-5! [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=group]):not([data-slot=group-separator])]:px-1.5 [&>[data-slot]:not([data-slot=input]):not([data-slot=input-group]):not([data-slot=select-trigger]):not([data-slot=group]):not([data-slot=group-separator])]:py-0! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:text-xs [&>[data-size^=icon]]:size-5! [&>[data-size^=icon]]:p-0!",
      },
      orientation: {
        horizontal:
          "[&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:rounded-none! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):first-child]:rounded-s-lg! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):not(:has(~[data-slot]:not([data-slot=group]):not([data-slot=group-separator])))]:rounded-e-lg! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):not(:first-child)]:border-s! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):not(:first-child)]:border-border [&>[data-slot=group-separator]+[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:border-s-0!",
        vertical:
          "flex-col [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:rounded-none! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):first-child]:rounded-t-lg! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):not(:has(~[data-slot]:not([data-slot=group]):not([data-slot=group-separator])))]:rounded-b-lg! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):not(:first-child)]:border-t! [&>[data-slot]:not([data-slot=group]):not([data-slot=group-separator]):not(:first-child)]:border-border [&>[data-slot=group-separator]+[data-slot]:not([data-slot=group]):not([data-slot=group-separator])]:border-t-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      orientation: "horizontal",
    },
  },
);

function Group({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof groupVariants>) {
  return (
    <div
      role="group"
      data-slot="group"
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      className={cn(groupVariants({ variant, size, orientation }), className)}
      {...props}
    />
  );
}

function GroupText({ className, render, ...props }: useRender.ComponentProps<"div">) {
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
      slot: "group-text",
    },
  });
}

function GroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="group-separator"
      orientation={orientation}
      className={cn(
        "relative z-10 shrink-0 self-stretch rounded-none! bg-border data-horizontal:-mx-px data-horizontal:h-px data-horizontal:w-auto data-vertical:-my-px data-vertical:h-auto data-vertical:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Group, GroupSeparator, GroupText, groupVariants };
