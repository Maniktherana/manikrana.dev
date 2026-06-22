import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "group/avatar relative flex shrink-0 items-center justify-center select-none",
  {
    variants: {
      variant: {
        default: "bg-card",
        border: "border border-transparent bg-card bg-clip-border shadow-[var(--shadow-card)]",
      },
      radius: {
        full: "rounded-full",
        rounded: "rounded-lg",
      },
      size: {
        "3xs": "size-[18px]",
        "2xs": "size-5",
        xs: "size-6",
        sm: "size-7",
        default: "size-8",
        lg: "size-9",
        xl: "size-10",
      },
    },
    defaultVariants: {
      variant: "border",
      radius: "full",
      size: "default",
    },
  },
);

function Avatar({
  className,
  variant = "border",
  radius = "full",
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-variant={variant}
      data-radius={radius}
      data-size={size}
      data-slot="avatar"
      className={cn(avatarVariants({ variant, radius, size }), className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full overflow-hidden rounded-[inherit] object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
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
        "flex size-full items-center justify-center overflow-hidden rounded-[inherit] bg-card text-center text-[13px] leading-[1.1] font-normal text-secondary-foreground group-data-[size=3xs]/avatar:text-[11px] group-data-[size=2xs]/avatar:text-[11px] group-data-[size=xs]/avatar:text-xs group-data-[size=lg]/avatar:text-sm group-data-[size=xl]/avatar:text-base [&_svg]:size-[15px]",
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
        "absolute -right-0.5 -bottom-0.5 z-20 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none",
        "group-data-[size=3xs]/avatar:size-1.5 group-data-[size=2xs]/avatar:size-1.5 group-data-[size=xs]/avatar:size-2",
        "group-data-[size=sm]/avatar:size-2.5 group-data-[size=default]/avatar:size-3 group-data-[size=lg]/avatar:size-3.5 group-data-[size=xl]/avatar:size-4",
        "[&>svg]:size-2 group-data-[size=3xs]/avatar:[&>svg]:hidden group-data-[size=2xs]/avatar:[&>svg]:hidden group-data-[size=xs]/avatar:[&>svg]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:shadow-[0_0_0_1px_var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-[13px] leading-[1.1] font-normal text-secondary-foreground ring-2 ring-background shadow-[0_0_0_1px_var(--border)] group-has-data-[size=lg]/avatar-group:size-9 group-has-data-[size=sm]/avatar-group:size-7 [&>svg]:size-[15px]",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
