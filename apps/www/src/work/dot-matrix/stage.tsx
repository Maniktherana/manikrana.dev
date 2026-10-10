import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/toolbar";
import { DotMatrix } from "./dot-matrix";
import type { DotMatrixHueName } from "./hues";
import type { DotMatrixPattern } from "./patterns";
import { HUES, PATTERNS } from "./showcase";

const CELL = 40;

const LIT: DotMatrixPattern = { period: 1, light: () => 1 };

export function Stage() {
  const [index, setIndex] = useState(0);
  const [hue, setHue] = useState<DotMatrixHueName>("iris");
  const [bevel, setBevel] = useState(true);

  return (
    <div className="@container grid size-full place-items-center">
      <DotMatrix
        pattern={PATTERNS[index].pattern}
        hueMap={hue}
        cell={CELL}
        bevel={bevel}
        gapRatio={0.2}
        className="w-[min(100cqw_-_4rem,30rem)]"
      />
      <Toolbar aria-label="Hue" className="top-4 bottom-auto">
        {HUES.map(({ name, label }) => (
          <ToolbarButton
            key={name}
            iconOnly
            aria-label={label}
            aria-pressed={hue === name}
            onClick={() => setHue(name)}
          >
            <DotMatrix pattern={LIT} hueMap={name} cols={3} rows={3} cell={5} paused />
          </ToolbarButton>
        ))}
      </Toolbar>
      <Toolbar
        aria-label="Pattern"
        className="max-w-[calc(100%_-_2rem)] overflow-x-auto [scrollbar-width:none]"
      >
        <ToolbarGroup aria-label="Pattern">
          {PATTERNS.map(({ label }, position) => (
            <ToolbarButton
              key={label}
              aria-pressed={index === position}
              onClick={() => setIndex(position)}
            >
              {label}
            </ToolbarButton>
          ))}
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarButton aria-pressed={!bevel} onClick={() => setBevel((current) => !current)}>
          Flat
        </ToolbarButton>
      </Toolbar>
    </div>
  );
}
