import { defineSound } from "@web-kits/audio";
import { copy, pageEnter, pageExit, success, tabSwitch, tap } from "@/lib/audio/minimal";

const sounds = {
  copy: defineSound(copy),
  "page-enter": defineSound(pageEnter),
  "page-exit": defineSound(pageExit),
  success: defineSound(success),
  "tab-switch": defineSound(tabSwitch),
  tap: defineSound(tap),
};

export type Sound = keyof typeof sounds;

// One action can reach play twice (closing plays page-exit, then so does its navigation).
let last: { sound: Sound; at: number } | undefined;

export function play(sound: Sound) {
  const at = performance.now();
  if (last?.sound === sound && at - last.at < 100) return;
  last = { sound, at };
  sounds[sound]();
}

// Work items and library entries open as their own pages over the home page.
const isEntry = (pathname: string) =>
  pathname.startsWith("/work/") || pathname.startsWith("/library/");

export function navigationSound(from: string, to: string): Sound | undefined {
  if (from === to) return;
  if (isEntry(from) && isEntry(to)) return "tab-switch";
  if (isEntry(to)) return "page-enter";
  if (isEntry(from)) return "page-exit";
}
