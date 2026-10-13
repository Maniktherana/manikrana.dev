import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

export type MarkProps = { hovered: boolean; className?: string };

export function Mark({
  name,
  viewBox,
  className,
  children,
}: {
  name: string;
  viewBox: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={cn(
        `animated-mark mark--${name} size-4 shrink-0 self-center overflow-visible text-foreground grayscale opacity-[0.72]`,
        className,
      )}
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

/** Turns the element once per hover. `to` must look identical to `from`: the turn has no fill and finishes after hover ends. */
export function useTurn<T extends SVGElement>(hovered: boolean, from: string, to: string) {
  const ref = useRef<T>(null);
  const turn = useRef<Animation>(undefined);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return turn.current?.cancel();
    if (!hovered || turn.current?.playState === "running") return;
    turn.current = ref.current?.animate([{ transform: from }, { transform: to }], {
      duration: 700,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    });
  }, [hovered, reducedMotion, from, to]);
  useEffect(() => () => turn.current?.cancel(), []);
  return ref;
}
