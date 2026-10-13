import { defineSound } from "@web-kits/audio";
import { copy, pageEnter, pageExit, success, tabSwitch, tap } from "@/lib/audio/minimal";
import { findWork } from "@/components/work/registry";

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

const isWork = (pathname: string) => findWork(pathname.slice(1)) !== undefined;

export function navigationSound(from: string, to: string): Sound | undefined {
  if (from === to) return;
  if (isWork(from) && isWork(to)) return "tab-switch";
  if (isWork(to)) return "page-enter";
  if (isWork(from)) return "page-exit";
}
