import type { ComponentProps } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";
import { Separator } from "@manikrana/ui/components/ui/separator";

const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>[data-slot]]:focus-visible:relative [&>[data-slot]]:focus-visible:z-10 [&>input]:flex-1 [&>[data-slot=button]]:active:scale-100",
  {
    variants: {
      orientation: {
        horizontal:
          "rounded-full [&>[data-slot]]:rounded-none [&>[data-slot]:first-child]:rounded-s-full [&>[data-slot]:last-child]:rounded-e-full",
        vertical:
          "flex-col rounded-2xl [&>[data-slot]]:rounded-none [&>[data-slot]:first-child]:rounded-t-2xl [&>[data-slot]:last-child]:rounded-b-2xl",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    // A fieldset would add form semantics to a general action group.
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation, className }))}
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
          "flex items-center gap-2 bg-control px-4 text-sm font-medium text-control-foreground [&_svg]:pointer-events-none [&_svg]:size-4",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "button-group-text" },
  });
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn("relative self-stretch data-horizontal:w-auto data-vertical:h-auto", className)}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };
