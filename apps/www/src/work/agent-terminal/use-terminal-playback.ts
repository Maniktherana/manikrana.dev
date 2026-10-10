import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TerminalFrame, TerminalRow } from "./agent-terminal";

export type ScriptedRow =
  | (Extract<TerminalRow, { kind: "prompt" }> & {
      at: number;
      typing?: { from: number; duration: number };
    })
  | (Exclude<TerminalRow, { kind: "prompt" }> & { at: number });

export type TerminalScript = {
  rows: readonly ScriptedRow[];
  activity: readonly { at: number; label: string }[];
  duration: number;
};

export function frameAt(script: TerminalScript, time: number): TerminalFrame {
  const rows = script.rows.filter((row) => row.at <= time);
  const activity = script.activity.filter((entry) => entry.at <= time).at(-1)?.label;

  let composer: TerminalFrame["composer"];
  for (const row of script.rows) {
    if (row.kind === "prompt" && row.typing && row.typing.from <= time && time < row.at) {
      composer = { text: row.text, duration: row.typing.duration };
      break;
    }
  }

  return { rows, activity: activity || undefined, composer };
}

function beatTimes(script: TerminalScript) {
  const times = [
    0,
    ...script.rows.flatMap((row) =>
      row.kind === "prompt" && row.typing ? [row.at, row.typing.from] : [row.at],
    ),
    ...script.activity.map((entry) => entry.at),
  ];
  return [...new Set(times)].sort((a, b) => a - b);
}

// `script` must keep its identity between renders.
export function useTerminalPlayback(
  script: TerminalScript,
  { playing = true, loop = true }: { playing?: boolean; loop?: boolean } = {},
) {
  const beats = useMemo(() => beatTimes(script), [script]);
  const [{ beat, lap }, setPosition] = useState({ beat: 0, lap: 0 });
  const clock = useRef(0);
  const reset = useRef(false);

  useEffect(() => {
    if (!playing) return;
    if (reset.current) {
      reset.current = false;
      clock.current = 0;
      setPosition((now) => ({ ...now, beat: 0 }));
    }

    const resumeAt = clock.current;
    const startedAt = performance.now();
    let restarted = false;

    const timers = beats.flatMap((at, index) =>
      at > resumeAt
        ? [window.setTimeout(() => setPosition((now) => ({ ...now, beat: index })), at - resumeAt)]
        : [],
    );
    if (loop) {
      timers.push(
        window.setTimeout(() => {
          restarted = true;
          clock.current = 0;
          setPosition((now) => ({ beat: 0, lap: now.lap + 1 }));
        }, script.duration - resumeAt),
      );
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      if (!restarted) clock.current = resumeAt + performance.now() - startedAt;
    };
  }, [playing, loop, beats, script.duration, lap]);

  // The effect's cleanup would overwrite clock.current, so the reset is applied by the effect.
  const replay = useCallback(() => {
    reset.current = true;
    setPosition((now) => ({ ...now, lap: now.lap + 1 }));
  }, []);

  const frame = useMemo(() => frameAt(script, beats[beat] ?? 0), [script, beats, beat]);
  return { frame, replay };
}
