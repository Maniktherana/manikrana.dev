import type { CSSProperties } from "react";
import { Sweep, stillBand } from "./sweep";

export function Example() {
  return (
    <Sweep palette="tide" className="h-40 rounded-3xl bg-card">
      <div
        aria-hidden="true"
        style={{ "--band": stillBand("tide") } as CSSProperties}
        className="absolute inset-0 hidden bg-(image:--band) motion-reduce:block"
      />
    </Sweep>
  );
}
