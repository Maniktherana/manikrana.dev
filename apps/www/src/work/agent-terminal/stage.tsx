import { useRef } from "react";
import { Toolbar, ToolbarButton } from "@/components/toolbar";
import { FittedTerminal, useDemoTerminal } from "@/work/agent-terminal/demo";

// The terminal plays on its own and loops; Replay starts the run over, so you
// need not wait out the loop to see the first prompt typed again.
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
