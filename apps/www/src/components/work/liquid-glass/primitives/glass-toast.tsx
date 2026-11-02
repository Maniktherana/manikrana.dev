import type { ComponentProps, PointerEvent } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { XmarkBoldIcon } from "@/components/icons/xmark-bold";
import { Glass, type GlassProps } from "./glass";
import { GlassButton, type GlassButtonProps } from "./glass-button";

type GlassToastProps = GlassProps;

function GlassToast({ className, magnetic = true, onPointerDown, ...props }: GlassToastProps) {
  return (
    <Glass
      magnetic={magnetic}
      {...props}
      onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
        if ((event.target as Element).closest("button")) {
          (event as unknown as { preventBaseUIHandler: () => void }).preventBaseUIHandler();
        }
        onPointerDown?.(event);
      }}
      className={cn(
        "flex h-10 w-fit items-center gap-2.5 rounded-full ps-3.75 pe-2 font-[family-name:system-ui] text-[13px] leading-4 font-semibold whitespace-nowrap text-(--glass-ink) subpixel-antialiased",
        className,
      )}
    />
  );
}

function GlassToastIcon({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={cn("grid shrink-0 place-items-center [&_svg]:size-4", className)}
    />
  );
}

function GlassToastTitle(props: ComponentProps<"span">) {
  return <span {...props} />;
}

function GlassToastAction({ className, ...props }: GlassButtonProps) {
  return (
    <GlassButton variant="tint" size="xs" {...props} className={cn("overflow-hidden", className)} />
  );
}

function GlassToastClose({ children, ...props }: GlassButtonProps) {
  return (
    <GlassButton variant="tint" size="xs" shape="circle" aria-label="Dismiss" {...props}>
      {children ?? <XmarkBoldIcon className="size-3.5" />}
    </GlassButton>
  );
}

GlassToast.Icon = GlassToastIcon;
GlassToast.Title = GlassToastTitle;
GlassToast.Action = GlassToastAction;
GlassToast.Close = GlassToastClose;

export { GlassToast };
export type { GlassToastProps };
