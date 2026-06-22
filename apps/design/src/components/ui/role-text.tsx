"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// RoleText is a dependency-free port of RoleMotion. It reproduces the exact same
// animation without `motion/react`: motion's per-property variant timing is
// sampled into Web Animations API keyframes, and the prefix-slide (FLIP) plus
// root width-morph already use native WAAPI/CSS in the original, so they carry
// over unchanged. React only — no animation libraries.

const defaultRoleTextRoles = [
  "Web Developer",
  "OSS Contributor",
  "Gym rat",
  "SQL > NoSQL",
  "Polyglot Programmer",
  "Check out my talks",
  "Always learning",
] as const;

const ROLE_HOLD_MS = 1600;
const DEFAULT_DURATION_MS = 440;
const DEFAULT_EXIT_DURATION_MS = 360;
const DEFAULT_STAGGER_MS = 12;
const DEFAULT_ENTRANCE_OFFSET = 72;
const DEFAULT_ENTRANCE_HEIGHT = 8;
const DEFAULT_ENTRANCE_SCALE = 1.1;
const DEFAULT_EXIT_HEIGHT = 90;
const DEFAULT_EXIT_SCALE = 0.4;
const ENTER_SAMPLE_COUNT = 40;
const EXIT_SAMPLE_COUNT = 28;
const easeOutStrong: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeOutStrongCss = "cubic-bezier(0.16, 1, 0.3, 1)";
const slotTextEntranceEaseX1 = 0.34;
const slotTextEntranceEaseX2 = 0.64;
const fallbackRoles = [""] as const;
const SPACE_GLYPH = " ";

const textAlignClassName = {
  center: "text-center",
  end: "text-right",
  start: "text-left",
} as const;

type RoleTextAlign = keyof typeof textAlignClassName;

type RoleTextProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> & {
  align?: RoleTextAlign;
  blur?: boolean;
  duration?: number;
  entranceHeight?: number;
  entranceScale?: number;
  exitDuration?: number;
  exitHeight?: number;
  exitScale?: number;
  index?: number;
  interval?: number;
  preservePrefix?: boolean;
  roles?: readonly string[];
  scale?: boolean;
  stagger?: number;
  textClassName?: string;
};

type RoleCharacter = {
  character: string;
  index: number;
};

type RoleCharacterEntry = {
  character: string;
  entryKey: string;
  order: number;
  settleAt: number;
};

type RoleCharacterMeasure = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type RenderedRoleCharacter = RoleCharacter & {
  entryKey: string;
  order: number;
  stable: boolean;
};

type RoleRootSize = {
  height: number;
  width: number;
};

type RoleTextConfig = {
  blur: boolean;
  duration: number;
  enterDuration: number;
  entranceHeight: number;
  entranceScale: number;
  enterStagger: number;
  exitDuration: number;
  exitHeight: number;
  exitScale: number;
  exitStagger: number;
  scale: boolean;
};

type RoleTransitionState = {
  current: string;
  previous: string;
  version: number;
};

type RoleCharacterRenderState = {
  characters: RenderedRoleCharacter[];
  entries: Map<number, RoleCharacterEntry>;
  preservedPrefixLength: number;
  stablePrefixLength: number;
};

// A single property's keyframe track, evaluated by sampling. `times` are in
// [0, 1] and `ease` is applied per-segment, matching how Motion eases between
// keyframe array entries.
type MotionTrack = {
  duration: number;
  ease: (value: number) => number;
  times: number[];
  values: number[];
};

type RoleKeyframes = {
  duration: number;
  keyframes: Keyframe[];
};

function normalizeRoles(roles: readonly string[]) {
  return roles.map((role) => role.trim()).filter(Boolean);
}

function commonPrefixLength(previous: string, next: string) {
  const previousCharacters = Array.from(previous);
  const nextCharacters = Array.from(next);
  const maxLength = Math.min(previousCharacters.length, nextCharacters.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (previousCharacters[index] !== nextCharacters[index]) return index;
  }

  return maxLength;
}

function isForwardAppend(previous: string, next: string) {
  const previousCharacters = Array.from(previous);
  const nextCharacters = Array.from(next);

  if (nextCharacters.length <= previousCharacters.length) return false;

  return previousCharacters.every((character, index) => nextCharacters[index] === character);
}

function splitCharacters(text: string): RoleCharacter[] {
  return Array.from(text).map((character, index) => ({
    character,
    index,
  }));
}

