"use client";

import * as React from "react";

import { cn } from "@manikrana/ui/lib/utils";
import type { VoiceEdgePalette, VoiceEdgePaletteName } from "./palettes";
import {
  MIC_MIN_PEAK,
  buildStaticAudioBins,
  defaultAudioResponseCurve,
  trackAmbient,
  type VoiceEdgeResponseCurve,
} from "./audio-response";
import {
  createVoiceEdgeShader,
  emptyAudioBins,
  resolveAudioPalette,
  syncAudioBorderClip,
  type AudioBorderGeometryInput,
  type VoiceEdgeController,
  type VoiceEdgeSide,
} from "./shader";

type VoiceEdgeAnalyser = Pick<AnalyserNode, "frequencyBinCount" | "getByteFrequencyData">;

type VoiceEdgeProps = Omit<React.ComponentProps<"div">, "children"> & {
  active?: boolean;
  analyser?: VoiceEdgeAnalyser;
  borderBrightness?: number;
  borderRadius?: number;
  borderWidth?: number;
  children: React.ReactNode;
  deviceId?: string;
  fftSize?: number;
  idleLevel?: number;
  innerGlowBrightness?: number;
  innerGlowHeight?: number;
  noiseFloor?: number;
  onError?: (error: Error) => void;
  onStreamEnd?: () => void;
  onStreamReady?: (stream: MediaStream) => void;
  palette?: VoiceEdgePaletteName | VoiceEdgePalette;
  processing?: boolean;
  responseCurve?: VoiceEdgeResponseCurve;
  sensitivity?: number;
  side?: VoiceEdgeSide;
  smoothingTimeConstant?: number;
  updateRate?: number;
};

