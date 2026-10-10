import type { CSSProperties } from "react";
import { Sweep, stillBand } from "@/work/sweep/sweep";

// A slower sweep with a shorter pause than the default, so the small tile
// shows the band most of the time.
const SWEEP_MS = 2200;
const PAUSE_MS = 400;

// The band sweeps edge to edge across the tile, pauses and sweeps again. Under
// reduced motion it rests across the middle instead.
export function Preview() {
  return (
    <Sweep sweepMs={SWEEP_MS} pauseMs={PAUSE_MS}>
      <div
        aria-hidden="true"
        style={{ "--band": stillBand() } as CSSProperties}
        className="absolute inset-0 hidden bg-(image:--band) motion-reduce:block"
      />
    </Sweep>
  );
}
