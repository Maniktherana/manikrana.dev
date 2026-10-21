import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@manikrana/ui/lib/utils";

import { toggleVariants } from "@manikrana/ui/components/ui/toggle";

type ToggleVariantProps = VariantProps<typeof toggleVariants>;

const ToggleGroupContext = React.createContext<ToggleVariantProps>({});

function ToggleGroup({
  className,
  size,
  bordered,
  static: isStatic,
  children,
  ...props
}: ToggleGroupPrimitive.Props & ToggleVariantProps) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        "flex w-fit items-center gap-2 data-vertical:flex-col data-vertical:items-stretch",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, bordered, static: isStatic }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  size,
  bordered,
  static: isStatic,
  ...props
}: TogglePrimitive.Props & ToggleVariantProps) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        toggleVariants({
          size: size ?? context.size,
          bordered: bordered ?? context.bordered,
          static: isStatic ?? context.static,
        }),
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
