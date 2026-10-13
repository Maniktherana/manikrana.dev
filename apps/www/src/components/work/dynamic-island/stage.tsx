import { useState } from "react";
import { Toolbar, ToolbarButton } from "@manikrana/ui/components/toolbar";
import { DynamicIsland, type IslandView } from "@/components/work/dynamic-island/dynamic-island";

const VIEWS: IslandView[] = ["idle", "ring", "timer"];

export function Stage() {
  const [view, setView] = useState<IslandView>("idle");

  return (
    <div className="@container relative flex size-full items-center justify-center">
      <div className="h-40 w-80 shrink-0 @max-xs:scale-85">
        <DynamicIsland view={view} onViewChange={setView} />
      </div>
      <Toolbar aria-label="Island activity">
        {VIEWS.map((item) => (
          <ToolbarButton
            key={item}
            aria-pressed={view === item}
            className="capitalize"
            onClick={() => setView(item)}
          >
            {item}
          </ToolbarButton>
        ))}
      </Toolbar>
    </div>
  );
}
