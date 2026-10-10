import type { CSSProperties } from "react";
import { Sweep, stillBand } from "@/work/sweep/sweep";

const SWEEP_MS = 2200;
const PAUSE_MS = 400;

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
