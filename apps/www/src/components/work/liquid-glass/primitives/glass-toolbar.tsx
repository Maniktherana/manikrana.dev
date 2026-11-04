import { Toolbar } from "@base-ui/react/toolbar";
import { cn } from "@manikrana/ui/lib/utils";
import { Glass, type GlassProps } from "./glass";
import { GlassButton, type GlassButtonProps } from "./glass-button";

type GlassToolbarProps = Omit<GlassProps, "render"> & {
  orientation?: "horizontal" | "vertical";
};

function GlassToolbar({ className, orientation = "horizontal", ...props }: GlassToolbarProps) {
  return (
    <Glass
      {...props}
      render={<Toolbar.Root orientation={orientation} />}
      className={cn(
        "flex w-fit items-center gap-1 rounded-full p-1",
        orientation === "vertical" && "flex-col",
        className,
      )}
    />
  );
}

function GlassToolbarButton({
  variant = "ghost",
  shape = "circle",
  size = "md",
  ...props
}: GlassButtonProps) {
  return (
    <Toolbar.Button
      render={<GlassButton variant={variant} shape={shape} size={size} {...props} />}
    />
  );
}

function GlassToolbarSeparator({
  className,
  ...props
}: Omit<Toolbar.Separator.Props, "className"> & { className?: string }) {
  return (
    <Toolbar.Separator {...props} className={cn("mx-0.5 h-5 w-px bg-current/15", className)} />
  );
}

GlassToolbar.Button = GlassToolbarButton;
GlassToolbar.Group = Toolbar.Group;
GlassToolbar.Separator = GlassToolbarSeparator;

export { GlassToolbar };
export type { GlassToolbarProps };