function displayCharacter(character: string) {
  return character === " " ? SPACE_GLYPH : character;
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function lerp(from: number, to: number, fraction: number) {
  return from + (to - from) * fraction;
}

// Cubic-bezier easing solver (Newton-Raphson), matching the curves Motion feeds
// to its transitions. Returns the eased y for a linear progress x in [0, 1].
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  if (x1 === y1 && x2 === y2) return (value: number) => value;

  const ax = (a: number, b: number) => 1 - 3 * b + 3 * a;
  const bx = (a: number, b: number) => 3 * b - 6 * a;
  const cx = (a: number) => 3 * a;
  const sample = (t: number, a: number, b: number) => ((ax(a, b) * t + bx(a, b)) * t + cx(a)) * t;
  const slope = (t: number, a: number, b: number) =>
    3 * ax(a, b) * t * t + 2 * bx(a, b) * t + cx(a);

  const solveForX = (x: number) => {
    let guess = x;

    for (let index = 0; index < 8; index += 1) {
      const currentSlope = slope(guess, x1, x2);

      if (currentSlope === 0) return guess;

      guess -= (sample(guess, x1, x2) - x) / currentSlope;
    }

    return guess;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    return sample(solveForX(x), y1, y2);
  };
}

const easeOutStrongFn = cubicBezier(
  easeOutStrong[0],
  easeOutStrong[1],
  easeOutStrong[2],
  easeOutStrong[3],
);

function evalTrack(track: MotionTrack, globalTime: number) {
  const { ease, times, values } = track;

  if (values.length === 1) return values[0];

  const localProgress = clamp01(track.duration > 0 ? globalTime / track.duration : 1);
  let segment = 0;

  while (segment < times.length - 2 && localProgress > times[segment + 1]) {
    segment += 1;
  }

  const span = times[segment + 1] - times[segment] || 1;
  const segmentFraction = clamp01((localProgress - times[segment]) / span);

  return lerp(values[segment], values[segment + 1], ease(segmentFraction));
}

// Slot Text gets its bounce from an overshooting bezier; solve that curve so
// entranceHeight maps to the actual above-baseline peak instead of a held keyframe.
function cubicBezierCoordinate(t: number, point1: number, point2: number) {
  const invertedT = 1 - t;

  return 3 * invertedT * invertedT * t * point1 + 3 * invertedT * t * t * point2 + t * t * t;
}

function overshootForControlPoint(controlY1: number) {
  if (controlY1 <= 1) return 0;

  const peakT = controlY1 / (3 * controlY1 - 2);
  return cubicBezierCoordinate(peakT, controlY1, 1) - 1;
}

