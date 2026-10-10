"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

// shadcn's sizes plus xl, the site portrait (48px).
const avatarVariants = cva("group/avatar relative flex shrink-0 rounded-full select-none", {
  variants: {
    size: {
      sm: "size-6",
      default: "size-8",
      lg: "size-10",
      xl: "size-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ size, className }))}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-white/10",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-control text-sm text-control-foreground group-data-[size=sm]/avatar:text-xs group-data-[size=xl]/avatar:text-base",
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        "group-data-[size=xl]/avatar:size-3.5 group-data-[size=xl]/avatar:[&>svg]:size-2.5",
        className,
      )}
      {...props}
    />
  );
}

// Avatars overlap in a group, so each gets an opaque page-color base and the
// translucent fallback fill cannot show the avatar beneath it. The 2px ring in
// the page color cuts each avatar out of the one it overlaps.
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:bg-background *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

// Opaque for the same reason: popover is the opaque step closest to a control
// fill on the page.
function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-popover text-sm text-control-foreground ring-2 ring-background [&>svg]:size-4",
        "group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=sm]/avatar-group:text-xs group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        "group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5",
        "group-has-data-[size=xl]/avatar-group:size-12 group-has-data-[size=xl]/avatar-group:text-base group-has-data-[size=xl]/avatar-group:[&>svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
