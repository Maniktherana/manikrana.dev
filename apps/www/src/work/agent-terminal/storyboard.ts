/* ─────────────────────────────────────────────────────────
 * AGENT TERMINAL STORYBOARD
 *
 * The Claude Code terminal from the agentsims.dev landing page, without the
 * phone it drives. Read top-to-bottom; each time is ms after the loop starts.
 * They are the times you watch: the agent's clock stands still for a beat after
 * most rows (PAUSE), so they run later than the raw `at` values in ROWS.
 *
 *     0ms   composer types "Put the iPhone in dark mode." (24ms a character)
 *   892ms   prompt sent, moves into the transcript; "Simmering" starts to shimmer
 *  1142ms   agent: "I’ll use the mobile workflow and switch iPhone 17 to dark mode."
 *  2242ms   Skill(agentsims)
 *  3242ms   ⎿ Successfully loaded skill
 *  4092ms   Bash(xcrun simctl ui "iPhone 17" appearance dark)
 *  4892ms   ⎿ Appearance changed to dark
 *  5092ms   Bash(agentsims observe -d "iPhone 17")
 *  5842ms   ⎿ Home Screen · dark appearance
 *  6042ms   agent: "Changed iPhone 17 to dark mode."
 *  7192ms   * Cooked for 4s; spinner clears
 *  8122ms   composer types "Make the Home Screen icons Liquid Glass."
 *  8772ms   you: "Make the Home Screen icons Liquid Glass."; spinner: "Glassmaking"
 *  9372ms   agent: "I’ll use Clear."
 * 10292ms   Bash(agentsims observe -d "iPhone 17")
 * 10842ms   ⎿ Home Screen ready
 * 11042ms   Bash(agentsims long-press "50%,70%" -d "iPhone 17" --duration 700)
 * 12462ms   ⎿ Entered Home Screen edit mode
 * 12492ms   Bash(agentsims tap "Edit" -d "iPhone 17")
 * 13742ms   ⎿ Opened the appearance menu
 * 14292ms   Bash(agentsims tap "Customise" -d "iPhone 17")
 * 16242ms   ⎿ Opened Customise
 * 16442ms   Bash(agentsims tap "Clear" -d "iPhone 17")
 * 17792ms   ⎿ Selected Clear
 * 18992ms   Bash(agentsims tap "50%,45%" -d "iPhone 17")
 * 20362ms   ⎿ Closed Customise
 * 20442ms   agent: "Changed the Home Screen icons to Clear."
 * 21742ms   * Cooked for 10s; spinner clears
 * 22622ms   composer types "Nah, I don’t like this. Make them Tinted instead."
 * 23422ms   you: "Nah, I don’t like this. Make them Tinted instead."; spinner: "Simming"
 * 24022ms   agent: "I’ll switch the icons from Clear to Tinted."
 * 24992ms   Bash(agentsims observe -d "iPhone 17")
 * 25592ms   ⎿ Home Screen ready
 * 25992ms   Bash(agentsims long-press "50%,70%" -d "iPhone 17" --duration 700)
 * 27792ms   ⎿ Entered Home Screen edit mode
 * 27992ms   Bash(agentsims tap "Edit" -d "iPhone 17")
 * 29642ms   ⎿ Opened the appearance menu
 * 30442ms   Bash(agentsims tap "Customise" -d "iPhone 17")
 * 31792ms   ⎿ Opened Customise
 * 32042ms   Bash(agentsims tap "Tinted" -d "iPhone 17")
 * 33642ms   ⎿ Selected Tinted
 * 36442ms   Bash(agentsims tap "50%,45%" -d "iPhone 17")
 * 37872ms   ⎿ Closed Customise
 * 38092ms   agent: "Done. iPhone 17 is in dark mode with Tinted Home Screen icons."
 * 39992ms   * Cooked for 13s; spinner clears
 * 41362ms   run ends; the finished transcript holds
 * 42962ms   loop restarts from the empty terminal
 * ───────────────────────────────────────────────────────── */

import type { TerminalRow } from "@/work/agent-terminal/agent-terminal";
import {
  frameAt,
  type ScriptedRow,
  type TerminalScript,
} from "@/work/agent-terminal/use-terminal-playback";

// `at` is on the agent's own clock, in ms after the first prompt is sent. A
// `prompt` row also says how long that prompt takes to type in the composer
// (`typed`), which ends the moment the row lands in the transcript. `pause`
// replaces the kind's PAUSE for one row.
type Row =
  | (Exclude<TerminalRow, { kind: "prompt" }> & { at: number; pause?: number })
  | (Extract<TerminalRow, { kind: "prompt" }> & { at: number; typed: number; pause?: number });

const TIMING = {
  typeChar: 24, // typing the first prompt: ms per character
  typeShare: 0.82, // of a follow-up's window spent typing; the rest rests before sending
  sendRest: 220, // the typed prompt rests in the composer before it is sent
  runLength: 30020, // the agent's whole run, on its own clock
  replayRest: 1600, // the finished transcript holds this long, then the loop restarts
};

// The agent's clock stands still for this long after a row of each kind lands,
// so a new line gets a beat to be read before the next one arrives.
const PAUSE: Record<TerminalRow["kind"], number> = {
  prompt: 350,
  message: 650, // a streamed sentence, so its words finish first
  skill: 350,
  command: 250,
  result: 0, // results ride in right behind their command
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
    pause: 850, // the final answer
  },
  { at: 29250, kind: "note", text: "Cooked for 13s" },
];

// The line above the composer: a shimmering word while the agent works, empty
// while it is done. Also on the agent's own clock.
const ACTIVITY = [
  { at: 0, label: "Simmering" },
  { at: 4150, label: "" },
  { at: 5130, label: "Glassmaking" },
  { at: 14950, label: "" },
  { at: 16030, label: "Simming" },
  { at: 29250, label: "" },
];

/* ── Derived: the schedule you actually watch ─────────────── */

// The first prompt is typed, rests, and is sent; the agent's clock starts there.
const SEND_AT = FIRST_PROMPT.length * TIMING.typeChar + TIMING.sendRest;

// Where the loop's clock stands when the agent's clock reads `at`: the agent
// starts at SEND_AT and loses time for the pause after every earlier row.
function onLoopClock(at: number) {
  const paused = ROWS.reduce(
    (sum, row) => (row.at < at ? sum + (row.pause ?? PAUSE[row.kind]) : sum),
    0,
  );
  return SEND_AT + at + paused;
}

// The part of a command set in bold, so "agentsims tap" stands out from its
// arguments.
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
  // The run ends, holds for a beat, and the loop starts over.
  duration: onLoopClock(TIMING.runLength) + TIMING.replayRest,
};

// Reduced motion shows one frame: just after the second request's last tap.
export const STILL_FRAME = frameAt(SCRIPT, onLoopClock(24000));
