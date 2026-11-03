"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { DEFAULT_MOTION, Gust, type GustMotionOptions } from "@maniktherana/gust";
import { usePrefersReducedMotion } from "@/components/work/gust/use-prefers-reduced-motion";

const colors = [
  "#F87171",
  "#FB923C",
  "#FBBF24",
  "#4ADE80",
  "#2DD4BF",
  "#38BDF8",
  "#818CF8",
  "#C084FC",
  "#F472B6",
];

export function ColorSwatchesExample({
  paused = false,
  motion = DEFAULT_MOTION,
}: {
  paused?: boolean;
  motion?: GustMotionOptions;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [selection, setSelection] = useState({ index: 4, angle: 180 });
  const [selectionVersion, setSelectionVersion] = useState(0);
  const selected = selection.index;
  const gentleMotion: GustMotionOptions = reducedMotion
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
    : {};

  useEffect(() => {
    if (paused || reducedMotion) return undefined;

    const timer = window.setTimeout(() => {
      const next = Math.floor(Math.random() * (colors.length - 1));
      setSelection({ index: next >= selected ? next + 1 : next, angle: 180 });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [paused, reducedMotion, selected, selectionVersion]);

  function selectSwatch(index: number) {
    setSelection((current) => ({
      index,
      angle: index === current.index ? current.angle : index > current.index ? 180 : 0,
    }));
    setSelectionVersion((current) => current + 1);
  }

  return (
    <div aria-label="Color picker" className="flex w-full max-w-48 flex-col gap-7">
      <div
        className="flex h-9 items-center justify-center text-3xl font-medium text-(--swatch) tabular-nums"
        style={{ "--swatch": colors[selected] } as CSSProperties}
      >
        <Gust
          direction={selection.angle === 180 ? "left" : "right"}
          motion={{ ...motion, ...gentleMotion }}
        >
          {colors[selected]}
        </Gust>
      </div>
      <fieldset aria-label="Color swatches" className="grid w-fit grid-cols-3 self-center">
        {colors.map((color, index) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={selected === index}
            onClick={() => selectSwatch(index)}
            className="group grid size-8 place-items-center rounded-lg focus-visible:outline-none"
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none block size-6 rounded-md bg-(--swatch) group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring ${selected === index ? "outline-2 outline-offset-2 outline-(--swatch)" : ""}`}
              style={{ "--swatch": color } as CSSProperties}
            />
          </button>
        ))}
      </fieldset>
    </div>
  );
}
