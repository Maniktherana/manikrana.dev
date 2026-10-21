"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

import { Button } from "@manikrana/ui/components/ui/button";
import { Input } from "@manikrana/ui/components/ui/input";
import { Textarea } from "@manikrana/ui/components/ui/textarea";

// Disabled dims the whole group once, so the control inside resets its own opacity.
const inputGroupVariants = cva(
  "flex h-9 w-full min-w-0 items-center rounded-full bg-control transition-[background-color] duration-150 ease-out hover:bg-control-hover has-[[data-slot=input-group-control]:disabled]:pointer-events-none has-[[data-slot=input-group-control]:disabled]:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:rounded-stage has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:rounded-stage has-[>textarea]:h-auto has-[>textarea]:rounded-stage has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=inline-start]]:[&>input]:pl-2",
  {
    variants: {
      bordered: {
        true: "shadow-control",
        false: "",
      },
    },
    defaultVariants: {
      bordered: false,
    },
  },
);

function InputGroup({
  className,
  bordered = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot="input-group"
      // A <fieldset> brings form semantics and layout quirks a wrapper does not need.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      className={cn(inputGroupVariants({ bordered, className }))}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex cursor-text items-center justify-center gap-2 text-sm font-medium text-muted-foreground select-none [&>kbd]:rounded-full [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:pl-1.5 has-[>kbd]:pl-2",
        "inline-end": "order-last pr-3 has-[>button]:pr-1.5 has-[>kbd]:pr-2",
        "block-start": "order-first w-full justify-start px-4 pt-3",
        "block-end": "order-last w-full justify-start px-4 pb-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    // The click only forwards pointer focus to the control; keyboard users tab to it directly.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement
          ?.querySelector<HTMLElement>("[data-slot=input-group-control]")
          ?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonSizes = {
  xs: {
    size: "sm",
    className:
      "h-6 gap-1 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
  },
  "icon-xs": { size: "icon-sm", className: "size-6" },
  sm: { size: "sm", className: undefined },
  "icon-sm": { size: "icon-sm", className: undefined },
} as const;

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> & {
  size?: keyof typeof inputGroupButtonSizes;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      size={inputGroupButtonSizes[size].size}
      className={cn(inputGroupButtonSizes[size].className, className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 bg-transparent hover:bg-transparent focus-visible:ring-0 disabled:opacity-100 aria-invalid:ring-0",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none bg-transparent hover:bg-transparent focus-visible:ring-0 disabled:opacity-100 aria-invalid:ring-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
