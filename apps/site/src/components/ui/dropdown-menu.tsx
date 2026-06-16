"use client";

import * as React from "react";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronRight, Circle } from "lucide-react";

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

const DropdownMenu = Menu.Root;

const DropdownMenuTrigger = ({
  asChild,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.Trigger> & AsChildProps) => {
  const renderProps = getRenderProps({ asChild, children });

  return <Menu.Trigger {...props} {...renderProps} />;
};

const DropdownMenuGroup = Menu.Group;
const DropdownMenuPortal = Menu.Portal;
const DropdownMenuSub = Menu.SubmenuRoot;
const DropdownMenuRadioGroup = Menu.RadioGroup;

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<typeof Menu.Popup> & {
  align?: React.ComponentPropsWithoutRef<typeof Menu.Positioner>["align"];
  side?: React.ComponentPropsWithoutRef<typeof Menu.Positioner>["side"];
  sideOffset?: React.ComponentPropsWithoutRef<typeof Menu.Positioner>["sideOffset"];
};

const contentClassName =
  "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[ending-style]:animate-out data-[starting-style]:animate-in data-[ending-style]:fade-out-0 data-[starting-style]:fade-in-0 data-[ending-style]:zoom-out-95 data-[starting-style]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

const DropdownMenuContent = ({
  className,
  align = "end",
  side = "bottom",
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) => (
  <Menu.Portal>
    <Menu.Positioner align={align} side={side} sideOffset={sideOffset}>
      <Menu.Popup className={cn(contentClassName, className)} {...props} />
    </Menu.Positioner>
  </Menu.Portal>
);

const DropdownMenuSubContent = ({
  className,
  align = "start",
  side = "right",
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) => (
  <Menu.Portal>
    <Menu.Positioner align={align} side={side} sideOffset={sideOffset}>
      <Menu.Popup className={cn(contentClassName, className)} {...props} />
    </Menu.Positioner>
  </Menu.Portal>
);

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.SubmenuTrigger> & {
  inset?: boolean;
}) => (
  <Menu.SubmenuTrigger
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent data-[popup-open]:bg-accent",
      inset && "pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </Menu.SubmenuTrigger>
);

const DropdownMenuItem = ({
  className,
  inset,
  asChild,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.Item> &
  AsChildProps & {
    inset?: boolean;
  }) => {
  const renderProps = getRenderProps({ asChild, children });

  return (
    <Menu.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
      {...renderProps}
    />
  );
};

const DropdownMenuCheckboxItem = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.CheckboxItem>) => (
  <Menu.CheckboxItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Menu.CheckboxItemIndicator>
        <Check className="h-4 w-4" />
      </Menu.CheckboxItemIndicator>
    </span>
    {children}
  </Menu.CheckboxItem>
);

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.RadioItem>) => (
  <Menu.RadioItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Menu.RadioItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </Menu.RadioItemIndicator>
    </span>
    {children}
  </Menu.RadioItem>
);

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.GroupLabel> & {
  inset?: boolean;
}) => (
  <Menu.GroupLabel
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
);

const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.Separator>) => (
  <Menu.Separator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
);

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
