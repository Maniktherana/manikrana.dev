"use client";

import * as React from "react";
import { type HTMLMotionProps, motion, type Variants, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const defaultRoleMotionRoles = [
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
const DEFAULT_ENTER_STAGGER_MS = 12;
const DEFAULT_EXIT_STAGGER_MS = 12;
const DEFAULT_ENTRANCE_OFFSET = 72;
const DEFAULT_ENTRANCE_HEIGHT = 8;
const DEFAULT_ENTRANCE_SCALE = 1.1;
const DEFAULT_EXIT_HEIGHT = 90;
const DEFAULT_EXIT_SCALE = 0.4;
const easeOutStrong: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeOutStrongCss = "cubic-bezier(0.16, 1, 0.3, 1)";
const slotTextEntranceEaseX1 = 0.34;
const slotTextEntranceEaseX2 = 0.64;
const fallbackRoles = [""] as const;
const SPACE_GLYPH = "\u00a0";

const textAlignClassName = {
  center: "text-center",
  end: "text-right",
  start: "text-left",
} as const;

type RoleMotionAlign = keyof typeof textAlignClassName;

type RoleMotionProps = Omit<HTMLMotionProps<"span">, "children"> & {
  align?: RoleMotionAlign;
  blur?: boolean;
  duration?: number;
  enterDuration?: number;
  entranceHeight?: number;
  entranceScale?: number;
  enterStagger?: number;
  exitDuration?: number;
  exitHeight?: number;
  exitScale?: number;
  exitStagger?: number;
  index?: number;
  interval?: number;
  preservePrefix?: boolean;
  roles?: readonly string[];
  scale?: boolean;
  textClassName?: string;
};

type RoleCharacter = {
  character: string;
  index: number;
};

type RoleCharacterCustom = {
  index: number;
  order: number;
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

type RoleMotionConfig = {
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

function characterCustom(character: RoleCharacter, order = character.index): RoleCharacterCustom {
  return {
    index: character.index,
    order,
  };
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
  config: RoleMotionConfig;
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
    // Until then, keep its entryKey so Motion can finish the full y/scale loop.
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
        ? ([slotTextEntranceEaseX1, controlY1, slotTextEntranceEaseX2, 1] as [
            number,
            number,
            number,
            number,
          ])
        : easeOutStrong,
    peakTime: entrancePeakTime(controlY1),
  };
}

function enterYKeyframes() {
  return {
    y: [`${DEFAULT_ENTRANCE_OFFSET}%`, "0%"],
  };
}

function enterScaleKeyframes(peakScale: number, peakTime: number) {
  return {
    scale: [1, peakScale, 1],
    times: [0, peakTime, 1],
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

function createReducedMotionCharacterVariants(config: RoleMotionConfig): Variants {
  return {
    initial: { opacity: 0 },
    animate: ({ order }: RoleCharacterCustom) => ({
      opacity: 1,
      transition: {
        delay: (order * config.enterStagger) / 1000,
        duration: Math.min(config.enterDuration / 1000, 0.18),
        ease: "linear",
      },
    }),
    exit: ({ order }: RoleCharacterCustom) => ({
      opacity: 0,
      transition: {
        delay: (order * config.exitStagger) / 1000,
        duration: Math.min(config.exitDuration / 1000, 0.18),
        ease: "linear",
      },
    }),
  };
}

function createRoleCharacterVariants(config: RoleMotionConfig): Variants {
  const enterDuration = config.enterDuration / 1000;
  const exitDuration = config.exitDuration / 1000;
  const exitScale = config.scale ? config.exitScale : 1;
  const initialFilter = config.blur ? "blur(3px)" : "blur(0px)";
  const enterFilter = config.blur ? ["blur(3px)", "blur(0.5px)", "blur(0px)"] : "blur(0px)";
  const exitFilter = config.blur ? "blur(3px)" : "blur(0px)";

  return {
    initial: {
      opacity: 0,
      y: `${DEFAULT_ENTRANCE_OFFSET}%`,
      scale: 1,
      filter: initialFilter,
    },
    animate: ({ order }: RoleCharacterCustom) => {
      const delay = (order * config.enterStagger) / 1000;
      const enterY = enterYKeyframes();
      const enterTiming = entranceTiming(config.entranceHeight);
      const enterScale = enterScaleKeyframes(
        config.scale ? config.entranceScale : 1,
        enterTiming.peakTime,
      );

      return {
        opacity: 1,
        y: enterY.y,
        scale: enterScale.scale,
        filter: enterFilter,
        transition: {
          opacity: {
            delay,
            duration: enterDuration * 1.09,
            ease: easeOutStrong,
          },
          filter: {
            delay,
            duration: enterDuration * 0.95,
            ease: easeOutStrong,
          },
          y: {
            delay,
            duration: enterDuration,
            ease: enterTiming.ease,
          },
          scale: {
            delay,
            duration: enterDuration,
            ease: easeOutStrong,
            times: enterScale.times,
          },
        },
      };
    },
    exit: ({ order }: RoleCharacterCustom) => {
      const delay = (order * config.exitStagger) / 1000;

      return {
        opacity: 0,
        y: `-${config.exitHeight}%`,
        scale: exitScale,
        filter: exitFilter,
        transition: {
          opacity: {
            delay,
            duration: exitDuration,
            ease: easeOutStrong,
          },
          filter: {
            delay,
            duration: exitDuration * 0.95,
            ease: easeOutStrong,
          },
          y: {
            delay,
            duration: exitDuration,
            ease: easeOutStrong,
          },
          scale: {
            delay,
            duration: exitDuration,
            ease: easeOutStrong,
          },
        },
      };
    },
  };
}

function RoleMotionCharacterSlot({
  character,
  setSlotRef,
  variants,
}: {
  character: RenderedRoleCharacter;
  setSlotRef: (index: number, element: HTMLSpanElement | null) => void;
  variants: Variants;
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
          <motion.span
            key={`in-${character.entryKey}`}
            custom={characterCustom(character, character.order)}
            data-role-motion-character={character.character}
            data-role-motion-index={character.index}
            className="absolute top-0 left-0 inline-block"
            variants={variants}
            initial="initial"
            animate="animate"
            style={{ transformOrigin: "50% 50%" }}
          >
            {displayCharacter(character.character)}
          </motion.span>
        </>
      )}
    </span>
  );
}

function RoleMotionCharacters({
  characters,
  setSlotRef,
  variants,
}: {
  characters: RenderedRoleCharacter[];
  setSlotRef: (index: number, element: HTMLSpanElement | null) => void;
  variants: Variants;
}) {
  return (
    <>
      {characters.map((character) => (
        <RoleMotionCharacterSlot
          key={character.index}
          character={character}
          setSlotRef={setSlotRef}
          variants={variants}
        />
      ))}
    </>
  );
}

function RoleMotionExitingCharacters({
  previousMeasures,
  previousText,
  preservedPrefixLength,
  transitionKey,
  variants,
}: {
  previousMeasures: Map<number, RoleCharacterMeasure>;
  previousText: string;
  preservedPrefixLength: number;
  transitionKey: string;
  variants: Variants;
}) {
  const previousCharacters = splitCharacters(previousText).filter(
    (character) => character.index >= preservedPrefixLength,
  );

  return (
    <>
      {previousCharacters.map((character, order) => {
        const previousMeasure = previousMeasures.get(character.index);

        if (!previousMeasure) return null;

        return (
          <motion.span
            key={`out-${transitionKey}-${character.index}-${character.character}`}
            custom={characterCustom(character, order)}
            aria-hidden="true"
            className="pointer-events-none absolute inline-block"
            initial={{ opacity: 1, y: "0%", scale: 1, filter: "blur(0px)" }}
            animate="exit"
            variants={variants}
            style={{
              height: previousMeasure.height,
              left: previousMeasure.x,
              top: previousMeasure.y,
              transformOrigin: "50% 50%",
              width: previousMeasure.width,
            }}
          >
            {displayCharacter(character.character)}
          </motion.span>
        );
      })}
    </>
  );
}

function RoleMotion({
  align = "center",
  blur = true,
  className,
  duration = DEFAULT_DURATION_MS,
  enterDuration,
  entranceHeight = DEFAULT_ENTRANCE_HEIGHT,
  entranceScale = DEFAULT_ENTRANCE_SCALE,
  enterStagger = DEFAULT_ENTER_STAGGER_MS,
  exitDuration = DEFAULT_EXIT_DURATION_MS,
  exitHeight = DEFAULT_EXIT_HEIGHT,
  exitScale = DEFAULT_EXIT_SCALE,
  exitStagger = DEFAULT_EXIT_STAGGER_MS,
  index: controlledIndex,
  interval = ROLE_HOLD_MS,
  preservePrefix = true,
  roles = defaultRoleMotionRoles,
  scale = true,
  textClassName,
  ...props
}: RoleMotionProps) {
  const reduceMotion = useReducedMotion();
  const normalizedRoles = React.useMemo(() => normalizeRoles(roles), [roles]);
  const safeRoles = normalizedRoles.length > 0 ? normalizedRoles : fallbackRoles;
  const [index, setIndex] = React.useState(0);
  const activeIndex = controlledIndex ?? index;
  const safeIndex = ((activeIndex % safeRoles.length) + safeRoles.length) % safeRoles.length;
  const role = safeRoles[safeIndex] ?? "";
  const transitionState = useRoleTransitionState(role);
  const activeRole = transitionState.current;
  const slotElements = React.useRef(new Map<number, HTMLSpanElement>());
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
  const config = React.useMemo(() => {
    const resolvedDuration = clampMotionNumber(duration, DEFAULT_DURATION_MS);

    return {
      blur,
      duration: resolvedDuration,
      enterDuration: clampMotionNumber(enterDuration ?? resolvedDuration, resolvedDuration),
      entranceHeight: clampMotionNumber(entranceHeight, DEFAULT_ENTRANCE_HEIGHT),
      entranceScale: clampPeakScale(entranceScale, DEFAULT_ENTRANCE_SCALE),
      enterStagger: clampMotionNumber(enterStagger, DEFAULT_ENTER_STAGGER_MS),
      exitDuration: clampMotionNumber(exitDuration, DEFAULT_EXIT_DURATION_MS),
      exitHeight: clampMotionNumber(exitHeight, DEFAULT_EXIT_HEIGHT),
      exitScale: clampScale(exitScale, DEFAULT_EXIT_SCALE),
      exitStagger: clampMotionNumber(exitStagger, DEFAULT_EXIT_STAGGER_MS),
      scale,
    };
  }, [
    blur,
    duration,
    enterDuration,
    entranceHeight,
    entranceScale,
    enterStagger,
    exitDuration,
    exitHeight,
    exitScale,
    exitStagger,
    scale,
  ]);
  const variants = React.useMemo(
    () =>
      reduceMotion
        ? createReducedMotionCharacterVariants(config)
        : createRoleCharacterVariants(config),
    [config, reduceMotion],
  );
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
    <motion.span
      aria-atomic="true"
      aria-label={activeRole}
      aria-live="polite"
      data-slot="role-motion"
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
      <RoleMotionExitingCharacters
        previousMeasures={transitionExitMeasureSnapshot.current.measures}
        previousText={previousText}
        preservedPrefixLength={preservedPrefixLength}
        transitionKey={transitionKey}
        variants={variants}
      />
      <span
        aria-hidden="true"
        className={cn(
          "col-start-1 row-start-1 inline-flex justify-self-start whitespace-nowrap select-none",
          textAlignClassName[align],
          textClassName,
        )}
      >
        <RoleMotionCharacters
          characters={renderedCharacters}
          setSlotRef={setSlotRef}
          variants={variants}
        />
      </span>
    </motion.span>
  );
}

export { RoleMotion, defaultRoleMotionRoles };
export type { RoleMotionProps };
