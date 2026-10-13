import { useState } from "react";
import { Toolbar, ToolbarButton } from "@manikrana/ui/components/toolbar";
import { PATTERNS, STAGE_FIT, Showcase } from "./demo";

export function Stage() {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative size-full">
      <Showcase cycle={index} grid={PATTERNS[index]!.grid} fit={STAGE_FIT} />
      <Toolbar
        aria-label="Pattern"
        className="max-w-[calc(100%-2rem)] overflow-x-auto [scrollbar-width:none]"
      >
        {PATTERNS.map((option, optionIndex) => (
          <ToolbarButton
            key={option.label}
            aria-pressed={index === optionIndex}
            onClick={() => setIndex(optionIndex)}
          >
            {option.label}
          </ToolbarButton>
        ))}
      </Toolbar>
    </div>
  );
}
