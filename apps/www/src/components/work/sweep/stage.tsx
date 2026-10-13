import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons/arrow-left";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { ArrowUpIcon } from "@/components/icons/arrow-up";
import { Toolbar, ToolbarButton } from "@manikrana/ui/components/toolbar";
import {
  Sweep,
  sweepPalettes,
  stillBand,
  type SweepDirection,
  type SweepPaletteName,
} from "@/components/work/sweep/sweep";

const directions: { value: SweepDirection; label: string; icon: ReactNode }[] = [
  { value: "rtl", label: "Right to left", icon: <ArrowLeftIcon /> },
  { value: "btt", label: "Bottom to top", icon: <ArrowUpIcon /> },
  { value: "ttb", label: "Top to bottom", icon: <ArrowUpIcon className="rotate-180" /> },
  { value: "ltr", label: "Left to right", icon: <ArrowRightIcon /> },
];

function swatch(name: SweepPaletteName) {
  const { a, b, c, d } = sweepPalettes[name];
  const stops = [0, 0.25, 0.5, 0.75, 1].map((axis) => {
    const hue = axis * 1.4 + 0.175;
    const [red, green, blue] = ([0, 1, 2] as const).map((index) => {
      const value = a[index] + b[index] * Math.cos(2 * Math.PI * (c[index] * hue + d[index]));
      return Math.round(255 * Math.min(1, Math.max(0, value)));
    });
    return `rgb(${red} ${green} ${blue})`;
  });
  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

const palettes = (Object.keys(sweepPalettes) as SweepPaletteName[]).map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
  swatch: swatch(value),
}));

export function Stage() {
  const [direction, setDirection] = useState<SweepDirection>("ltr");
  const [palette, setPalette] = useState<SweepPaletteName>("aurora");

  return (
    <div className="relative size-full">
      <Sweep direction={direction} palette={palette}>
        <div
          aria-hidden="true"
          style={{ "--band": stillBand(palette, direction) } as CSSProperties}
          className="absolute inset-0 hidden bg-(image:--band) motion-reduce:block"
        />
      </Sweep>
      <Toolbar aria-label="Palette" className="top-4 bottom-auto">
        {palettes.map((option) => (
          <ToolbarButton
            key={option.value}
            iconOnly
            aria-label={`${option.label} palette`}
            aria-pressed={palette === option.value}
            onClick={() => setPalette(option.value)}
          >
            <span
              style={{ "--swatch": option.swatch } as CSSProperties}
              className="size-5 rounded-full bg-(image:--swatch)"
            />
          </ToolbarButton>
        ))}
      </Toolbar>
      <Toolbar aria-label="Direction">
        {directions.map((option) => (
          <ToolbarButton
            key={option.value}
            iconOnly
            aria-label={option.label}
            aria-pressed={direction === option.value}
            onClick={() => setDirection(option.value)}
          >
            {option.icon}
          </ToolbarButton>
        ))}
      </Toolbar>
    </div>
  );
}
