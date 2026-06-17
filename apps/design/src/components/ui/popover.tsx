import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { XIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  children,
  showArrow = false,
  showCloseButton = false,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
    showArrow?: boolean;
    showCloseButton?: boolean;
  }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "group/popover-content relative isolate z-50 flex w-[320px] origin-(--transform-origin) flex-col items-start overflow-visible rounded-lg bg-[#27272a] p-0 text-[13px] leading-[1.6] font-medium text-white shadow-[var(--shadow-popover)] outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {showArrow ? (
            <PopoverPrimitive.Arrow
              data-slot="popover-arrow"
              className="absolute z-[-1] h-2 w-4 bg-[#27272a] [clip-path:polygon(50%_0,100%_100%,0_100%)] group-data-[side=bottom]/popover-content:-top-[7px] group-data-[side=inline-end]/popover-content:-left-[11px] group-data-[side=inline-end]/popover-content:-rotate-90 group-data-[side=inline-start]/popover-content:-right-[11px] group-data-[side=inline-start]/popover-content:rotate-90 group-data-[side=left]/popover-content:-right-[11px] group-data-[side=left]/popover-content:rotate-90 group-data-[side=right]/popover-content:-left-[11px] group-data-[side=right]/popover-content:-rotate-90 group-data-[side=top]/popover-content:-bottom-[7px] group-data-[side=top]/popover-content:rotate-180"
            />
          ) : null}
          {children}
          {showCloseButton ? (
            <PopoverPrimitive.Close
              data-slot="popover-close"
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-2 right-2 z-10 size-6 rounded-md p-[4.5px] text-white shadow-none hover:bg-white/10 hover:text-white focus-visible:ring-0 focus-visible:shadow-[var(--shadow-control-focus)] [&_svg]:size-[15px]"
                  aria-label="Close popover"
                />
              }
            >
              <XIcon aria-hidden="true" />
            </PopoverPrimitive.Close>
          ) : null}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn(
        "relative flex w-full flex-col items-start gap-0 overflow-hidden px-4 py-3 pr-11 text-[13px] leading-[1.6]",
        className,
      )}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("w-full text-base leading-[1.6] font-medium text-white", className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("w-full text-[13px] leading-[1.6] font-medium text-white/56", className)}
      {...props}
    />
  );
}

function PopoverBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-body" className={cn("w-full px-4 pb-3", className)} {...props} />;
}

function PopoverSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-separator"
      className={cn("h-px w-full shrink-0 bg-white/10", className)}
      {...props}
    />
  );
}

function PopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-footer"
      className={cn(
        "flex w-full shrink-0 items-center gap-3 overflow-hidden rounded-b-lg bg-[#27272a] px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

function PopoverStep({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-step"
      className={cn("min-w-0 flex-1 text-[13px] leading-[1.6] font-medium text-white/56", className)}
      {...props}
    />
  );
}

function PopoverFooterActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-footer-actions"
      className={cn("flex min-w-0 flex-1 items-start gap-2", className)}
      {...props}
    />
  );
}

const popoverFooterButtonVariants = cva(
  "rounded-md px-2 text-[13px] leading-[1.1] font-medium shadow-none focus-visible:ring-0 focus-visible:shadow-[var(--shadow-control-focus)]",
  {
    variants: {
      tone: {
        muted: "bg-white/16 text-white hover:bg-white/24 hover:text-white",
        primary: "bg-white text-[#27272a] hover:bg-white/88 hover:text-[#27272a]",
      },
      stretch: {
        true: "flex-1",
        false: "",
      },
    },
    defaultVariants: {
      tone: "muted",
      stretch: false,
    },
  },
);

function PopoverFooterButton({
  className,
  size = "sm",
  tone = "muted",
  stretch = false,
  variant = "ghost",
  ...props
}: React.ComponentProps<typeof Button> & VariantProps<typeof popoverFooterButtonVariants>) {
  return (
    <Button
      size={size}
      variant={variant}
      className={cn(popoverFooterButtonVariants({ tone, stretch }), className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverFooterActions,
  PopoverFooterButton,
  PopoverHeader,
  PopoverSeparator,
  PopoverStep,
  PopoverTitle,
  PopoverTrigger,
};
