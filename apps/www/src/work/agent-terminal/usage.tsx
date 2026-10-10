import { AgentTerminal } from "./agent-terminal";
import { useTerminalPlayback, type TerminalScript } from "./use-terminal-playback";

const SCRIPT: TerminalScript = {
  rows: [
    { kind: "prompt", text: "Fix the failing test.", at: 1200, typing: { from: 0, duration: 900 } },
    { kind: "message", text: "I’ll run the suite first.", at: 1600 },
    { kind: "command", text: "bun test --bail", program: "bun test", at: 2600 },
  ],
  activity: [
    { at: 1200, label: "Thinking" },
    { at: 4000, label: "" },
  ],
  duration: 6000,
};

export function Example() {
  const { frame } = useTerminalPlayback(SCRIPT);
  return (
    <AgentTerminal
      {...frame}
      header={{ title: "Claude Code" }}
      footer="Bypass permissions on"
      className="scale-75"
    />
  );
}
