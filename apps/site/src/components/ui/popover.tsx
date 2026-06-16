"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

type AsChildProps = {
  asChild?: boolean;
  children?: React.ReactNode;
};

function getRenderProps({ asChild, children }: AsChildProps) {
  if (!asChild) {
    return { children };
  }

  const child = React.Children.only(children) as React.ReactElement;

  return {
    render: child,
  };
}

const Popover = BasePopover.Root;

const PopoverTrigger = ({
  asChild,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof BasePopover.Trigger> & AsChildProps) => {
  const renderProps = getRenderProps({ asChild, children });

  return <BasePopover.Trigger {...props} {...renderProps} />;
};

type PopoverContentProps = React.ComponentPropsWithoutRef<typeof BasePopover.Popup> & {
  align?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["align"];
  side?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["side"];
  sideOffset?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["sideOffset"];
};

const PopoverContent = ({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverContentProps) => (
  <BasePopover.Portal>
    <BasePopover.Positioner align={align} side={side} sideOffset={sideOffset}>
      <BasePopover.Popup
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[ending-style]:animate-out data-[starting-style]:animate-in data-[ending-style]:fade-out-0 data-[starting-style]:fade-in-0 data-[ending-style]:zoom-out-95 data-[starting-style]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
);

export { Popover, PopoverTrigger, PopoverContent };
