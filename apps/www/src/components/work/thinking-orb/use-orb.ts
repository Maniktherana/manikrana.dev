"use client";

import { useCallback, useEffect, useRef } from "react";
import { BUFFER_SIZE, acquirePainter, type Uniforms } from "./orb-renderer";

export type OrbVariant = "weave" | "search" | "focus";

export type OrbFrame = { time: number; search: number; focus: number };

export type OrbTick = { dt: number; blend: number; motionReduced: boolean };

export type OrbTuning<State extends string, Values> = { [Key in State]?: Partial<Values> };

type UseOrbOptions = {
  fragment: string;
  size: number;
  speed: number;
  variant: OrbVariant;
  brilliance: number;
  paused: boolean;
  pace?: () => number;
  step?: (tick: OrbTick) => void;
  uniforms: (frame: OrbFrame) => Uniforms;
};

export const START_TIME = 1.8;

export const clamp = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

export function stateBlend(dt: number, transition: number, motionReduced: boolean) {
  return motionReduced ? 1 : 1 - Math.exp((-dt * 7) / Math.max(0.05, transition));
}

export function settleToward<Values extends Record<string, number>>(
  current: Values,
  target: Values,
  blend: number,
) {
  for (const key in target) {
    const next = current[key] + (target[key] - current[key]) * blend;
    current[key] = (
      Math.abs(target[key] - next) < 0.00001 ? target[key] : next
    ) as Values[typeof key];
  }
}

export function useOrb(options: UseOrbOptions) {
  const { fragment, size, speed, variant, brilliance, paused } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef(options);
  const wakeRef = useRef(() => {});
  const wake = useCallback(() => wakeRef.current(), []);

  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    wake();
  }, [wake, size, speed, variant, brilliance, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const painter = acquirePainter(fragment);
    if (!painter) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let visible = true;
    let last = performance.now();
    const frame: OrbFrame = {
      time: START_TIME,
      search: latest.current.variant === "search" ? 1 : 0,
      focus: latest.current.variant === "focus" ? 1 : 0,
    };

    const draw = () => {
      const value = latest.current;
      const pixels = Math.round(
        clamp(value.size * Math.min(window.devicePixelRatio || 1, 2), 16, BUFFER_SIZE),
      );
      if (canvas.width !== pixels) canvas.width = canvas.height = pixels;
      painter.draw(context, pixels, {
        resolution: pixels,
        time: frame.time,
        // Always 1: folding the shaders' multiplications by it away can change how the GPU rounds.
        activity: 1,
        search: frame.search,
        focus: frame.focus,
        brilliance: clamp(value.brilliance, 0, 1),
        ...value.uniforms(frame),
      });
    };

    const tick = (now: number) => {
      frameId = 0;
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      const value = latest.current;
      if (!value.paused) {
        const blend = media.matches ? 1 : 1 - Math.exp(-dt * 12);
        frame.search += ((value.variant === "search" ? 1 : 0) - frame.search) * blend;
        frame.focus += ((value.variant === "focus" ? 1 : 0) - frame.focus) * blend;
        value.step?.({ dt, blend, motionReduced: media.matches });
        if (!media.matches) frame.time += dt * clamp(value.speed, 0.25, 3) * (value.pace?.() ?? 1);
      }
      draw();
      if (visible && !document.hidden && !value.paused && !media.matches)
        frameId = requestAnimationFrame(tick);
    };

    const wakeLoop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      if (!visible || document.hidden) return;
      last = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      wakeLoop();
    });
    observer.observe(canvas);
    wakeRef.current = wakeLoop;
    media.addEventListener("change", wakeLoop);
    document.addEventListener("visibilitychange", wakeLoop);
    draw();
    wakeLoop();
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      media.removeEventListener("change", wakeLoop);
      document.removeEventListener("visibilitychange", wakeLoop);
      wakeRef.current = () => {};
      painter.release();
    };
  }, [fragment]);

  return { canvasRef, wake };
}
