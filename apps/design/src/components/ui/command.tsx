"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { SearchIcon, CheckIcon } from "lucide-react";

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-overlay-md)]",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  overlayClassName,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string;
  description?: string;
  className?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/2 w-[560px] -translate-y-1/2 overflow-hidden rounded-xl! p-0",
          className,
        )}
        overlayClassName={overlayClassName}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  variant?: "default" | "modal";
}) {
  if (variant === "modal") {
    return (
      <div
        data-slot="command-input-wrapper"
        data-variant="modal"
        className="border-b border-border bg-background"
      >
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "h-[52px] w-full px-4 text-sm leading-[1.1] outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1 text-[13px] outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandBar({
  className,
  selectedLabel = "1 selected",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  selectedLabel?: string;
}) {
  return (
    <div
      data-slot="commandbar"
      role="toolbar"
      className={cn(
        "inline-flex min-h-9 items-center overflow-hidden rounded-full bg-[#212124] text-[rgb(255_255_255_/_88%)] shadow-[var(--shadow-commandbar)]",
        className,
      )}
      {...props}
    >
      <span className="whitespace-nowrap px-2 py-2 pr-2 pl-3 text-[13px] leading-[1.1] font-medium text-[rgb(255_255_255_/_56%)]">
        {selectedLabel}
      </span>
      <span aria-hidden="true" className="h-3 w-px bg-[rgb(255_255_255_/_16%)]" />
      {children}
    </div>
  );
}

function CommandBarAction({
  className,
  children,
  shortcuts = ["⌘", "⌘"],
  edge = false,
  ...props
}: React.ComponentProps<"button"> & {
  shortcuts?: string[];
  edge?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="commandbar-action"
      data-edge={edge ? "true" : undefined}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 border-0 bg-[#212124] px-2 py-2.5 font-sans text-[13px] leading-[1.1] font-medium whitespace-nowrap text-[rgb(255_255_255_/_88%)] outline-none hover:bg-[#27272a] focus-visible:bg-[#27272a] data-[edge=true]:rounded-r-full data-[edge=true]:pr-3 [&_svg]:size-[15px] [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {shortcuts.length > 0 ? (
        <span className="inline-flex gap-[5px]">
          {shortcuts.map((shortcut, index) => (
            <Kbd key={`${shortcut}-${index}`} className="h-4 min-w-4 p-0">
              {shortcut}
            </Kbd>
          ))}
        </span>
      ) : null}
    </button>
  );
}

export {
  Command,
  CommandBar,
  CommandBarAction,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
