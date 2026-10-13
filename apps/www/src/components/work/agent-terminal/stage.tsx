import { useRef } from "react";
import { Toolbar, ToolbarButton } from "@manikrana/ui/components/toolbar";
import { FittedTerminal, useDemoTerminal } from "@/components/work/agent-terminal/demo";

export function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const { frame, paused, instant, replay } = useDemoTerminal(ref);
  return (
    <div className="relative size-full">
      <FittedTerminal
        ref={ref}
        margin={24}
        reserve={64}
        frame={frame}
        paused={paused}
        instant={instant}
      />
      <Toolbar aria-label="Terminal">
        <ToolbarButton onClick={replay}>Replay</ToolbarButton>
      </Toolbar>
    </div>
  );
}
