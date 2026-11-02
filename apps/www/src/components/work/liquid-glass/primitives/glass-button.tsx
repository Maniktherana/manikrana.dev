import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@manikrana/ui/lib/utils";
import { GlassLight, GlassRim } from "./glass";
import { useMagnetic, type MagneticOptions } from "./magnetic";

type GlassButtonProps = useRender.ComponentProps<"button"> & {
  accent?: string;
  magnetic?: boolean | MagneticOptions;
  shape?: "pill" | "circle";
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "glass" | "fill" | "tint" | "ghost";
};

const PRESS = { grow: 1.1 };

function GlassButton({
  accent,
  children,
  className,
  magnetic = false,
  ref,
  render,
  shape = "pill",
  size = "md",
  style,
  variant = "glass",
  ...props
}: GlassButtonProps) {
  const press = useMagnetic<HTMLElement>(typeof magnetic === "object" ? magnetic : PRESS);
  const live = magnetic !== false;
  const glass = variant === "glass";

  return useRender({
    render,
    defaultTagName: "button",
    ref: live ? [press.ref, ref as Ref<HTMLElement>] : (ref as Ref<HTMLElement>),
    props: mergeProps<"button">(
      { type: render ? undefined : "button" },
      live ? press.handlers : {},
      props,
      {
        "data-held": (live && press.held) || undefined,
        "data-variant": variant,
        "data-accent": accent === undefined ? undefined : "",
        style: accent === undefined ? style : ({ "--accent": accent, ...style } as CSSProperties),
        className: cn(
          "group relative isolate inline-grid shrink-0 cursor-pointer place-items-center rounded-full text-[13px] leading-4 font-medium whitespace-nowrap select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-default disabled:opacity-50",
          {
            xs: shape === "circle" ? "size-6" : "h-6 px-2.5",
            sm: shape === "circle" ? "size-8" : "h-8 px-3",
            md: shape === "circle" ? "size-11" : "h-11 px-4",
            lg: shape === "circle" ? "size-14" : "h-14 px-5",
          }[size],
          glass &&
            "text-(--glass-ink) shadow-[var(--glass-contact),var(--glass-lift)] [backdrop-filter:var(--glass-backdrop)] transition-[color] duration-250 ease-out data-pressed:text-(--accent-ink) aria-pressed:text-(--accent-ink)",
          variant === "fill" &&
            "bg-(--accent) text-(--accent-ink) transition-[background-color,color] duration-200 ease-out",
          variant === "tint" &&
            "bg-(--accent-wash) text-(--accent-text) transition-[background-color] duration-150 ease-out hover:bg-(--accent-wash-hover)",
          variant === "ghost" &&
            "text-current transition-[background-color,color] duration-150 ease-out hover:bg-(--glass-hover) data-pressed:bg-(--accent-wash) data-pressed:text-(--accent-text) aria-pressed:bg-(--accent-wash) aria-pressed:text-(--accent-text)",
          live && "magnetic touch-none",
          className,
        ),
        children: (
          <>
            {glass && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-[inherit] bg-(image:--glass-fill) transition-opacity duration-250 ease-out group-data-pressed:opacity-0 group-aria-pressed:opacity-0"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-[inherit] bg-(--accent) opacity-0 transition-opacity duration-250 ease-out group-data-pressed:opacity-100 group-aria-pressed:opacity-100"
                />
                <span className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-250 ease-out group-data-pressed:opacity-60 group-aria-pressed:opacity-60">
                  <GlassRim />
                </span>
              </>
            )}
            {live && <GlassLight />}
            {children as ReactNode}
          </>
        ),
      } as ComponentProps<"button">,
    ),
  });
}

export { GlassButton };
export type { GlassButtonProps };
