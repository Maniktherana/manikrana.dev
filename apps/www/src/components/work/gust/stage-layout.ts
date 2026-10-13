export type Size = { height: number; width: number };
export type Placement = { scale: number; x: number; y: number };
export type Camera = { x: number; y: number; zoom: number };

export const STAGE_SPRING = 24;

export function springStep(
  value: number,
  velocity: number,
  target: number,
  dt: number,
  omega = STAGE_SPRING,
) {
  const offset = value - target;
  const rate = velocity + omega * offset;
  const decay = Math.exp(-omega * dt);
  return [
    target + (offset + rate * dt) * decay,
    (rate - omega * (offset + rate * dt)) * decay,
  ] as const;
}

function stageInsets(frame: Size) {
  const x = Math.min(96, Math.max(16, frame.width * 0.06));
  const y = Math.min(112, Math.max(72, frame.height * 0.1));
  return { x, y };
}

export function layoutGrid({
  count,
  frame,
  gap,
  size,
}: {
  count: number;
  frame: Size;
  gap: number;
  size: Size;
}) {
  const fit = (columns: number) => {
    const rows = count / columns;
    const width = (frame.width - (columns + 1) * gap) / columns;
    const height = (frame.height - (rows + 1) * gap) / rows;
    return { columns, height, scale: Math.min(width / size.width, height / size.height), width };
  };
  let best = fit(1);
  for (let columns = 2; columns <= count; columns += 1) {
    if (count % columns) continue;
    const next = fit(columns);
    if (next.scale > best.scale) best = next;
  }
  const { columns, height, scale, width } = best;
  const rows = Array.from({ length: count / columns }, (_, row) =>
    Array.from({ length: columns }, (_, column) => row * columns + column),
  );
  const placements: Placement[] = rows.flatMap((row, rowIndex) =>
    row.map((_, column) => ({
      scale,
      x: gap + column * (width + gap),
      y: gap + rowIndex * (height + gap),
    })),
  );
  return { card: { height: height / scale, width: width / scale }, placements, rows };
}

export function focusCamera(
  placement: Placement,
  size: Size,
  frame: Size,
  maxScale = Number.POSITIVE_INFINITY,
): Camera {
  const insets = stageInsets(frame);
  const scale = Math.min(
    maxScale,
    (frame.width - 2 * insets.x) / size.width,
    (frame.height - 2 * insets.y) / size.height,
  );
  return {
    x: placement.x + (size.width * placement.scale) / 2,
    y: placement.y + (size.height * placement.scale) / 2,
    zoom: Math.max(1, scale / placement.scale),
  };
}
