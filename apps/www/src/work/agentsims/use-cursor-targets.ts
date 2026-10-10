import { useLayoutEffect, useState, type RefObject } from "react";
import type { DemoFrame, DemoPlayback, PointerTarget } from "@/work/agentsims/storyboard";

export type CursorPoint = { x: number; y: number };

const ORIGIN: CursorPoint = { x: 0, y: 0 };

// Measures where the cursor points in each frame, relative to the scene, and
// the scene's scale against its 480-unit design width (0 until measured).
export function useCursorTargets(
  sceneRef: RefObject<HTMLDivElement | null>,
  frame: DemoFrame,
  phase: DemoPlayback["phase"],
) {
  const [sceneScale, setSceneScale] = useState(0);
  const [targets, setTargets] = useState<Record<PointerTarget, CursorPoint>>({
    start: ORIGIN,
    dock: ORIGIN,
    device: ORIGIN,
    shutdown: ORIGIN,
  });
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const measure = () => {
      const bounds = scene.getBoundingClientRect();
      const pointerScale = bounds.width / 480;
      setSceneScale(pointerScale);
      const dock = scene.querySelector("[data-dock-toggle]")?.getBoundingClientRect();
      const pixelRow = scene.querySelector('[data-device="pixel"]');
      const row = pixelRow?.getBoundingClientRect();
      const power = pixelRow?.querySelector("[data-power]")?.getBoundingClientRect();
      // The cursor's tip is inset 3.58 units in its 24-unit viewBox.
      const tip = 3.58 * pointerScale;
      const pointAt = (rect: DOMRect, across: number) => ({
        x: rect.x + rect.width * across - bounds.x - tip,
        y: rect.y + rect.height / 2 - bounds.y - tip,
      });
      setTargets((previous) => {
        const next = {
          start: { x: bounds.width * 0.72, y: bounds.height * 0.57 },
          dock: dock ? pointAt(dock, 0.5) : previous.dock,
          device:
            row && phase === "boot" && frame.android === "available"
              ? pointAt(row, 0.6)
              : previous.device,
          shutdown:
            power && phase === "shutdown" && frame.android === "streaming"
              ? pointAt(power, 0.5)
              : previous.shutdown,
        };
        let changed = false;
        for (const key of Object.keys(next) as PointerTarget[]) {
          // Dock layout can drift by a fraction of a pixel while opening.
          // Replaying an arc for that drift still applies its full rotation.
          if (Math.hypot(next[key].x - previous[key].x, next[key].y - previous[key].y) < 1) {
            next[key] = previous[key];
          } else {
            changed = true;
          }
        }
        return changed ? next : previous;
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scene);
    const surface = scene.querySelector("[data-dock-surface]");
    if (surface) observer.observe(surface);
    return () => observer.disconnect();
  }, [sceneRef, sceneScale, frame, phase]);

  return { sceneScale, target: targets[frame.pointer ?? "start"] };
}
