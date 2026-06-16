"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "h-[52px] bg-transparent",
        progress: "h-[52px] bg-transparent",
        line: "h-[26px] gap-6 bg-transparent",
        browser: "h-7 gap-1 rounded-md bg-muted p-px",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 items-center justify-center gap-2 border border-transparent text-[13px] leading-[1.1] font-medium whitespace-nowrap text-muted-foreground transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:shadow-[var(--shadow-button-primary-focus)] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[15px]",
        "group-data-[variant=default]/tabs-list:h-[52px] group-data-[variant=default]/tabs-list:w-[200px] group-data-[variant=default]/tabs-list:justify-start group-data-[variant=default]/tabs-list:px-4 group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground",
        "group-data-[variant=progress]/tabs-list:h-[52px] group-data-[variant=progress]/tabs-list:w-[200px] group-data-[variant=progress]/tabs-list:justify-start group-data-[variant=progress]/tabs-list:px-4 group-data-[variant=progress]/tabs-list:data-active:bg-background group-data-[variant=progress]/tabs-list:data-active:text-foreground",
        "group-data-[variant=line]/tabs-list:h-[26px] group-data-[variant=line]/tabs-list:flex-none group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:pb-3 group-data-[variant=line]/tabs-list:data-active:border-b-2 group-data-[variant=line]/tabs-list:data-active:border-secondary-foreground group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-foreground",
        "group-data-[variant=browser]/tabs-list:h-7 group-data-[variant=browser]/tabs-list:min-w-40 group-data-[variant=browser]/tabs-list:rounded group-data-[variant=browser]/tabs-list:px-2 group-data-[variant=browser]/tabs-list:data-active:bg-background group-data-[variant=browser]/tabs-list:data-active:text-foreground group-data-[variant=browser]/tabs-list:data-active:shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
