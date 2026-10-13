import type { TerminalRow } from "@/components/work/agent-terminal/agent-terminal";
import {
  frameAt,
  type ScriptedRow,
  type TerminalScript,
} from "@/components/work/agent-terminal/use-terminal-playback";

type Row =
  | (Exclude<TerminalRow, { kind: "prompt" }> & { at: number; pause?: number })
  | (Extract<TerminalRow, { kind: "prompt" }> & { at: number; typed: number; pause?: number });

const TIMING = {
  typeChar: 24,
  typeShare: 0.82,
  sendRest: 220,
  runLength: 30020,
  replayRest: 1600,
};

const PAUSE: Record<TerminalRow["kind"], number> = {
  prompt: 350,
  message: 650,
  skill: 350,
  command: 250,
  result: 0,
  note: 600,
};

const FIRST_PROMPT = "Put the iPhone in dark mode.";

const ROWS: readonly Row[] = [
  {
    at: 250,
    kind: "message",
    text: "I’ll use the mobile workflow and switch iPhone 17 to dark mode.",
  },
  { at: 700, kind: "skill", text: "agentsims" },
  { at: 1350, kind: "result", text: "Successfully loaded skill" },
  { at: 2200, kind: "command", text: 'xcrun simctl ui "iPhone 17" appearance dark' },
  { at: 2750, kind: "result", text: "Appearance changed to dark" },
  { at: 2950, kind: "command", text: 'agentsims observe -d "iPhone 17"' },
  { at: 3450, kind: "result", text: "Home Screen · dark appearance" },
  { at: 3650, kind: "message", text: "Changed iPhone 17 to dark mode." },
  { at: 4150, kind: "note", text: "Cooked for 4s" },
  {
    at: 5130,
    kind: "prompt",
    text: "Make the Home Screen icons Liquid Glass.",
    typed: 650,
  },
  { at: 5380, kind: "message", text: "I’ll use Clear." },
  { at: 5650, kind: "command", text: 'agentsims observe -d "iPhone 17"' },
  { at: 5950, kind: "result", text: "Home Screen ready" },
  {
    at: 6150,
    kind: "command",
    text: 'agentsims long-press "50%,70%" -d "iPhone 17" --duration 700',
  },
  { at: 7320, kind: "result", text: "Entered Home Screen edit mode" },
  { at: 7350, kind: "command", text: 'agentsims tap "Edit" -d "iPhone 17"' },
  { at: 8350, kind: "result", text: "Opened the appearance menu" },
  { at: 8900, kind: "command", text: 'agentsims tap "Customise" -d "iPhone 17"' },
  { at: 10600, kind: "result", text: "Opened Customise" },
  { at: 10800, kind: "command", text: 'agentsims tap "Clear" -d "iPhone 17"' },
  { at: 11900, kind: "result", text: "Selected Clear" },
  { at: 13100, kind: "command", text: 'agentsims tap "50%,45%" -d "iPhone 17"' },
  { at: 14220, kind: "result", text: "Closed Customise" },
  { at: 14300, kind: "message", text: "Changed the Home Screen icons to Clear." },
  { at: 14950, kind: "note", text: "Cooked for 10s" },
  {
    at: 16030,
    kind: "prompt",
    text: "Nah, I don’t like this. Make them Tinted instead.",
    typed: 800,
  },
  { at: 16280, kind: "message", text: "I’ll switch the icons from Clear to Tinted." },
  { at: 16600, kind: "command", text: 'agentsims observe -d "iPhone 17"' },
  { at: 16950, kind: "result", text: "Home Screen ready" },
  {
    at: 17350,
    kind: "command",
    text: 'agentsims long-press "50%,70%" -d "iPhone 17" --duration 700',
  },
  { at: 18900, kind: "result", text: "Entered Home Screen edit mode" },
  { at: 19100, kind: "command", text: 'agentsims tap "Edit" -d "iPhone 17"' },
  { at: 20500, kind: "result", text: "Opened the appearance menu" },
  { at: 21300, kind: "command", text: 'agentsims tap "Customise" -d "iPhone 17"' },
  { at: 22400, kind: "result", text: "Opened Customise" },
  { at: 22650, kind: "command", text: 'agentsims tap "Tinted" -d "iPhone 17"' },
  { at: 24000, kind: "result", text: "Selected Tinted" },
  { at: 26800, kind: "command", text: 'agentsims tap "50%,45%" -d "iPhone 17"' },
  { at: 27980, kind: "result", text: "Closed Customise" },
  {
    at: 28200,
    kind: "message",
    text: "Done. iPhone 17 is in dark mode with Tinted Home Screen icons.",
    pause: 850,
  },
  { at: 29250, kind: "note", text: "Cooked for 13s" },
];

const ACTIVITY = [
  { at: 0, label: "Simmering" },
  { at: 4150, label: "" },
  { at: 5130, label: "Glassmaking" },
  { at: 14950, label: "" },
  { at: 16030, label: "Simming" },
  { at: 29250, label: "" },
];

const SEND_AT = FIRST_PROMPT.length * TIMING.typeChar + TIMING.sendRest;

function onLoopClock(at: number) {
  const paused = ROWS.reduce(
    (sum, row) => (row.at < at ? sum + (row.pause ?? PAUSE[row.kind]) : sum),
    0,
  );
  return SEND_AT + at + paused;
}

function programOf(text: string) {
  return text.match(/^agentsims\s+\S+/)?.[0];
}

function scripted(row: Row): ScriptedRow {
  const at = onLoopClock(row.at);
  switch (row.kind) {
    case "prompt":
      return {
        kind: "prompt",
        text: row.text,
        at,
        typing: { from: at - row.typed, duration: row.typed * TIMING.typeShare },
      };
    case "command":
      return { kind: "command", text: row.text, program: programOf(row.text), at };
    default:
      return { kind: row.kind, text: row.text, at };
  }
}

export const SCRIPT: TerminalScript = {
  rows: [
    {
      kind: "prompt",
      text: FIRST_PROMPT,
      at: SEND_AT,
      typing: { from: 0, duration: FIRST_PROMPT.length * TIMING.typeChar },
    },
    ...ROWS.map(scripted),
  ],
  activity: ACTIVITY.map((entry) => ({ at: onLoopClock(entry.at), label: entry.label })),
  duration: onLoopClock(TIMING.runLength) + TIMING.replayRest,
};

export const STILL_FRAME = frameAt(SCRIPT, onLoopClock(24000));
