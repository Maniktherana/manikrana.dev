"use client";

import type { ComponentProps } from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@manikrana/ui/lib/utils";
import { buttonVariants } from "@manikrana/ui/components/ui/button";

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group data-slot="select-group" className={cn("py-1", className)} {...props} />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn(
        "min-w-0 flex-1 truncate text-start data-placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  size = "default",
  bordered = false,
  ...props
}: SelectPrimitive.Trigger.Props & { size?: "sm" | "default"; bordered?: boolean }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        buttonVariants({ variant: "secondary", size, bordered, static: true }),
        "w-fit min-w-0 justify-between text-sm leading-5 font-normal data-placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "end",
  alignOffset = 0,
  alignItemWithTrigger = true,
  matchTriggerWidth = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset" | "alignItemWithTrigger"
  > & { matchTriggerWidth?: boolean }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative max-h-[min(22.5rem,var(--available-height))] min-w-(--anchor-width) origin-(--transform-origin) overflow-hidden rounded-card bg-popover p-1.5 text-sm leading-5 font-normal text-foreground shadow-raised outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-97 data-open:duration-250 data-open:ease-[cubic-bezier(0.16,1,0.3,1)] data-open:data-[side=bottom]:slide-in-from-top-2 data-open:data-[side=top]:slide-in-from-bottom-2 data-open:data-[side=left]:slide-in-from-right-2 data-open:data-[side=right]:slide-in-from-left-2 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-99 data-closed:duration-150 data-closed:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none",
            matchTriggerWidth ? "w-(--anchor-width)" : "w-max",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="scroll-fade-y scroll-fade-6 max-h-[calc(min(22.5rem,var(--available-height))-3rem)] overflow-y-auto">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-3 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex h-(--anchor-height) w-full cursor-default items-center gap-2 rounded-full py-0 ps-3 pe-8 text-start text-sm leading-5 font-normal text-control-foreground outline-none select-none data-highlighted:bg-control-hover data-highlighted:text-foreground data-selected:bg-control-selected data-selected:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        className="pointer-events-none absolute end-2 grid size-4 place-items-center"
        aria-hidden="true"
      >
        <span className="size-1.5 rounded-full bg-foreground" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none mx-1 my-1 h-px bg-control-hover", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "absolute inset-x-0 top-0 z-10 flex h-6 w-full shrink-0 items-center justify-center bg-linear-to-b from-popover to-transparent text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "absolute inset-x-0 bottom-0 z-10 flex h-6 w-full shrink-0 items-center justify-center bg-linear-to-t from-popover to-transparent text-muted-foreground",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
