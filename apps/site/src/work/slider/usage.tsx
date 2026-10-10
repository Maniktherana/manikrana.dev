import { useState } from "react";
import { Slider } from "./slider";

export function Example() {
  const [saved, setSaved] = useState<number | null>(null);

  return (
    <div className="grid w-80 gap-3">
      <Slider
        defaultValue={[42]}
        label="Opacity"
        unit="%"
        onValueCommit={([value]) => setSaved(value)}
      />
      {saved !== null && <p className="text-sm text-muted-foreground">Saved {saved}%</p>}
    </div>
  );
}
