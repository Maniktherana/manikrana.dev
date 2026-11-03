"use client";

import { useEffect, useId, useState } from "react";
import { DEFAULT_MOTION, Gust, type GustMotionOptions } from "@maniktherana/gust";
import { MinusLargeIcon } from "@/components/icons/minus-large";
import { PlusLargeIcon } from "@/components/icons/plus-large";
import { usePrefersReducedMotion } from "@/components/work/gust/use-prefers-reduced-motion";

const min = 0;
const max = 1000;
const demoCounts = [
  7, 8, 9, 10, 11, 12, 47, 87, 97, 98, 99, 100, 101, 102, 347, 687, 987, 997, 998, 999, 1000,
];
const buttonClassName =
  "grid size-11 shrink-0 place-items-center rounded-full bg-foreground/5 text-muted-foreground ring-1 ring-foreground/10 transition-[color,scale,opacity] duration-150 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:text-foreground active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:scale-100";

type GuestState = { count: number; falling: boolean; touched: boolean };

function step(current: GuestState, delta: number, touched: boolean): GuestState {
  const count = Math.min(max, Math.max(min, current.count + delta));

  return { count, falling: count < current.count, touched: current.touched || touched };
}

export function GuestsExample({
  paused = false,
  motion = DEFAULT_MOTION,
}: {
  paused?: boolean;
  motion?: GustMotionOptions;
}) {
  const [state, setState] = useState<GuestState>({ count: 7, falling: false, touched: false });
  const reducedMotion = usePrefersReducedMotion();
  const countId = useId();
  const change = (delta: number) => setState((current) => step(current, delta, true));

  useEffect(() => {
    if (paused || reducedMotion || state.touched) return undefined;

    const timer = window.setTimeout(
      () =>
        setState((current) => {
          const index = demoCounts.indexOf(current.count);
          const count = demoCounts[(index + 1) % demoCounts.length];
          return step(current, count - current.count, false);
        }),
      state.count === max ? 700 : 350,
    );

    return () => window.clearTimeout(timer);
  }, [paused, reducedMotion, state.count, state.touched]);

  return (
    <fieldset aria-label="Counter" className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Decrease count"
        aria-describedby={countId}
        disabled={state.count <= min}
        onClick={() => change(-1)}
        className={buttonClassName}
      >
        <MinusLargeIcon />
      </button>
      <output
        id={countId}
        aria-live={state.touched ? "polite" : "off"}
        aria-atomic="true"
        className="flex w-32 items-center justify-center"
      >
        <span className="sr-only">{state.count}</span>
        <span aria-hidden="true" className="inline-flex text-4xl font-medium tabular-nums">
          <Gust
            direction={state.falling ? "down" : "up"}
            motion={{
              ...motion,
              ...(reducedMotion
                ? {
                    duration: 120,
                    exitDuration: 80,
                    stagger: 0,
                    staggerSpread: 0,
                    enterStagger: 0,
                    exitStagger: 0,
                    entranceOvershoot: 0,
                    entranceHeight: 0,
                    exitHeight: 0,
                    blur: false,
                    scale: false,
                  }
                : {}),
            }}
          >
            {String(state.count)}
          </Gust>
        </span>
      </output>
      <button
        type="button"
        aria-label="Increase count"
        aria-describedby={countId}
        disabled={state.count >= max}
        onClick={() => change(1)}
        className={buttonClassName}
      >
        <PlusLargeIcon />
      </button>
    </fieldset>
  );
}
