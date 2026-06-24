"use client";

import { useCallback, useEffect, useState } from "react";

type UseAutoPlayOptions = {
  active?: number;
  count: number;
  enabled?: boolean;
  loop?: boolean;
  onStepChange?: (value: number) => void;
  onValueChange?: (value: number) => void;
  stepDuration?: number;
  value?: number;
};

type UseAutoPlayReturn = {
  fillDuration: number;
  filling: boolean;
  pause: () => void;
  play: () => void;
  playing: boolean;
  toggle: () => void;
};

type UseStepperAutoPlayOptions = UseAutoPlayOptions;
type UseStepperAutoPlayReturn = UseAutoPlayReturn;

const DEFAULT_STEP_DURATION = 3000;

function clampStep(value: number, count: number) {
  if (!Number.isFinite(value) || count <= 0) return 0;

  return Math.min(Math.max(Math.trunc(value), 0), count - 1);
}

function normalizeCount(count: number) {
  if (!Number.isFinite(count)) return 0;

  return Math.max(0, Math.trunc(count));
}

function useAutoPlay({
  active,
  count,
  enabled = true,
  loop = true,
  onStepChange,
  onValueChange,
  stepDuration = DEFAULT_STEP_DURATION,
  value,
}: UseAutoPlayOptions): UseAutoPlayReturn {
  const [playing, setPlaying] = useState(false);
  const safeCount = normalizeCount(count);
  const currentValue = clampStep(value ?? active ?? 0, safeCount);
  const setValue = onStepChange ?? onValueChange;

  const pause = useCallback(() => setPlaying(false), []);
  const play = useCallback(() => setPlaying(true), []);
  const toggle = useCallback(() => setPlaying((current) => !current), []);

  useEffect(() => {
    if (enabled) return;

    setPlaying(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !playing || safeCount <= 1 || !setValue) return undefined;

    const timer = window.setTimeout(() => {
      const next = currentValue < safeCount - 1 ? currentValue + 1 : loop ? 0 : undefined;

      if (next === undefined) {
        setPlaying(false);
        return;
      }

      setValue(next);
    }, stepDuration);

    return () => window.clearTimeout(timer);
  }, [currentValue, enabled, loop, playing, safeCount, setValue, stepDuration]);

  const isPlaying = enabled && playing;

  return {
    fillDuration: stepDuration,
    filling: isPlaying,
    pause,
    play,
    playing: isPlaying,
    toggle,
  };
}

const useStepperAutoPlay = useAutoPlay;

export {
  useAutoPlay,
  useStepperAutoPlay,
  type UseAutoPlayOptions,
  type UseAutoPlayReturn,
  type UseStepperAutoPlayOptions,
  type UseStepperAutoPlayReturn,
};
