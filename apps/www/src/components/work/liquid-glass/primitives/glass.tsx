import "./glass.css";
import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@manikrana/ui/lib/utils";
import { useMagnetic, type MagneticOptions } from "./magnetic";

type GlassProps = useRender.ComponentProps<"div"> & {
  light?: boolean;
  magnetic?: boolean | MagneticOptions;
  rim?: "regular" | "deep" | false;
  tint?: string;
  variant?: "regular" | "clear";
};

function Glass({
  children,
  className,
  light,
  magnetic = false,
  ref,
  render,
  rim = "regular",
  style,
  tint,
  variant = "regular",
  ...props
}: GlassProps) {
  const press = useMagnetic<HTMLElement>(typeof magnetic === "object" ? magnetic : undefined);
  const live = magnetic !== false;

  return useRender({
    render,
    ref: live ? [press.ref, ref as Ref<HTMLElement>] : (ref as Ref<HTMLElement>),
    props: mergeProps<"div">(live ? press.handlers : {}, props, {
      "data-held": (live && press.held) || undefined,
      "data-tint": tint === undefined ? undefined : "",
      style: tint === undefined ? style : ({ "--tint": tint, ...style } as CSSProperties),
      className: cn(
        "relative isolate",
        variant === "regular"
          ? "bg-(image:--glass-fill) shadow-[var(--glass-contact),var(--glass-lift)] [backdrop-filter:var(--glass-backdrop)]"
          : "bg-white/8 shadow-[0_2px_8px_rgb(0_0_0/0.3)] [backdrop-filter:brightness(1.12)_saturate(1.15)]",
        live && "magnetic group touch-none select-none",
        className,
      ),
      children: (
        <>
          {rim && <GlassRim deep={rim === "deep"} />}
          {(light ?? live) && <GlassLight />}
          {children as ReactNode}
        </>
      ),
    } as ComponentProps<"div">),
  });
}

function GlassLight() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] [corner-shape:inherit]"
    >
      <span className="absolute top-(--light-y,50%) left-(--light-x,50%) aspect-square w-[max(160%,10rem)] -translate-1/2 scale-50 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--glass-rim)_30%,transparent),color-mix(in_oklab,var(--glass-rim)_28.7%,transparent)_10%,color-mix(in_oklab,var(--glass-rim)_25%,transparent)_20%,color-mix(in_oklab,var(--glass-rim)_20%,transparent)_30%,color-mix(in_oklab,var(--glass-rim)_14.6%,transparent)_40%,color-mix(in_oklab,var(--glass-rim)_9.7%,transparent)_50%,color-mix(in_oklab,var(--glass-rim)_5.9%,transparent)_60%,color-mix(in_oklab,var(--glass-rim)_3.3%,transparent)_70%,color-mix(in_oklab,var(--glass-rim)_1.7%,transparent)_80%,color-mix(in_oklab,var(--glass-rim)_0.8%,transparent)_90%,transparent)] opacity-0 transition-[scale,opacity] duration-150 ease-out group-data-held:scale-100 group-data-held:opacity-100 group-data-held:duration-300 motion-reduce:scale-100" />
      <span className="absolute inset-0 rounded-[inherit] opacity-0 shadow-[inset_0_0_10px_color-mix(in_oklab,var(--glass-rim)_55%,transparent),inset_0_0_0_1px_color-mix(in_oklab,var(--glass-rim)_35%,transparent)] transition-opacity duration-150 ease-out [corner-shape:inherit] [mask-image:radial-gradient(circle_at_var(--light-x,50%)_var(--light-y,50%),black,transparent_70%)] group-data-held:opacity-100 group-data-held:duration-300" />
    </span>
  );
}

function GlassGoo({
  height,
  id,
  width,
  x,
  y,
}: {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
}) {
  return (
    <filter
      id={id}
      filterUnits="userSpaceOnUse"
      x={x}
      y={y}
      width={width}
      height={height}
      colorInterpolationFilters="sRGB"
    >
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
      <feColorMatrix
        in="blur"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -6.5"
        result="shape"
      />
      <feFlood style={{ floodColor: "var(--glass-color)" }} result="tint" />
      <feOffset in="shape" dy="16" result="sunk" />
      <feComposite in="shape" in2="sunk" operator="out" result="cap" />
      <feGaussianBlur in="cap" stdDeviation="8" result="glow-cap" />
      <feColorMatrix
        in="glow-cap"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.1 0"
        result="sheen"
      />
      <feMerge result="tone">
        <feMergeNode in="tint" />
        <feMergeNode in="sheen" />
      </feMerge>
      <feComposite in="tone" in2="shape" operator="in" result="fill" />
      <feGaussianBlur in="shape" stdDeviation="3.5" result="soft" />
      <feComposite in="shape" in2="soft" operator="out" result="rim" />
      <feColorMatrix
        in="rim"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.14 0"
        result="glow"
      />
      <feOffset in="shape" dy="1.4" result="lower" />
      <feComposite in="shape" in2="lower" operator="out" result="crest" />
      <feGaussianBlur in="crest" stdDeviation="0.7" result="soft-crest" />
      <feColorMatrix
        in="soft-crest"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 0"
        result="edge"
      />
      <feOffset in="shape" dy="-1" result="higher" />
      <feComposite in="shape" in2="higher" operator="out" result="trough" />
      <feGaussianBlur in="trough" stdDeviation="0.75" result="soft-trough" />
      <feColorMatrix
        in="soft-trough"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.2 0"
        result="base"
      />
      <feColorMatrix
        in="shape"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.2 0"
        result="dark"
      />
      <feOffset in="dark" dy="1" result="dropped" />
      <feGaussianBlur in="dropped" stdDeviation="1" result="blurred" />
      <feComposite in="blurred" in2="shape" operator="out" result="shadow" />
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="fill" />
        <feMergeNode in="glow" />
        <feMergeNode in="edge" />
        <feMergeNode in="base" />
      </feMerge>
    </filter>
  );
}

function GlassRim({ deep = false }: { deep?: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-(--glass-rim-strength) [mask-image:linear-gradient(to_bottom,black_15%,transparent_50%),linear-gradient(to_right,transparent_3%,black_24%,black_76%,transparent_97%)] [mask-composite:intersect] [corner-shape:inherit]",
          deep
            ? "shadow-[inset_0_1px_0.75px_color-mix(in_oklab,var(--glass-rim)_20%,transparent),inset_0_10px_10px_-6px_color-mix(in_oklab,var(--glass-rim)_10%,transparent)]"
            : "shadow-[inset_0_1px_0.75px_color-mix(in_oklab,var(--glass-rim)_20%,transparent),inset_0_4px_4px_-2px_color-mix(in_oklab,var(--glass-rim)_6%,transparent)]",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-(--glass-rim-strength) [mask-image:linear-gradient(to_top,black_15%,transparent_50%),linear-gradient(to_right,transparent_3%,black_24%,black_76%,transparent_97%)] [mask-composite:intersect] [corner-shape:inherit]",
          deep
            ? "shadow-[inset_0_-1px_0.5px_color-mix(in_oklab,var(--glass-rim)_20%,transparent),inset_0_-10px_10px_-6px_color-mix(in_oklab,var(--glass-rim)_8%,transparent)]"
            : "shadow-[inset_0_-1px_0.5px_color-mix(in_oklab,var(--glass-rim)_20%,transparent),inset_0_-4px_4px_-2px_color-mix(in_oklab,var(--glass-rim)_6%,transparent)]",
        )}
      />
    </>
  );
}

export { Glass, GlassGoo, GlassLight, GlassRim };
export type { GlassProps };
