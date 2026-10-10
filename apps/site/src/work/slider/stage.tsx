import { Slider } from "@/work/slider/slider";

// Each slider shows a different detail. A fine range marks every tenth, a
// coarse one marks every step, the value takes a typed number once you rest
// on it, and one that starts near the low end shows the thumb dimming under
// the label.
export function Stage() {
  return (
    <div className="flex size-full items-center justify-center px-6">
      <div className="grid w-full max-w-90 gap-3">
        <Slider defaultValue={[42]} label="Opacity" unit="%" />
        <Slider
          defaultValue={[6]}
          formatValue={(value) => `${value} cols`}
          label="Columns"
          max={12}
          min={2}
          step={2}
        />
        <Slider
          defaultValue={[320]}
          formatValue={(value) => `${Math.round(value)} ms`}
          label="Duration"
          max={1200}
          min={80}
          step={20}
        />
        <Slider
          defaultValue={[0.08]}
          formatValue={(value) => value.toFixed(2)}
          label="Noise floor"
          max={1}
          step={0.01}
        />
      </div>
    </div>
  );
}
