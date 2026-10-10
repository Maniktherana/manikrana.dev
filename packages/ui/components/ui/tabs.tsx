"use client";

import { createContext, useContext, useLayoutEffect, useRef } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { easeOut } from "@manikrana/ui/lib/motion";

const IndicatorContext = createContext<{ current: boolean }>({ current: false });

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}: TabsPrimitive.Root.Props) {
  const animateIndicator = useRef(false);
  const previousValue = useRef(value);
  if (previousValue.current !== value) {
    animateIndicator.current = true;
    previousValue.current = value;
  }
  return (
    <IndicatorContext value={animateIndicator}>
      <TabsPrimitive.Root
        {...props}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next, details) => {
          onValueChange?.(next, details);
          if (!details.isCanceled) animateIndicator.current = details.reason === "none";
        }}
        data-slot="tabs"
        orientation={orientation}
        className={cn("flex gap-4 data-horizontal:flex-col data-vertical:flex-row", className)}
      />
    </IndicatorContext>
  );
}

function TabsIndicator({
  position,
  size,
}: {
  position: TabsPrimitive.Tab.Position;
  size: TabsPrimitive.Tab.Size;
}) {
  const pendingSelection = useContext(IndicatorContext);
  const reducedMotion = useReducedMotion();
  const previous = useRef({
    x: position.left,
    y: position.top,
    width: size.width,
    height: size.height,
  });
  const geometryChanged =
    previous.current.x !== position.left ||
    previous.current.y !== position.top ||
    previous.current.width !== size.width ||
    previous.current.height !== size.height;
  const animateSelection = geometryChanged && pendingSelection.current;
  useLayoutEffect(() => {
    if (geometryChanged) {
      pendingSelection.current = false;
      previous.current = {
        x: position.left,
        y: position.top,
        width: size.width,
        height: size.height,
      };
    }
  }, [geometryChanged, pendingSelection, position.left, position.top, size.width, size.height]);
  return (
    <motion.span
      data-slot="tabs-indicator"
      className="absolute top-0 left-0 rounded-full bg-control-selected"
      initial={false}
      animate={{ x: position.left, y: position.top, width: size.width, height: size.height }}
      transition={{
        type: "tween",
        duration: reducedMotion || !animateSelection ? 0 : 0.25,
        ease: easeOut,
      }}
    />
  );
}

function TabsList({ className, children, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      {...props}
      data-slot="tabs-list"
      className={cn(
        "relative isolate inline-flex w-fit gap-0.75 rounded-full bg-control p-0.75 data-vertical:flex-col data-vertical:rounded-2xl",
        className,
      )}
    >
      <TabsPrimitive.Indicator
        className="pointer-events-none absolute inset-0 -z-10"
        render={(indicatorProps, { activeTabPosition, activeTabSize }) => (
          <span {...indicatorProps}>
            {activeTabPosition &&
              activeTabSize &&
              activeTabSize.width > 0 &&
              activeTabSize.height > 0 && (
                <TabsIndicator position={activeTabPosition} size={activeTabSize} />
              )}
          </span>
        )}
      />
      {children}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      {...props}
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-7.5 shrink-0 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-medium text-control-foreground transition-colors duration-150 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-active:text-foreground",
        className,
      )}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      {...props}
      data-slot="tabs-content"
      className={cn("min-w-0 flex-1 outline-none", className)}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
