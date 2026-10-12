import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { brandPaths } from "./brand-paths";
import { flamePaths } from "./prometheus-flame";

export type MarkName = "turboml" | "prometheus" | "gsoc";

const hoverEffects = {
  turboml: {
    selector: ".turbo-rotor",
    from: "perspective(900px) rotateY(0deg)",
    to: "perspective(900px) rotateY(360deg)",
    duration: 700,
  },
  gsoc: { selector: ".gsoc-sun", from: "rotate(0deg)", to: "rotate(180deg)", duration: 700 },
} as const;

export function AnimatedMark({
  name,
  hovered,
  className,
}: {
  name: MarkName;
  hovered: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const hoverAnimation = useRef<Animation | undefined>(undefined);
  const reducedMotion = useReducedMotion();
  const animate = hovered && !reducedMotion;
  useEffect(() => {
    if (reducedMotion) {
      hoverAnimation.current?.cancel();
      return;
    }
    if (!hovered || name === "prometheus" || hoverAnimation.current?.playState === "running")
      return;
    const effect = hoverEffects[name];
    // `to` must look identical to `from`: the turn has no fill and finishes after hover ends.
    hoverAnimation.current = ref.current
      ?.querySelector(effect.selector)
      ?.animate([{ transform: effect.from }, { transform: effect.to }], {
        duration: effect.duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      });
  }, [hovered, name, reducedMotion]);
  useEffect(() => () => hoverAnimation.current?.cancel(), []);
  const viewBox =
    name === "prometheus"
      ? "20 5 74 103"
      : name === "turboml"
        ? brandPaths.turboml.viewBox
        : "0 0 24 24";

  return (
    <svg
      ref={ref}
      className={cn(
        `animated-mark mark--${name} size-4 shrink-0 self-center overflow-visible text-foreground grayscale opacity-[0.72]`,
        className,
      )}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {name === "turboml" ? (
        <>
          <defs>
            <pattern id={`${id}-color`} patternUnits="userSpaceOnUse" width="456" height="400">
              <image href="/logos/turboml.png" width="456" height="400" />
            </pattern>
          </defs>
          <g className="turbo-rotor">
            {brandPaths.turboml.paths.map((d, index) => (
              <path key={index} d={d} fill={`url(#${id}-color)`} />
            ))}
          </g>
        </>
      ) : name === "prometheus" ? (
        <>
          <path d="M56.667 106.055c-8.904 0-16.123-5.948-16.123-13.283H72.79c0 7.334-7.219 13.283-16.123 13.283ZM83.297 88.373H30.034v-9.658h53.264v9.658Z" />
          <motion.path
            className="prom-flame"
            initial={false}
            animate={{
              d: animate
                ? [flamePaths[0], flamePaths[1], flamePaths[0], flamePaths[2], flamePaths[0]]
                : flamePaths[0],
            }}
            transition={
              animate
                ? { duration: 1.2, times: [0, 0.24, 0.48, 0.76, 1], ease: "easeInOut" }
                : { duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }
            }
          />
        </>
      ) : (
        <>
          <path
            className="gsoc-sun"
            d="m11.995 0-.954.954L9.24 2.758l-.755.725h-4.97v5.001L0 12.004l2.758 2.76.755.752v4.973h4.971L11.995 24l3.523-3.511h4.961v-4.973L24 12.005l-3.52-3.521v-5h-5.01Z"
          />
          <path
            className="gsoc-code"
            d="m8.4 8.5-3.1 3.5 3.1 3.5m7.2-7 3.1 3.5-3.1 3.5m-2.3-9-2.6 11"
            fill="none"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
