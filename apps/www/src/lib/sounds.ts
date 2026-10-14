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

// Pages stack over the home page: the work index over home, and a work item or library entry over both.
const isEntry = (pathname: string) =>
  pathname.startsWith("/work/") || pathname.startsWith("/library/");
const depthOf = (pathname: string) => (pathname === "/" ? 0 : isEntry(pathname) ? 2 : 1);

export function navigationSound(from: string, to: string): Sound | undefined {
  if (from === to) return;
  if (isEntry(from) && isEntry(to)) return "tab-switch";
  const [here, there] = [depthOf(from), depthOf(to)];
  if (there > here) return "page-enter";
  if (there < here) return "page-exit";
}