function VoiceEdge({
  active = false,
  analyser,
  borderBrightness = 1,
  borderRadius,
  borderWidth = 1,
  children,
  className,
  deviceId,
  fftSize = 256,
  idleLevel = 0.015,
  innerGlowBrightness = 1,
  innerGlowHeight = 1,
  noiseFloor = 0.08,
  onError,
  onStreamEnd,
  onStreamReady,
  palette = "spectrum",
  processing = false,
  ref,
  responseCurve = defaultAudioResponseCurve,
  sensitivity = 0.9,
  side = "bottom",
  smoothingTimeConstant = 0.8,
  style,
  updateRate = 16,
  ...props
}: VoiceEdgeProps) {
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const ambientRef = React.useRef<Float32Array | null>(null);
  const analyserRef = React.useRef<VoiceEdgeAnalyser | null>(null);
  const canvasHostRef = React.useRef<HTMLSpanElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const controllerRef = React.useRef<VoiceEdgeController | null>(null);
  const lastUpdateRef = React.useRef(0);
  const peakRef = React.useRef(MIC_MIN_PEAK);
  const rafRef = React.useRef(0);
  const streamRef = React.useRef<MediaStream | null>(null);
  const callbacksRef = React.useRef({ onError, onStreamEnd, onStreamReady });
  const audioParamsRef = React.useRef({
    noiseFloor,
    responseCurve,
    sensitivity,
  });
  const captureActive = active && !processing;
  const geometryInputRef = React.useRef<AudioBorderGeometryInput>({
    borderRadius,
    borderWidth,
  });
  const shaderOptionsRef = React.useRef({
    active: captureActive,
    borderBrightness,
    idleLevel,
    innerGlowBrightness,
    innerGlowHeight,
    palette,
    processing,
    side,
  });

  geometryInputRef.current = {
    borderRadius,
    borderWidth,
  };
  shaderOptionsRef.current = {
    active: captureActive,
    borderBrightness,
    idleLevel,
    innerGlowBrightness,
    innerGlowHeight,
    palette,
    processing,
    side,
  };
  callbacksRef.current = { onError, onStreamEnd, onStreamReady };
  audioParamsRef.current = {
    noiseFloor,
    responseCurve,
    sensitivity,
  };

  React.useEffect(() => {
    const controller = controllerRef.current;

    if (!controller) return;

    controller.setActive(captureActive);
    controller.setBorderBrightness(borderBrightness);
    controller.setIdleLevel(idleLevel);
    controller.setInnerGlowBrightness(innerGlowBrightness);
    controller.setInnerGlowHeight(innerGlowHeight);
    controller.setPalette(resolveAudioPalette(palette));
    controller.setProcessing(processing);
    controller.setSide(side);
  }, [
    borderBrightness,
    captureActive,
    idleLevel,
    innerGlowBrightness,
    innerGlowHeight,
    palette,
    processing,
    side,
  ]);

  React.useEffect(() => {
    const container = containerRef.current;
    const host = canvasHostRef.current;

    if (!container || !host) return undefined;

    const target = container.firstElementChild;

    if (!(target instanceof HTMLElement)) return undefined;

    const canvas = document.createElement("canvas");

    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "pointer-events-none absolute inset-0 block size-full";

    syncAudioBorderClip(host, target, geometryInputRef.current);
    host.appendChild(canvas);

    const controller = createVoiceEdgeShader(
      canvas,
      target,
      geometryInputRef,
      shaderOptionsRef.current,
    );

    if (!controller) {
      canvas.remove();
      return undefined;
    }

    controllerRef.current = controller;

    return () => {
      controller.destroy();
      controllerRef.current = null;
      canvas.remove();
    };
  }, []);

  React.useEffect(() => {
    if (captureActive || processing) return;

    controllerRef.current?.setAudioBins(emptyAudioBins);
  }, [captureActive, processing]);

  React.useEffect(() => {
    const host = canvasHostRef.current;
    const target = containerRef.current?.firstElementChild;

    if (!host || !(target instanceof HTMLElement)) return;

    syncAudioBorderClip(host, target, geometryInputRef.current);
  });

  React.useEffect(() => {
    if (!captureActive) {
      controllerRef.current?.setActive(false);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      peakRef.current = MIC_MIN_PEAK;
      ambientRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        callbacksRef.current.onStreamEnd?.();
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
      return undefined;
    }

    let cancelled = false;

    const updateAudio = (currentTime: number) => {
      if (cancelled) return;

      const analyserNode = analyserRef.current;

      if (analyserNode && currentTime - lastUpdateRef.current > updateRate) {
        lastUpdateRef.current = currentTime;

        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        const audioParams = audioParamsRef.current;

        analyserNode.getByteFrequencyData(dataArray);
        if (!analyser) ambientRef.current = trackAmbient(dataArray, ambientRef.current);
        const frame = buildStaticAudioBins(
          dataArray,
          audioParams.sensitivity,
          audioParams.noiseFloor,
          audioParams.responseCurve,
          peakRef.current,
          ambientRef.current ?? undefined,
        );

        peakRef.current = frame.peak;
        controllerRef.current?.setAudioBins(frame.bins);
      }

      rafRef.current = window.requestAnimationFrame(updateAudio);
    };

    const setupMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId
            ? {
                autoGainControl: false,
                deviceId: { exact: deviceId },
                echoCancellation: false,
                noiseSuppression: false,
              }
            : {
                autoGainControl: false,
                echoCancellation: false,
                noiseSuppression: false,
              },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        callbacksRef.current.onStreamReady?.(stream);

        const AudioContextConstructor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextConstructor();
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        controllerRef.current?.setActive(true);

        rafRef.current = window.requestAnimationFrame(updateAudio);
      } catch (error) {
        callbacksRef.current.onError?.(error as Error);
      }
    };

    if (analyser) {
      analyserRef.current = analyser;
      controllerRef.current?.setActive(true);
      rafRef.current = window.requestAnimationFrame(updateAudio);
    } else {
      setupMicrophone();
    }

    return () => {
      cancelled = true;

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      peakRef.current = MIC_MIN_PEAK;
      ambientRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        callbacksRef.current.onStreamEnd?.();
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
    };
  }, [analyser, captureActive, deviceId, fftSize, smoothingTimeConstant, updateRate]);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  return (
    <div
      {...props}
      data-slot="voice-edge"
      ref={setRefs}
      className={cn("relative isolate inline-block overflow-hidden", className)}
      style={style}
    >
      {children}
      <span
        aria-hidden="true"
        ref={canvasHostRef}
        className="pointer-events-none absolute inset-0 z-20 block overflow-hidden"
      />
    </div>
  );
}

export { VoiceEdge };
export type { VoiceEdgeAnalyser, VoiceEdgeProps, VoiceEdgeResponseCurve, VoiceEdgeSide };
export type { VoiceEdgeResponseCurvePoint } from "./audio-response";
export type { VoiceEdgePalette, VoiceEdgePaletteName } from "./palettes";
