import { useEffect, useRef, type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { drawMatrix, subscribe } from "./draw";
import { dotMatrixHues, type DotMatrixHueMap, type DotMatrixHueName } from "./hues";
import { dotMatrixPatterns, type DotMatrixPattern, type DotMatrixPatternName } from "./patterns";

export type DotMatrixProps = Omit<
  ComponentPropsWithoutRef<"canvas">,
  "children" | "width" | "height"
> & {
  // Keep a custom pattern's identity stable (module scope or useMemo): a new one re-runs setup.
  pattern?: DotMatrixPatternName | DotMatrixPattern;
  hueMap?: DotMatrixHueName | DotMatrixHueMap;
  cell?: number;
  cols?: number;
  rows?: number;
  gapRatio?: number;
  radiusRatio?: number;
  bevel?: boolean;
  bevelStrength?: number;
  dimFloor?: number;
  litPeak?: number;
  shrinkWhenDim?: number;
  hueDrift?: number;
  speed?: number;
  paused?: boolean;
};

export function DotMatrix({
  pattern = "flow",
  hueMap = "iris",
  cell = 9,
  cols = 14,
  rows = 3,
  gapRatio = 0.4,
  radiusRatio = 0.22,
  bevel = cell >= 6,
  bevelStrength = 1.4,
  dimFloor = 0.27,
  litPeak = 0.82,
  shrinkWhenDim = 0,
  hueDrift = 0,
  speed = 1,
  paused = false,
  className,
  style,
  ...props
}: DotMatrixProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const time = useRef(0);
  const lit = typeof pattern === "string" ? dotMatrixPatterns[pattern] : pattern;
  const { shape, base, spread, chroma } =
    typeof hueMap === "string" ? dotMatrixHues[hueMap] : hueMap;
  const gap = cell * gapRatio;
  const width = cols * cell + (cols - 1) * gap;
  const height = rows * cell + (rows - 1) * gap;

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    // Setting a canvas's size clears it, even when the size is the same.
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

    const hues = { shape, base, spread, chroma };
    const draw = (seconds: number) => {
      time.current = seconds;
      drawMatrix(context, {
        pattern: lit,
        hueMap: hues,
        time: seconds,
        cell,
        cols,
        rows,
        gap,
        dpr,
        bevel,
        bevelStrength,
        radiusRatio,
        dimFloor,
        litPeak,
        shrinkWhenDim,
        hueDrift,
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0.5 * lit.period);
      return;
    }
    draw(time.current);
    if (paused) return;

    const from = time.current;
    let start: number | undefined;
    return subscribe((seconds) => {
      start ??= seconds;
      draw(from + (seconds - start) * speed);
    });
  }, [
    lit,
    shape,
    base,
    spread,
    chroma,
    cell,
    cols,
    rows,
    gap,
    width,
    height,
    bevel,
    bevelStrength,
    radiusRatio,
    dimFloor,
    litPeak,
    shrinkWhenDim,
    hueDrift,
    speed,
    paused,
  ]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={
        {
          ...style,
          "--matrix-width": `${width}px`,
          "--matrix-aspect": `${width} / ${height}`,
        } as CSSProperties
      }
      className={cn("aspect-(--matrix-aspect) w-(--matrix-width)", className)}
      {...props}
    />
  );
}
