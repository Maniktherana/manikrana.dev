"use client";

import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Gust, type GustProps } from "@maniktherana/gust";
import { cn } from "@manikrana/ui/lib/utils";
import { CheckIcon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/work/gust/use-prefers-reduced-motion";

type Motion = Omit<GustProps, "value">;

export const downloadMotion: Motion = {
  duration: 320,
  exitDuration: 320,
  stagger: 20,
  enterAngle: -90,
  exitAngle: -90,
  entranceOvershoot: 8,
  entranceHeight: 100,
  exitHeight: 90,
  blur: true,
  exitBlur: 4,
  entranceScale: 1.1,
  exitScale: 0.4,
  scale: true,
  preservePrefix: true,
};

export const downloadNumberMotion: Motion = {
  ...downloadMotion,
  entranceOvershoot: 0,
  stagger: 0,
};

const reducedMotionOverrides: Motion = {
  duration: 120,
  exitDuration: 80,
  stagger: 0,
  entranceOvershoot: 0,
  entranceHeight: 0,
  exitHeight: 0,
  blur: false,
  exitBlur: 0,
  scale: false,
};

const downloadSteps = 40;
const transferInterval = 125;
const restartDelay = 1000;

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

type DownloadState = {
  phase: "idle" | "downloading" | "complete";
  steps: number;
  touched: boolean;
};

const layer =
  "col-start-1 row-start-1 size-5 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:scale-100 motion-reduce:filter-none motion-reduce:transition-opacity motion-reduce:duration-120 motion-reduce:ease-[ease]";
const layerShown = "scale-100 opacity-100 blur-none";
const layerHidden = "scale-25 opacity-0 blur-xs";

function DownloadStateIcon({
  phase,
  running,
}: {
  phase: DownloadState["phase"];
  running: boolean;
}) {
  const arrowClipId = `${useId().replace(/:/g, "")}-download-arrow`;
  const complete = phase === "complete";

  return (
    <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center overflow-visible">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        className={cn(layer, "overflow-visible", complete ? layerHidden : layerShown)}
      >
        <defs>
          <clipPath id={arrowClipId}>
            <rect width={24} height={21} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${arrowClipId})`}>
          <g
            className={cn(
              "motion-reduce:transform-none motion-reduce:animate-none",
              phase !== "idle" &&
                (running
                  ? "animate-[gust-download-fall_1100ms_linear_infinite]"
                  : "animate-[gust-download-fall_1100ms_linear_infinite_paused]"),
            )}
          >
            <path d="M12 15V3" />
            <path d="m7 10 5 5 5-5" />
          </g>
        </g>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      </svg>
      <CheckIcon focusable="false" className={cn(layer, complete ? layerShown : layerHidden)} />
    </span>
  );
}

export function DownloadExample({
  paused = false,
  motion = downloadMotion,
  numberMotion = downloadNumberMotion,
}: {
  paused?: boolean;
  motion?: Motion;
  numberMotion?: Motion;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const hidden = useSyncExternalStore(
    subscribeToVisibility,
    () => document.hidden,
    () => false,
  );
  const [state, setState] = useState<DownloadState>({
    phase: "idle",
    steps: 0,
    touched: false,
  });
  const autoplayPaused = reducedMotion && !state.touched;
  const downloading = state.phase === "downloading" && !autoplayPaused;
  const percent = Math.round((state.steps / downloadSteps) * 100);
  const labelMotion = reducedMotion ? { ...motion, ...reducedMotionOverrides } : motion;
  const progressMotion = reducedMotion
    ? { ...numberMotion, ...reducedMotionOverrides }
    : numberMotion;
  const label =
    state.phase === "complete" ? "Downloaded" : state.phase === "idle" ? "Download" : "Downloading";
  const action =
    state.phase === "complete" ? "Download again" : downloading ? "Downloading" : "Download";

  useEffect(() => {
    if (paused || hidden || autoplayPaused || state.touched || state.phase !== "idle")
      return undefined;

    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, phase: "downloading" }));
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [autoplayPaused, hidden, paused, state.phase, state.touched]);

  useEffect(() => {
    if (paused || hidden || autoplayPaused || state.phase !== "downloading") return undefined;

    const timer = window.setInterval(() => {
      setState((current) => {
        if (current.phase !== "downloading") return current;
        const steps = Math.min(downloadSteps, current.steps + 1);
        return {
          ...current,
          steps,
          phase: steps === downloadSteps ? "complete" : "downloading",
        };
      });
    }, transferInterval);
    return () => window.clearInterval(timer);
  }, [autoplayPaused, hidden, paused, state.phase]);

  useEffect(() => {
    if (paused || hidden || reducedMotion || state.phase !== "complete") return undefined;

    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, phase: "downloading", steps: 0 }));
    }, restartDelay);
    return () => window.clearTimeout(timer);
  }, [hidden, paused, reducedMotion, state.phase]);

  const controlDownload = () => {
    setState((current) => {
      if (current.phase === "downloading" && !(reducedMotion && !current.touched)) return current;
      return { phase: "downloading", steps: 0, touched: true };
    });
  };

  return (
    <button
      type="button"
      onClick={controlDownload}
      disabled={downloading}
      aria-label={state.phase === "idle" ? action : `${action}, ${percent}% downloaded`}
      title={action}
      className="relative flex h-12 w-64 max-w-full items-center justify-between gap-3 overflow-visible rounded-xl bg-foreground/5 px-4 text-sm font-medium ring-1 ring-foreground/10 transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] enabled:hover:bg-foreground/10 enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground/50 disabled:cursor-default motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
      >
        <span
          className={cn(
            "block h-full w-full origin-left scale-x-(--progress) bg-foreground/10 transition-[scale] duration-(--interval) ease-linear",
            (reducedMotion || state.steps === 0) && "transition-none",
          )}
          style={
            {
              "--progress": state.steps / downloadSteps,
              "--interval": `${transferInterval}ms`,
            } as CSSProperties
          }
        />
      </span>
      <span className="relative flex min-w-0 items-center gap-2">
        <DownloadStateIcon
          phase={state.phase}
          running={downloading && !paused && !hidden && !reducedMotion}
        />
        <span className="inline-flex h-6 items-center">
          <Gust value={label} {...labelMotion} />
        </span>
      </span>
      {state.phase !== "idle" ? (
        <span className="relative flex shrink-0 items-center tabular-nums">
          <span className="inline-flex w-[3ch] justify-end">
            <Gust value={String(percent)} {...progressMotion} />
          </span>
          <span>%</span>
        </span>
      ) : null}
    </button>
  );
}
