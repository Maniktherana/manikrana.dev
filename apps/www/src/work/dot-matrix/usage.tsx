import { DotMatrix } from "./dot-matrix";
import { makeWavePattern } from "./patterns";

const ring = makeWavePattern({
  shape: "triangle",
  drive: "brightness",
  axis: "radial",
  cycles: 1.5,
});

export function Example() {
  return (
    <div className="flex flex-col items-start gap-6">
      <output className="flex items-center gap-3 text-sm text-muted-foreground">
        <DotMatrix pattern="comet" />
        Thinking
      </output>
      <DotMatrix pattern="breathe" hueMap="sage" cols={8} rows={2} />
      <DotMatrix
        pattern={ring}
        hueMap={{ shape: "radial", base: 200, spread: 120, chroma: 0.12 }}
        shrinkWhenDim={0.4}
        cell={12}
      />
    </div>
  );
}
