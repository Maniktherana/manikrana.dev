import { useEffect, useRef, useState } from "react";

// The same analyser settings the voice note was recorded with.
const FFT_SIZE = 256;
const SMOOTHING = 0.8;
const MIN_DB = -100;
const MAX_DB = -30;

export function useMicrophone(enabled: boolean, onError: () => void) {
  const [analyser, setAnalyser] = useState<AnalyserNode>();
  const failed = useRef(onError);

  useEffect(() => {
    failed.current = onError;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let stream: MediaStream | undefined;
    let context: AudioContext | undefined;

    navigator.mediaDevices
      .getUserMedia({
        audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false },
      })
      .then((media) => {
        if (cancelled) return media.getTracks().forEach((track) => track.stop());
        stream = media;
        context = new AudioContext();
        const node = context.createAnalyser();
        node.fftSize = FFT_SIZE;
        node.smoothingTimeConstant = SMOOTHING;
        node.minDecibels = MIN_DB;
        node.maxDecibels = MAX_DB;
        context.createMediaStreamSource(media).connect(node);
        setAnalyser(node);
      })
      .catch(() => {
        if (!cancelled) failed.current();
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      void context?.close();
      setAnalyser(undefined);
    };
  }, [enabled]);

  return analyser;
}
