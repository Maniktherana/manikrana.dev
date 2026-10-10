import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { NOTE_MS, noteAnalyser } from "@/work/voice-edge/note-analyser";
import { voiceNote } from "@/work/voice-edge/voice-note";

/* ─────────────────────────────────────────────────────────
 * VOICE DEMO STORYBOARD
 *
 * Read top-to-bottom. Each ms value is time after the loop starts.
 * The edge sweeps (processing) while the microphone connects, then listens.
 * The voice note starts a second after it begins listening, so the sweep
 * settles into the listening glow on its own before anyone speaks, and the
 * glow settles again for two seconds after the note before the loop restarts.
 *
 *    0ms   blank: no words and no glow, just the buttons
 *  800ms   edge sweeps while the microphone connects
 * 4300ms   edge starts listening; the sweep settles into the listening glow
 * 5300ms   the voice note plays into the edge, each word appearing at its start
 *  + note  the note ends; the edge keeps listening to the room
 * + 2000ms back to blank, and the loop starts over
 *
 * Reduced motion shows the full transcript on a still screen.
 * ───────────────────────────────────────────────────────── */

export type Stage = "blank" | "connecting" | "listening" | "speaking";

const TIMING = {
  connecting: 800, // the edge sweeps for 3.5 seconds while it connects
  listening: 4300, // the edge listens; the sweep settles on its own
  speaking: 5300, // the voice note starts, a second into listening
  restart: 2000, // after the note ends, how long the glow settles before the loop restarts
};

// Loops the storyboard while `playing`, with one `stage`, the number of words
// `heard` so far, and the note's analyser while the edge listens.
export function useVoiceSequence(playing: boolean) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("blank");
  const [heard, setHeard] = useState(0);
  const [lap, setLap] = useState(0);
  const [analyser, setAnalyser] = useState<ReturnType<typeof noteAnalyser>>();

  useEffect(() => {
    setAnalyser(undefined);
    setHeard(0);
    setStage("blank");

    if (!playing) return undefined;

    if (reducedMotion) {
      setHeard(voiceNote.words.length);
      return undefined;
    }

    const timers: number[] = [];
    const after = (ms: number, step: () => void) => {
      timers.push(window.setTimeout(step, ms));
    };

    after(TIMING.connecting, () => setStage("connecting"));
    after(TIMING.listening, () => {
      setAnalyser(noteAnalyser(performance.now() + TIMING.speaking - TIMING.listening));
      setStage("listening");
    });
    after(TIMING.speaking, () => setStage("speaking"));
    voiceNote.words.forEach(({ start }, index) => {
      after(TIMING.speaking + start * 1000, () => setHeard(index + 1));
    });
    after(TIMING.speaking + NOTE_MS + TIMING.restart, () => setLap((current) => current + 1));

    return () => timers.forEach(window.clearTimeout);
  }, [lap, playing, reducedMotion]);

  return {
    active: stage === "listening" || stage === "speaking",
    analyser,
    heard,
    processing: stage === "connecting",
    speaking: stage === "speaking",
  };
}
