"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Gust, type GustProps } from "@maniktherana/gust";
import { usePrefersReducedMotion } from "@/components/work/gust/use-prefers-reduced-motion";

export const colorSwatchesMotion: Omit<GustProps, "value"> = {
  duration: 360,
  exitDuration: 360,
  stagger: 37,
  down: false,
  enterAngle: 180,
  exitAngle: 180,
  entranceOvershoot: 24,
  entranceHeight: 80,
  entranceScale: 1.19,
  entranceBlur: 2.5,
  exitHeight: 90,
  exitBlur: 2.5,
  exitScale: 0.4,
  blur: true,
  scale: true,
  preservePrefix: true,
};

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
  motion = {},
}: {
  paused?: boolean;
  motion?: Omit<GustProps, "value">;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [selection, setSelection] = useState({ index: 4, angle: 180 });
  const [selectionVersion, setSelectionVersion] = useState(0);
  const selected = selection.index;
  const gentleMotion: Omit<GustProps, "value"> = reducedMotion
    ? {
        duration: 120,
        exitDuration: 80,
        stagger: 0,
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
          value={colors[selected]}
          {...colorSwatchesMotion}
          {...motion}
          enterAngle={motion.enterAngle ?? (motion.down ? 90 : selection.angle)}
          exitAngle={motion.exitAngle ?? (motion.down ? 90 : selection.angle)}
          {...gentleMotion}
        />
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
              className={`pointer-events-none block size-6 rounded-md bg-(--swatch) ${selected === index ? "outline-2 outline-offset-2 outline-(--swatch)" : "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-foreground"}`}
              style={{ "--swatch": color } as CSSProperties}
            />
          </button>
        ))}
      </fieldset>
    </div>
  );
}
