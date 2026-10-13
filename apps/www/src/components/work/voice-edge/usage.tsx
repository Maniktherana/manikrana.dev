import { useState } from "react";
import { VoiceEdge } from "./voice-edge";

const MODES = ["idle", "listening", "thinking"] as const;

export function Example() {
  const [mode, setMode] = useState<(typeof MODES)[number]>("idle");

  return (
    <div className="flex flex-col items-center gap-6">
      <VoiceEdge
        active={mode === "listening"}
        processing={mode === "thinking"}
        borderRadius={24}
        onError={() => setMode("idle")}
        className="rounded-3xl"
      >
        <div className="h-64 w-80 bg-neutral-950" />
      </VoiceEdge>
      <div className="flex gap-2">
        {MODES.map((name) => (
          <button key={name} type="button" onClick={() => setMode(name)} className="capitalize">
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
