"use client";

import * as React from "react";
import { PreviewCard } from "@base-ui/react/preview-card";

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

const HoverCard = PreviewCard.Root;

const HoverCardTrigger = ({
  asChild,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof PreviewCard.Trigger> & AsChildProps) => {
  const renderProps = getRenderProps({ asChild, children });

  return <PreviewCard.Trigger {...props} {...renderProps} />;
};

type HoverCardContentProps = React.ComponentPropsWithoutRef<typeof PreviewCard.Popup> & {
  align?: React.ComponentPropsWithoutRef<typeof PreviewCard.Positioner>["align"];
  side?: React.ComponentPropsWithoutRef<typeof PreviewCard.Positioner>["side"];
  sideOffset?: React.ComponentPropsWithoutRef<typeof PreviewCard.Positioner>["sideOffset"];
};

const HoverCardContent = ({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  ...props
}: HoverCardContentProps) => (
  <PreviewCard.Portal>
    <PreviewCard.Positioner align={align} side={side} sideOffset={sideOffset}>
      <PreviewCard.Popup
        className={cn(
          "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[ending-style]:animate-out data-[starting-style]:animate-in data-[ending-style]:fade-out-0 data-[starting-style]:fade-in-0 data-[ending-style]:zoom-out-95 data-[starting-style]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
);

export { HoverCard, HoverCardTrigger, HoverCardContent };
