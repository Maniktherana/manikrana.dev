import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { NOTE_MS, noteAnalyser } from "@/work/voice-edge/note-analyser";
import { voiceNote } from "@/work/voice-edge/voice-note";

export type Stage = "blank" | "connecting" | "listening" | "speaking";

const TIMING = {
  connecting: 800,
  listening: 4300,
  speaking: 5300,
  restart: 2000,
};

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