function entranceControlY1(height: number) {
  const targetOvershoot = Math.max(0, height / DEFAULT_ENTRANCE_OFFSET);

  if (targetOvershoot <= 0) return 1;

  let low = 1;
  let high = 2;

  while (overshootForControlPoint(high) < targetOvershoot && high < 8) {
    high *= 2;
  }

  for (let index = 0; index < 20; index += 1) {
    const middle = (low + high) / 2;

    if (overshootForControlPoint(middle) < targetOvershoot) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return high;
}

function entrancePeakTime(controlY1: number) {
  if (controlY1 <= 1) return 0.68;

  const peakT = controlY1 / (3 * controlY1 - 2);

  return cubicBezierCoordinate(peakT, slotTextEntranceEaseX1, slotTextEntranceEaseX2);
}

function entranceTiming(height: number) {
  const controlY1 = entranceControlY1(height);

  return {
    ease:
      height > 0
        ? cubicBezier(slotTextEntranceEaseX1, controlY1, slotTextEntranceEaseX2, 1)
        : easeOutStrongFn,
    peakTime: entrancePeakTime(controlY1),
  };
}

function characterTransitionWindow(
  text: string,
  duration: number,
  stagger: number,
  firstAnimatedIndex = 0,
) {
  const characterCount = Array.from(text).length;
  const animatedCount = Math.max(0, characterCount - firstAnimatedIndex);

  if (animatedCount === 0) return 0;

  return duration + Math.max(animatedCount - 1, 0) * stagger;
}

function lastCharacterStartDelay(text: string, stagger: number, firstAnimatedIndex = 0) {
  const animatedCount = Math.max(0, Array.from(text).length - firstAnimatedIndex);

  return Math.max(0, animatedCount - 1) * stagger;
}

// Bake Motion's enter variant. Each property keeps its own duration and easing
// (opacity overruns slightly, filter lands early, y/scale share the base
// window) — we sample all of them at a shared set of offsets so a single WAAPI
// animation reproduces the exact per-property curve.
function buildEnterKeyframes(config: RoleTextConfig, reduceMotion: boolean): RoleKeyframes {
  if (reduceMotion) {
    return {
      duration: Math.min(config.enterDuration, 180),
      keyframes: [
        { easing: "linear", offset: 0, opacity: 0 },
        { easing: "linear", offset: 1, opacity: 1 },
      ],
    };
  }

  const enter = config.enterDuration;
  const timing = entranceTiming(config.entranceHeight);
  const peakScale = config.scale ? config.entranceScale : 1;
  const opacityTrack: MotionTrack = {
    duration: enter * 1.09,
    ease: easeOutStrongFn,
    times: [0, 1],
    values: [0, 1],
  };
  const yTrack: MotionTrack = {
    duration: enter,
    ease: timing.ease,
    times: [0, 1],
    values: [DEFAULT_ENTRANCE_OFFSET, 0],
  };
  const scaleTrack: MotionTrack = {
    duration: enter,
    ease: easeOutStrongFn,
    times: [0, timing.peakTime, 1],
    values: [1, peakScale, 1],
  };
  const filterTrack: MotionTrack | null = config.blur
    ? {
        duration: enter * 0.95,
        ease: easeOutStrongFn,
        times: [0, 0.5, 1],
        values: [3, 0.5, 0],
      }
    : null;
  const maxDuration = enter * 1.09;
  const keyframes: Keyframe[] = [];

  for (let index = 0; index < ENTER_SAMPLE_COUNT; index += 1) {
    const offset = index / (ENTER_SAMPLE_COUNT - 1);
    const globalTime = offset * maxDuration;

    keyframes.push({
      easing: "linear",
      filter: filterTrack ? `blur(${evalTrack(filterTrack, globalTime)}px)` : "blur(0px)",
      offset,
      opacity: evalTrack(opacityTrack, globalTime),
      transform: `translateY(${evalTrack(yTrack, globalTime)}%) scale(${evalTrack(scaleTrack, globalTime)})`,
    });
  }

  return { duration: maxDuration, keyframes };
}

function buildExitKeyframes(config: RoleTextConfig, reduceMotion: boolean): RoleKeyframes {
  if (reduceMotion) {
    return {
      duration: Math.min(config.exitDuration, 180),
      keyframes: [
        { easing: "linear", offset: 0, opacity: 1 },
        { easing: "linear", offset: 1, opacity: 0 },
      ],
    };
  }

  const exit = config.exitDuration;
  const exitScale = config.scale ? config.exitScale : 1;
  const opacityTrack: MotionTrack = {
    duration: exit,
    ease: easeOutStrongFn,
    times: [0, 1],
    values: [1, 0],
  };
  const yTrack: MotionTrack = {
    duration: exit,
    ease: easeOutStrongFn,
    times: [0, 1],
    values: [0, -config.exitHeight],
  };
  const scaleTrack: MotionTrack = {
    duration: exit,
    ease: easeOutStrongFn,
    times: [0, 1],
    values: [1, exitScale],
  };
  const filterTrack: MotionTrack | null = config.blur
    ? {
        duration: exit * 0.95,
        ease: easeOutStrongFn,
        times: [0, 1],
        values: [0, 3],
      }
    : null;
  const keyframes: Keyframe[] = [];

  for (let index = 0; index < EXIT_SAMPLE_COUNT; index += 1) {
    const offset = index / (EXIT_SAMPLE_COUNT - 1);
    const globalTime = offset * exit;

    keyframes.push({
      easing: "linear",
      filter: filterTrack ? `blur(${evalTrack(filterTrack, globalTime)}px)` : "blur(0px)",
      offset,
      opacity: evalTrack(opacityTrack, globalTime),
      transform: `translateY(${evalTrack(yTrack, globalTime)}%) scale(${evalTrack(scaleTrack, globalTime)})`,
    });
  }

  return { duration: exit, keyframes };
}

function resolveRoleCharacterRenderState({
  activeRole,
  characters,
  config,
  preservePrefix,
  previousEntries,
  previousText,
  transitionVersion,
}: {
  activeRole: string;
  characters: RoleCharacter[];
  config: RoleTextConfig;
  preservePrefix: boolean;
  previousEntries: Map<number, RoleCharacterEntry>;
  previousText: string;
  transitionVersion: number;
}): RoleCharacterRenderState {
  const now = Date.now();
  const preservedPrefixLength = preservePrefix ? commonPrefixLength(previousText, activeRole) : 0;
  const entries = new Map<number, RoleCharacterEntry>();
  let stablePrefixLength = 0;
  let canExtendStablePrefix = true;

  characters.forEach((character) => {
    const previousEntry = previousEntries.get(character.index);
    const preservesEntry =
      character.index < preservedPrefixLength && previousEntry?.character === character.character;
    const order = Math.max(0, character.index - preservedPrefixLength);
    const entry =
      preservesEntry && previousEntry
        ? previousEntry
        : {
            character: character.character,
            entryKey: `${transitionVersion}-${character.index}-${character.character}`,
            order,
            settleAt: now + order * config.enterStagger + config.enterDuration,
          };

    // A common-prefix character is only "stable" after its own entrance has landed.
    // Until then, keep its entryKey so the WAAPI loop can finish the full y/scale arc.
    if (canExtendStablePrefix && preservesEntry && entry.settleAt <= now) {
      stablePrefixLength += 1;
    } else {
      canExtendStablePrefix = false;
    }

    entries.set(character.index, entry);
  });

  return {
    characters: characters.map((character) => {
      const entry = entries.get(character.index);

      return {
        ...character,
        entryKey:
          entry?.entryKey ?? `${transitionVersion}-${character.index}-${character.character}`,
        order: entry?.order ?? Math.max(0, character.index - preservedPrefixLength),
        stable: character.index < stablePrefixLength,
      };
    }),
    entries,
    preservedPrefixLength,
    stablePrefixLength,
  };
}

function useRoleTransitionState(role: string) {
  const [transitionState, setTransitionState] = React.useState<RoleTransitionState>(() => ({
    current: role,
    previous: "",
    version: 0,
  }));

  if (transitionState.current !== role) {
    const nextTransitionState = {
      current: role,
      previous: transitionState.current,
      version: transitionState.version + 1,
    };

    setTransitionState(nextTransitionState);
    return nextTransitionState;
  }

  return transitionState;
}

function measureElementSize(element: HTMLElement): RoleRootSize {
  const rect = element.getBoundingClientRect();

  return {
    height: rect.height,
    width: rect.width,
  };
}

function widthsMatch(previous: RoleRootSize, next: RoleRootSize) {
  return Math.abs(previous.width - next.width) < 0.5;
}

function clearRootSizeStyles(element: HTMLElement) {
  element.style.width = "";
  element.style.height = "";
  element.style.transitionProperty = "";
  element.style.transitionDuration = "";
  element.style.transitionTimingFunction = "";
  element.style.willChange = "";
}

function measureRoleCharacterSlots(root: HTMLSpanElement, slots: Map<number, HTMLSpanElement>) {
  const measures = new Map<number, RoleCharacterMeasure>();
  const rootRect = root.getBoundingClientRect();

  slots.forEach((slot, index) => {
    if (!slot.isConnected) return;
    const rect = slot.getBoundingClientRect();
    measures.set(index, {
      height: rect.height,
      width: rect.width,
      x: rect.left - rootRect.left,
      y: rect.top - rootRect.top,
    });
  });

  return measures;
}

function clampMotionNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function clampScale(value: number, fallback: number) {
  return Math.min(1.5, Math.max(0, clampMotionNumber(value, fallback)));
}

function clampPeakScale(value: number, fallback: number) {
  return Math.min(2, Math.max(1, clampMotionNumber(value, fallback)));
}

function RoleTextCharacterSlot({
  character,
  enterInitialStyle,
  setEnterRef,
  setSlotRef,
}: {
  character: RenderedRoleCharacter;
  enterInitialStyle: React.CSSProperties;
  setEnterRef: (index: number, element: HTMLSpanElement | null) => void;
  setSlotRef: (index: number, element: HTMLSpanElement | null) => void;
}) {
  return (
    <span
      className={cn("inline-block", !character.stable && "relative align-baseline")}
      ref={(element) => setSlotRef(character.index, element)}
    >
      {character.stable ? (
        displayCharacter(character.character)
      ) : (
        <>
          <span aria-hidden="true" className="invisible">
            {displayCharacter(character.character)}
          </span>
          <span
            data-role-text-character={character.character}
            data-role-text-index={character.index}
            className="absolute top-0 left-0 inline-block"
            ref={(element) => setEnterRef(character.index, element)}
            style={{ transformOrigin: "50% 50%", ...enterInitialStyle }}
          >
            {displayCharacter(character.character)}
          </span>
        </>
      )}
    </span>
  );
}

function RoleTextExitingCharacters({
  previousMeasures,
  previousText,
  preservedPrefixLength,
  setExitRef,
  transitionKey,
}: {
  previousMeasures: Map<number, RoleCharacterMeasure>;
  previousText: string;
  preservedPrefixLength: number;
  setExitRef: (key: string, element: HTMLSpanElement | null, order: number) => void;
  transitionKey: string;
}) {
  const previousCharacters = splitCharacters(previousText).filter(
    (character) => character.index >= preservedPrefixLength,
  );

  return (
    <>
      {previousCharacters.map((character, order) => {
        const previousMeasure = previousMeasures.get(character.index);

        if (!previousMeasure) return null;

        const elementKey = `${transitionKey}-${character.index}-${character.character}`;

        return (
          <span
            key={`out-${elementKey}`}
            aria-hidden="true"
            className="pointer-events-none absolute inline-block"
            ref={(element) => setExitRef(elementKey, element, order)}
            style={{
              height: previousMeasure.height,
              left: previousMeasure.x,
              opacity: 1,
              top: previousMeasure.y,
              transformOrigin: "50% 50%",
              width: previousMeasure.width,
            }}
          >
            {displayCharacter(character.character)}
          </span>
        );
      })}
    </>
  );
}

function RoleText({
  align = "center",
  blur = true,
  className,
  duration = DEFAULT_DURATION_MS,
  entranceHeight = DEFAULT_ENTRANCE_HEIGHT,
  entranceScale = DEFAULT_ENTRANCE_SCALE,
  exitDuration = DEFAULT_EXIT_DURATION_MS,
  exitHeight = DEFAULT_EXIT_HEIGHT,
  exitScale = DEFAULT_EXIT_SCALE,
  index: controlledIndex,
  interval = ROLE_HOLD_MS,
  preservePrefix = true,
  roles = defaultRoleTextRoles,
  scale = true,
  stagger = DEFAULT_STAGGER_MS,
  textClassName,
  ...props
}: RoleTextProps) {
  const reduceMotion = usePrefersReducedMotion();
  const normalizedRoles = React.useMemo(() => normalizeRoles(roles), [roles]);
  const safeRoles = normalizedRoles.length > 0 ? normalizedRoles : fallbackRoles;
  const [index, setIndex] = React.useState(0);
  const activeIndex = controlledIndex ?? index;
  const safeIndex = ((activeIndex % safeRoles.length) + safeRoles.length) % safeRoles.length;
  const role = safeRoles[safeIndex] ?? "";
  const transitionState = useRoleTransitionState(role);
  const activeRole = transitionState.current;
  const slotElements = React.useRef(new Map<number, HTMLSpanElement>());
  const enterElements = React.useRef(new Map<number, HTMLSpanElement>());
  const enterAnimations = React.useRef(new Map<number, Animation>());
  const enterFiredKeys = React.useRef(new Map<number, string>());
  const exitElements = React.useRef(new Map<string, { element: HTMLSpanElement; order: number }>());
  const exitAnimations = React.useRef(new Set<Animation>());
  const exitFiredVersion = React.useRef(-1);
  const previousSlotMeasures = React.useRef(new Map<number, RoleCharacterMeasure>());
  const prefixAnimations = React.useRef(new Map<number, Animation>());
  const previousText = transitionState.previous;
  const transitionKey = `${transitionState.version}-${safeIndex}-${activeRole}`;
  const characters = React.useMemo(() => splitCharacters(activeRole), [activeRole]);
  const characterEntries = React.useRef(new Map<number, RoleCharacterEntry>());
  const characterRenderState = React.useRef<
    RoleCharacterRenderState & {
      signature: string;
    }
  >({
    characters: [],
    entries: new Map(),
    preservedPrefixLength: 0,
    signature: "",
    stablePrefixLength: 0,
  });
  const rootElement = React.useRef<HTMLSpanElement>(null);
  const sizingElement = React.useRef<HTMLSpanElement>(null);
  const transitionExitMeasureSnapshot = React.useRef({
    measures: previousSlotMeasures.current,
    version: transitionState.version,
  });

  if (transitionExitMeasureSnapshot.current.version !== transitionState.version) {
    transitionExitMeasureSnapshot.current = {
      measures: previousSlotMeasures.current,
      version: transitionState.version,
    };
  }
  const setSlotRef = React.useCallback((index: number, element: HTMLSpanElement | null) => {
    if (element) {
      slotElements.current.set(index, element);
    } else {
      slotElements.current.delete(index);
    }
  }, []);
  const setEnterRef = React.useCallback((index: number, element: HTMLSpanElement | null) => {
    if (element) {
      enterElements.current.set(index, element);
    } else {
      enterElements.current.delete(index);
    }
  }, []);
  const setExitRef = React.useCallback(
    (key: string, element: HTMLSpanElement | null, order: number) => {
      if (element) {
        exitElements.current.set(key, { element, order });
      } else {
        exitElements.current.delete(key);
      }
    },
    [],
  );
  const config = React.useMemo<RoleTextConfig>(() => {
    const resolvedDuration = clampMotionNumber(duration, DEFAULT_DURATION_MS);
    const resolvedStagger = clampMotionNumber(stagger, DEFAULT_STAGGER_MS);

    return {
      blur,
      duration: resolvedDuration,
      enterDuration: resolvedDuration,
      entranceHeight: clampMotionNumber(entranceHeight, DEFAULT_ENTRANCE_HEIGHT),
      entranceScale: clampPeakScale(entranceScale, DEFAULT_ENTRANCE_SCALE),
      enterStagger: resolvedStagger,
      exitDuration: clampMotionNumber(exitDuration, DEFAULT_EXIT_DURATION_MS),
      exitHeight: clampMotionNumber(exitHeight, DEFAULT_EXIT_HEIGHT),
      exitScale: clampScale(exitScale, DEFAULT_EXIT_SCALE),
      exitStagger: resolvedStagger,
      scale,
    };
  }, [
    blur,
    duration,
    entranceHeight,
    entranceScale,
    exitDuration,
    exitHeight,
    exitScale,
    scale,
    stagger,
  ]);
  const enterKeyframes = React.useMemo(
    () => buildEnterKeyframes(config, reduceMotion),
    [config, reduceMotion],
  );
  const exitKeyframes = React.useMemo(
    () => buildExitKeyframes(config, reduceMotion),
    [config, reduceMotion],
  );
  const enterInitialStyle = React.useMemo<React.CSSProperties>(() => {
    if (reduceMotion) return { opacity: 0 };

    return {
      filter: config.blur ? "blur(3px)" : "blur(0px)",
      opacity: 0,
      transform: `translateY(${DEFAULT_ENTRANCE_OFFSET}%) scale(1)`,
    };
  }, [config.blur, reduceMotion]);
  const renderStateSignature = `${transitionState.version}-${preservePrefix ? "preserve" : "all"}`;

  if (characterRenderState.current.signature !== renderStateSignature) {
    const nextRenderState = resolveRoleCharacterRenderState({
      activeRole,
      characters,
      config,
      preservePrefix,
      previousEntries: characterEntries.current,
      previousText,
      transitionVersion: transitionState.version,
    });

    characterEntries.current = nextRenderState.entries;
    characterRenderState.current = {
      ...nextRenderState,
      signature: renderStateSignature,
    };
  }

  const renderedCharacters = characterRenderState.current.characters;
  const preservedPrefixLength = characterRenderState.current.preservedPrefixLength;
  const stablePrefixLength = characterRenderState.current.stablePrefixLength;
  const longestRoleLength = React.useMemo(
    () => safeRoles.reduce((longest, next) => Math.max(longest, Array.from(next).length), 0),
    [safeRoles],
  );
  const rootTransitionDuration = Math.max(
    config.duration,
    characterTransitionWindow(
      activeRole,
      config.enterDuration,
      config.enterStagger,
      preservedPrefixLength,
    ),
    characterTransitionWindow(
      previousText,
      config.exitDuration,
      config.exitStagger,
      preservedPrefixLength,
    ),
  );
  const previousRootSize = React.useRef<RoleRootSize | null>(null);
  const rootSizeDelayTimer = React.useRef<number | null>(null);
  const rootSizeAnimationFrame = React.useRef<number | null>(null);
  const rootSizeCleanupTimer = React.useRef<number | null>(null);

  // Fire the per-character entrance. Keyframes are config-only (order-independent),
  // so each character reuses the same baked set and varies only its delay. We
  // guard on entryKey so preserved prefix characters never replay mid-flight.
  React.useLayoutEffect(() => {
    renderedCharacters.forEach((character) => {
      if (character.stable) {
        enterFiredKeys.current.delete(character.index);
        return;
      }

      const element = enterElements.current.get(character.index);

      if (!element) return;
      if (enterFiredKeys.current.get(character.index) === character.entryKey) return;

      enterAnimations.current.get(character.index)?.cancel();

      const animation = element.animate(enterKeyframes.keyframes, {
        delay: character.order * config.enterStagger,
        duration: enterKeyframes.duration,
        easing: "linear",
        fill: "both",
      });

      enterAnimations.current.set(character.index, animation);
      enterFiredKeys.current.set(character.index, character.entryKey);
    });
  }, [config.enterStagger, enterKeyframes, renderedCharacters]);

  // Fire the per-character exit for the outgoing role. Exit spans remount each
  // transition, so we fire once per version against the freshly measured slots.
  React.useLayoutEffect(() => {
    if (exitFiredVersion.current === transitionState.version) return;

    exitFiredVersion.current = transitionState.version;
    exitAnimations.current.forEach((animation) => animation.cancel());
    exitAnimations.current.clear();

    exitElements.current.forEach(({ element, order }) => {
      const animation = element.animate(exitKeyframes.keyframes, {
        delay: order * config.exitStagger,
        duration: exitKeyframes.duration,
        easing: "linear",
        fill: "both",
      });

      exitAnimations.current.add(animation);
    });
  }, [config.exitStagger, exitKeyframes, transitionState.version]);

  React.useLayoutEffect(() => {
    const root = rootElement.current;
    const sizing = sizingElement.current;

    if (!root || !sizing) return;

    const previousSize = previousRootSize.current;
    const visualSize = measureElementSize(root);
    const hadPinnedWidth = root.style.width !== "";

    if (rootSizeDelayTimer.current !== null) {
      window.clearTimeout(rootSizeDelayTimer.current);
      rootSizeDelayTimer.current = null;
    }

    if (rootSizeAnimationFrame.current !== null) {
      window.cancelAnimationFrame(rootSizeAnimationFrame.current);
      rootSizeAnimationFrame.current = null;
    }

    if (rootSizeCleanupTimer.current !== null) {
      window.clearTimeout(rootSizeCleanupTimer.current);
      rootSizeCleanupTimer.current = null;
    }

    root.style.transitionProperty = "none";
    root.style.transitionDuration = "";
    root.style.transitionTimingFunction = "";
    root.style.width = "";
    root.style.height = "";
    root.style.willChange = "";

    void root.offsetWidth;

    const nextSize = measureElementSize(sizing);

    previousRootSize.current = nextSize;

    if (!previousSize || reduceMotion) {
      clearRootSizeStyles(root);
      return;
    }

    const fromSize =
      hadPinnedWidth && !isForwardAppend(previousText, activeRole) ? visualSize : previousSize;

    if (widthsMatch(fromSize, nextSize)) {
      clearRootSizeStyles(root);
      return;
    }

    root.style.width = `${fromSize.width}px`;
    root.style.willChange = "width";

    void root.offsetWidth;

    const isShrinking = fromSize.width > nextSize.width;
    const resizeDelay = isShrinking
      ? lastCharacterStartDelay(previousText, config.exitStagger, preservedPrefixLength)
      : 0;
    const resizeDuration = isShrinking ? config.exitDuration : rootTransitionDuration;

    root.style.transitionProperty = "width";
    root.style.transitionDuration = `${resizeDuration}ms`;
    root.style.transitionTimingFunction = easeOutStrongCss;

    const startResize = () => {
      rootSizeAnimationFrame.current = window.requestAnimationFrame(() => {
        rootSizeAnimationFrame.current = null;
        root.style.width = `${nextSize.width}px`;
      });
    };

    if (resizeDelay > 0) {
      rootSizeDelayTimer.current = window.setTimeout(() => {
        rootSizeDelayTimer.current = null;
        startResize();
      }, resizeDelay);
    } else {
      startResize();
    }

    rootSizeCleanupTimer.current = window.setTimeout(
      () => {
        rootSizeCleanupTimer.current = null;
        clearRootSizeStyles(root);
      },
      resizeDelay + resizeDuration + 80,
    );
  }, [
    activeRole,
    config.exitDuration,
    config.exitStagger,
    preservedPrefixLength,
    previousText,
    reduceMotion,
    rootTransitionDuration,
    transitionState.version,
  ]);

  React.useLayoutEffect(() => {
    const root = rootElement.current;

    if (!root) return;

    const currentMeasures = measureRoleCharacterSlots(root, slotElements.current);
    const activePrefixIndexes = new Set(
      Array.from({ length: stablePrefixLength }, (_, index) => index),
    );

    prefixAnimations.current.forEach((animation, index) => {
      if (!activePrefixIndexes.has(index) || reduceMotion || !preservePrefix) {
        animation.cancel();
        prefixAnimations.current.delete(index);
      }
    });

    if (!reduceMotion && preservePrefix) {
      activePrefixIndexes.forEach((index) => {
        const element = slotElements.current.get(index);
        const previousMeasure = previousSlotMeasures.current.get(index);
        const currentMeasure = currentMeasures.get(index);

        if (!element || !previousMeasure || !currentMeasure) return;

        const deltaX = previousMeasure.x - currentMeasure.x;
        const deltaY = 0;

        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

        prefixAnimations.current.get(index)?.cancel();

        const animation = element.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: "translate(0px, 0px)" },
          ],
          {
            duration: config.duration,
            easing: easeOutStrongCss,
            fill: "both",
          },
        );

        prefixAnimations.current.set(index, animation);
        animation.onfinish = () => {
          if (prefixAnimations.current.get(index) !== animation) return;
          prefixAnimations.current.delete(index);
          animation.cancel();
        };
      });
    }

    previousSlotMeasures.current = currentMeasures;
  }, [config.duration, preservePrefix, reduceMotion, activeRole, stablePrefixLength]);

  React.useEffect(
    () => () => {
      prefixAnimations.current.forEach((animation) => animation.cancel());
      prefixAnimations.current.clear();
      enterAnimations.current.forEach((animation) => animation.cancel());
      enterAnimations.current.clear();
      exitAnimations.current.forEach((animation) => animation.cancel());
      exitAnimations.current.clear();

      if (rootSizeAnimationFrame.current !== null) {
        window.cancelAnimationFrame(rootSizeAnimationFrame.current);
      }

      if (rootSizeDelayTimer.current !== null) {
        window.clearTimeout(rootSizeDelayTimer.current);
      }

      if (rootSizeCleanupTimer.current !== null) {
        window.clearTimeout(rootSizeCleanupTimer.current);
      }
    },
    [],
  );

  React.useEffect(() => {
    setIndex((current) => current % safeRoles.length);
  }, [safeRoles.length]);

  React.useEffect(() => {
    if (controlledIndex !== undefined) return undefined;
    if (safeRoles.length <= 1) return undefined;

    const enterWindowMs = config.enterDuration + longestRoleLength * config.enterStagger;
    const exitWindowMs = config.exitDuration + longestRoleLength * config.exitStagger;
    const transitionWindowMs = Math.max(config.duration, enterWindowMs, exitWindowMs);
    const resolvedInterval = Math.max(interval, transitionWindowMs + 700);
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeRoles.length);
    }, resolvedInterval);

    return () => window.clearInterval(timer);
  }, [
    config.duration,
    config.enterDuration,
    config.enterStagger,
    config.exitDuration,
    config.exitStagger,
    controlledIndex,
    interval,
    longestRoleLength,
    safeRoles.length,
  ]);

  return (
    <span
      aria-atomic="true"
      aria-label={activeRole}
      aria-live="polite"
      data-slot="role-text"
      ref={rootElement}
      className={cn("relative isolate inline-grid w-fit overflow-visible leading-tight", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 inline-block whitespace-nowrap opacity-0"
        ref={sizingElement}
      >
        {activeRole}
      </span>
      <RoleTextExitingCharacters
        previousMeasures={transitionExitMeasureSnapshot.current.measures}
        previousText={previousText}
        preservedPrefixLength={preservedPrefixLength}
        setExitRef={setExitRef}
        transitionKey={transitionKey}
      />
      <span
        aria-hidden="true"
        className={cn(
          "col-start-1 row-start-1 inline-flex justify-self-start whitespace-nowrap select-none",
          textAlignClassName[align],
          textClassName,
        )}
      >
        {renderedCharacters.map((character) => (
          <RoleTextCharacterSlot
            key={character.index}
            character={character}
            enterInitialStyle={enterInitialStyle}
            setEnterRef={setEnterRef}
            setSlotRef={setSlotRef}
          />
        ))}
      </span>
    </span>
  );
}

// Dependency-free replacement for Motion's useReducedMotion.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export { RoleText, defaultRoleTextRoles };
export type { RoleTextProps };
