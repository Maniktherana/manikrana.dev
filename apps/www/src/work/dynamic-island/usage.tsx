import { useState } from "react";
import { DynamicIsland, type IslandView } from "./dynamic-island";

const VIEWS: IslandView[] = ["idle", "ring", "timer"];

export function Example() {
  const [view, setView] = useState<IslandView>("idle");

  return (
    <div className="flex flex-col items-center gap-6">
      <DynamicIsland view={view} onViewChange={setView} />
      <div className="flex gap-2">
        {VIEWS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setView(name)}
            className="rounded-full bg-control px-4 py-2 text-sm capitalize hover:bg-control-hover"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
