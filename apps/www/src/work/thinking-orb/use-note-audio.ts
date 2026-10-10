import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { NOTE_MS, noteAnalyser } from "@/work/voice-edge/note-analyser";

// The Gemini orb takes a level and four spectral bands, never a microphone. This is
// the pipeline that produces them, with the recorded voice note in place of a
// microphone: it reads the note through its analyser every frame, and writes
// the results into refs, so no frame re-renders React.
//
// The note's analyser is a 256-point FFT (128 bins) at a browser's usual
// 48 kHz, and it holds byte data between -100 and -30 dB.
const FFT_SIZE = 256;
const SAMPLE_RATE = 48000;
const MIN_DB = -100;
const DB_RANGE = 70;
const LOOP_GAP_MS = 800;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// How loud the room is, 0 to 1: every bin's power summed, in decibels. The
// room's floor sits near -60 dB and the note's loud words near -26 dB.
function loudness(spectrum: Uint8Array) {
  let power = 0;
  for (const byte of spectrum) power += 10 ** ((MIN_DB + (DB_RANGE * byte) / 255) / 10);
  return clamp((10 * Math.log10(power) + 64) / 40, 0, 1);
}

// Independent low-to-high FFT regions, never inferred from the volume.
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

// While `playing`, plays the voice note from its start into the `level` and
// `bands` refs, once, or over and over with `loop`. When it stops, both fall
// back to silence. Reduced motion never plays it: the orb holds still.
export function useNoteAudio(playing: boolean, loop = false) {
  const reducedMotion = useReducedMotion();
  const level = useRef(0);
  const bands = useRef([0, 0, 0, 0]);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;

    let startsAt = performance.now();
    let analyser = noteAnalyser(startsAt);
    const spectrum = new Uint8Array(analyser.frequencyBinCount);
    let peak = 0.4;
    let last = startsAt;
    let frame = 0;

    const sample = (now: number) => {
      const dt = clamp((now - last) / 1000, 0, 0.1);
      last = now;
      if (loop && now - startsAt > NOTE_MS + LOOP_GAP_MS) {
        startsAt = now;
        analyser = noteAnalyser(startsAt);
      }
      analyser.getByteFrequencyData(spectrum);
      const raw = loudness(spectrum);
      // Normalize to a slowly decaying recent peak, and gate the room's floor.
      peak = Math.max(raw, peak - dt * 0.15, 0.4);
      const gate = clamp((raw - 0.15) / 0.2, 0, 1);
      // About 120ms of smoothing matches the syllable-scale motion in the
      // Gemini Live reference.
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
  }, [playing, loop, reducedMotion]);

  return { level, bands };
}
