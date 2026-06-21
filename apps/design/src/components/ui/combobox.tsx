import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react";

const ComboboxAnchorContext = React.createContext<React.RefObject<HTMLDivElement | null> | null>(
  null,
);

function Combobox<Value, Multiple extends boolean | undefined = false>({
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple>) {
  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <ComboboxAnchorContext.Provider value={anchorRef}>
      <ComboboxPrimitive.Root data-slot="combobox" {...props} />
    </ComboboxAnchorContext.Provider>
  );
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "relative z-10 flex size-6 shrink-0 cursor-default items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground shadow-none transition-none outline-none select-none hover:bg-transparent hover:text-muted-foreground focus-visible:bg-transparent focus-visible:text-muted-foreground focus-visible:ring-0 active:bg-transparent data-popup-open:bg-transparent data-popup-open:text-muted-foreground data-pressed:bg-transparent [&_svg:not([class*='size-'])]:size-[15px]",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-[15px] text-muted-foreground" />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  const anchorRef = React.useContext(ComboboxAnchorContext);

  return (
    <InputGroup ref={anchorRef} className={cn("w-[280px]", className)}>
      <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
      <InputGroupAddon align="inline-end" className="cursor-default pr-0">
        {showTrigger && (
          <ComboboxTrigger
            className="mr-1 group-has-data-[slot=combobox-clear]/input-group:hidden"
            disabled={disabled}
            type="button"
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  const contextAnchor = React.useContext(ComboboxAnchorContext);
  const resolvedAnchor = anchor ?? contextAnchor ?? undefined;

  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={resolvedAnchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "group/combobox-content relative isolate z-50 max-h-(--available-height) min-w-(--anchor-width) w-max max-w-[min(var(--available-width),28rem)] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-card p-1 text-card-foreground shadow-[var(--shadow-popover)] duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:mb-1 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-transparent *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(18rem,calc(var(--available-height)-2.25rem))] scroll-py-1 overflow-y-auto overscroll-contain data-empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex min-h-[26px] w-full cursor-default items-start gap-2 rounded-sm py-1 pr-8 pl-[30px] text-[13px] leading-[1.3] font-normal whitespace-normal outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-foreground not-data-[variant=destructive]:data-highlighted:**:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:font-medium [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[15px]",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 break-words">{children}</span>
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute top-1 left-2 flex size-[15px] items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group data-slot="combobox-group" className={cn(className)} {...props} />
  );
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn(
        "flex h-6 items-center px-2 text-xs leading-[1.1] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden min-h-16 w-full items-center justify-center px-2 py-2 text-center text-[13px] leading-[1.4] text-muted-foreground group-data-empty/combobox-content:flex",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn(
        "pointer-events-none relative -mx-1 my-0 h-2 bg-transparent before:absolute before:inset-x-0 before:top-[3px] before:h-px before:bg-border after:absolute after:inset-x-0 after:top-1 after:h-px after:bg-card",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-8 w-[280px] flex-wrap items-center gap-0.5 rounded-lg border border-input bg-[var(--field)] bg-clip-padding p-0.5 font-sans text-[13px] leading-[1.1] font-normal tracking-normal shadow-[var(--shadow-control)] transition-colors outline-none hover:bg-[var(--field-hover)] focus-within:border-ring focus-within:shadow-[var(--shadow-control-focus)] has-disabled:opacity-60 has-aria-invalid:border-destructive has-aria-invalid:shadow-[var(--shadow-control)]",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-[26px] w-fit shrink-0 items-center justify-center gap-1 rounded-sm border border-transparent bg-muted px-2 text-xs leading-[1.1] font-normal whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-1.5",
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-mr-1 size-[15px] rounded-sm text-muted-foreground opacity-70 shadow-none hover:bg-transparent hover:text-foreground hover:opacity-100 [&_svg]:size-[15px]"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn(
        "min-h-[26px] min-w-16 flex-1 bg-transparent px-1 text-[13px] leading-[1.1] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
