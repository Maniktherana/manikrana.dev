import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { NOTE_MS, noteAnalyser } from "@/components/work/voice-edge/note-analyser";

// voice-note.ts's analyser settings, at an assumed 48 kHz.
const FFT_SIZE = 256;
const SAMPLE_RATE = 48000;
const MIN_DB = -100;
const DB_RANGE = 70;
const LOOP_GAP_MS = 800;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function loudness(spectrum: Uint8Array) {
  let power = 0;
  for (const byte of spectrum) power += 10 ** ((MIN_DB + (DB_RANGE * byte) / 255) / 10);
  return clamp((10 * Math.log10(power) + 64) / 40, 0, 1);
}

function readBands(spectrum: Uint8Array, level: number) {
  const edges = [100, 350, 900, 2200, 6000];
  return edges.slice(0, -1).map((low, region) => {
    const start = Math.max(1, Math.floor((low * FFT_SIZE) / SAMPLE_RATE));
    const end = Math.min(spectrum.length, Math.ceil((edges[region + 1] * FFT_SIZE) / SAMPLE_RATE));
    let sum = 0;
    for (let i = start; i < end; i++) sum += (spectrum[i] / 255) ** 2;
    const magnitude = Math.sqrt(sum / Math.max(1, end - start));
    return clamp((magnitude - 0.18) * 2.2, 0, 1) * Math.min(1, level * 3);
  });
}

export type NoteAudio = ReturnType<typeof useNoteAudio>;

type Analyser = Pick<AnalyserNode, "frequencyBinCount" | "getByteFrequencyData">;

export function useNoteAudio(playing: boolean, loop = false, source?: Analyser) {
  const reducedMotion = useReducedMotion();
  const level = useRef(0);
  const bands = useRef([0, 0, 0, 0]);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;

    let startsAt = performance.now();
    let analyser = source ?? noteAnalyser(startsAt);
    const spectrum = new Uint8Array(analyser.frequencyBinCount);
    let peak = 0.4;
    let last = startsAt;
    let frame = 0;

    const sample = (now: number) => {
      const dt = clamp((now - last) / 1000, 0, 0.1);
      last = now;
      if (!source && loop && now - startsAt > NOTE_MS + LOOP_GAP_MS) {
        startsAt = now;
        analyser = noteAnalyser(startsAt);
      }
      analyser.getByteFrequencyData(spectrum);
      const raw = loudness(spectrum);
      peak = Math.max(raw, peak - dt * 0.15, 0.4);
      const gate = clamp((raw - 0.15) / 0.2, 0, 1);
      const smoothing = 1 - Math.exp(-dt / 0.12);
      level.current += (Math.min(1, (gate * raw) / peak) - level.current) * smoothing;
      const next = readBands(spectrum, level.current);
      bands.current = bands.current.map((band, i) => band + (next[i] - band) * smoothing);
      frame = requestAnimationFrame(sample);
    };
    frame = requestAnimationFrame(sample);

    return () => {
      cancelAnimationFrame(frame);
      level.current = 0;
      bands.current = [0, 0, 0, 0];
    };
  }, [playing, loop, source, reducedMotion]);

  return { level, bands };
}
