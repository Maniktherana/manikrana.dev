import { useRef } from "react";
import { FittedTerminal, useDemoTerminal } from "@/work/agent-terminal/demo";

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const { frame, paused, instant } = useDemoTerminal(ref);
  return <FittedTerminal ref={ref} margin={16} frame={frame} paused={paused} instant={instant} />;
}
