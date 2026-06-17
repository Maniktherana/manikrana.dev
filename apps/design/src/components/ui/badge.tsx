import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeStateVariants = {
  neutral:
    "border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b] dark:border-white/10 dark:bg-[#3f3f46] dark:text-[#d4d4d8]",
  default:
    "border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b] dark:border-white/10 dark:bg-[#3f3f46] dark:text-[#d4d4d8]",
  secondary:
    "border-[#d4d4d8] bg-[#f4f4f5] text-[#52525b] dark:border-white/10 dark:bg-[#3f3f46] dark:text-[#d4d4d8]",
  information:
    "border-[#93c5fd] bg-[#dbeafe] text-[#1e40af] dark:border-[#1e3a8a] dark:bg-[#172554] dark:text-[#93c5fd]",
  success:
    "border-[#6ee7b7] bg-[#d1fae5] text-[#065f46] dark:border-[#064e3b] dark:bg-[#022c22] dark:text-[#34d399]",
  warning:
    "border-[#fdba74] bg-[#ffedd5] text-[#9a3412] dark:border-[#7c2d12] dark:bg-[#431407] dark:text-[#fdba74]",
  destructive:
    "border-[#fda4af] bg-[#ffe4e6] text-[#9f1239] dark:border-[#881337] dark:bg-[#4c0519] dark:text-[#fda4af]",
  error:
    "border-[#fda4af] bg-[#ffe4e6] text-[#9f1239] dark:border-[#881337] dark:bg-[#4c0519] dark:text-[#fda4af]",
  feature:
    "border-[#c4b5fd] bg-[#ede9fe] text-[#5b21b6] dark:border-[#5b21b6] dark:bg-[#2e1065] dark:text-[#c4b5fd]",
  alpha:
    "border-[rgb(24_24_27_/_10%)] bg-[rgb(24_24_27_/_40%)] text-white backdrop-blur-[10px] dark:border-white/10 dark:bg-white/40",
  outline: "border-border bg-background text-foreground",
  ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-muted",
  link: "h-auto border-transparent bg-transparent px-0 py-0 text-foreground hover:underline",
};

const badgeIndicatorVariants = {
  neutral: "bg-[#71717a]",
  default: "bg-[#71717a]",
  secondary: "bg-[#71717a]",
  information: "bg-[#3b82f6]",
  success: "bg-[#10b981]",
  warning: "bg-[#f97316]",
  destructive: "bg-[#f43f5e]",
  error: "bg-[#f43f5e]",
  feature: "bg-[#8b5cf6]",
  alpha: "bg-[rgb(24_24_27_/_40%)]",
};

const badgeVariants = cva(
  "group/badge inline-flex h-[18px] w-fit shrink-0 items-center justify-center gap-0 overflow-hidden border-[0.5px] px-1 py-0.5 text-center text-xs leading-[1.1] font-medium tracking-normal whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-0.5 [&>svg]:pointer-events-none [&>svg]:size-[15px]",
  {
    variants: {
      variant: badgeStateVariants,
      radius: {
        rounded: "rounded",
        full: "rounded-full px-1.5",
      },
    },
    defaultVariants: {
      radius: "rounded",
      variant: "default",
    },
  },
);

function Badge({
  className,
  radius = "rounded",
  render,
  variant = "default",
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      ({
        "data-radius": radius,
        "data-slot": "badge",
        "data-variant": variant,
        className: cn(badgeVariants({ radius, variant }), className),
      } as React.ComponentProps<"span">),
      props,
    ),
    render,
    state: {
      radius,
      slot: "badge",
      variant,
    },
  });
}

const statusBadgeVariants = cva(
  "inline-flex h-[18px] w-fit shrink-0 items-center justify-center overflow-hidden rounded border-[0.5px] border-[#d4d4d8] bg-[#f4f4f5] py-px pr-[5px] text-xs leading-[1.1] font-medium text-[#52525b] whitespace-nowrap dark:border-white/10 dark:bg-[#3f3f46] dark:text-[#d4d4d8] [&>svg]:pointer-events-none [&>svg]:size-[15px]",
  {
    variants: {
      status: {
        neutral: "",
        default: "",
        secondary: "",
        information: "",
        success: "",
        warning: "",
        destructive: "",
        error: "",
        feature: "",
        alpha: "",
      },
      indicator: {
        dot: "gap-1 pl-1.5",
        swatch: "gap-1 pl-1",
      },
    },
    defaultVariants: {
      indicator: "swatch",
      status: "neutral",
    },
  },
);

const statusBadgeIndicatorVariants = cva("shrink-0", {
  variants: {
    status: badgeIndicatorVariants,
    indicator: {
      dot: "size-1.5 rounded-full",
      swatch: "size-2.5 rounded-[2px]",
    },
  },
  defaultVariants: {
    indicator: "swatch",
    status: "neutral",
  },
});

function StatusBadge({
  className,
  children = "Badge",
  indicator = "swatch",
  status = "neutral",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusBadgeVariants>) {
  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(statusBadgeVariants({ indicator, status }), className)}
      {...props}
    >
      <span
        data-slot="status-badge-indicator"
        className={statusBadgeIndicatorVariants({ indicator, status })}
        aria-hidden="true"
      />
      <span data-slot="status-badge-label">{children}</span>
    </span>
  );
}

const iconBadgeVariants = cva(
  "inline-flex size-5 shrink-0 items-center justify-center rounded border-[0.5px] p-0 transition-colors [&>svg]:pointer-events-none [&>svg]:size-[15px]",
  {
    variants: {
      variant: badgeStateVariants,
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function IconBadge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof iconBadgeVariants>) {
  return (
    <span
      data-slot="icon-badge"
      data-variant={variant}
      className={cn(iconBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}

function UserBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="user-badge"
      className={cn(
        "inline-flex h-7 w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-[#fafafa] py-1 pr-2.5 pl-1 text-xs leading-[1.1] font-medium text-[#52525b] whitespace-nowrap shadow-[0_0_0_1px_rgb(0_0_0_/_8%),0_1px_2px_rgb(0_0_0_/_12%)] transition-colors hover:bg-[#f4f4f5] [&>[data-slot=avatar]]:size-5",
        "dark:bg-[#27272a] dark:text-[#a1a1aa] dark:hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}

export {
  Badge,
  StatusBadge,
  IconBadge,
  UserBadge,
  badgeVariants,
  statusBadgeVariants,
  iconBadgeVariants,
};
