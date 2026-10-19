import { defineSound, getDestination, type SoundDefinition } from "@web-kits/audio";
import {
  collapse,
  copy,
  expand,
  keyPress,
  pageEnter,
  pageExit,
  success,
  tabSwitch,
  tap,
} from "@/lib/audio/minimal";

// A sound starts at the audio clock's current block, which can already be playing by then.
// These decay within milliseconds, so a late start clips each one by a different amount and
// the odd on-time one pops out loud. Starting a little ahead lets every one play in full.
const AHEAD = 0.03;

function ahead(definition: SoundDefinition): SoundDefinition {
  if ("layers" in definition) {
    return {
      ...definition,
      layers: definition.layers.map((layer) => ({ ...layer, delay: (layer.delay ?? 0) + AHEAD })),
    };
  }
  return { ...definition, delay: (definition.delay ?? 0) + AHEAD };
}

const sounds = {
  collapse: defineSound(ahead(collapse)),
  copy: defineSound(ahead(copy)),
  expand: defineSound(ahead(expand)),
  "key-press": defineSound(ahead(keyPress)),
  "page-enter": defineSound(ahead(pageEnter)),
  "page-exit": defineSound(ahead(pageExit)),
  success: defineSound(ahead(success)),
  "tab-switch": defineSound(ahead(tabSwitch)),
  tap: defineSound(ahead(tap)),
};

export type Sound = keyof typeof sounds;

// One action can reach play twice (closing plays page-exit, then so does its navigation).
let last: { sound: Sound; at: number } | undefined;
// Key presses repeat while scrubbing; ones that start together stack into a loud click.
let nextKeyPress = 0;
// A suspended context's clock stands still, so every sound played meanwhile would start at
// the same instant once it resumes, stacked into one loud burst. Those get dropped instead.
let clock = -1;

function audible() {
  const { context } = getDestination();
  if (context.state !== "running" || context.currentTime === clock) return false;
  clock = context.currentTime;
  return true;
}

/**
 * Unlocks audio; iOS only allows that during a tap. Resuming isn't always enough there: output
 * can stay muted until a sound starts inside the tap, so a silent one does.
 */
export function wake() {
  const { context } = getDestination();
  if (context.state === "running") return;
  const source = context.createBufferSource();
  source.buffer = context.createBuffer(1, 1, context.sampleRate);
  source.connect(context.destination);
  source.start();
}

/** Calls `ready` once sounds can play, and returns a function that stops waiting. */
export function onAudible(ready: () => void) {
  const { context } = getDestination();
  if (context.state === "running") {
    ready();
    return () => {};
  }
  const check = () => {
    if (context.state === "running") ready();
  };
  context.addEventListener("statechange", check);
  return () => context.removeEventListener("statechange", check);
}

export function play(sound: Sound) {
  const at = performance.now();
  if (sound === "key-press") {
    const start = Math.max(at, nextKeyPress);
    if (start - at > 90) return;
    nextKeyPress = start + 30;
    window.setTimeout(() => {
      if (audible()) sounds[sound]();
    }, start - at);
    return;
  }
  if (last?.sound === sound && at - last.at < 100) return;
  last = { sound, at };
  if (audible()) sounds[sound]();
}

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
