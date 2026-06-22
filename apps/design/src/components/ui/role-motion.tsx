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
const DEFAULT_ENTER_STAGGER_MS = 12;
const DEFAULT_EXIT_STAGGER_MS = 8;
const DEFAULT_ENTRANCE_SCALE = 0.18;
const DEFAULT_EXIT_HEIGHT = 58;
const DEFAULT_EXIT_SCALE = 0.48;
const easeOutStrong: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeOutStrongCss = "cubic-bezier(0.16, 1, 0.3, 1)";
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
  entranceScale?: number;
  textClassName?: string;
};

type RoleCharacter = {
  character: string;
  index: number;
};

type RoleCharacterCustom = {
  index: number;
};

type RoleCharacterMeasure = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type RoleRootSize = {
  height: number;
  width: number;
};

type RoleMotionConfig = {
  blur: boolean;
  duration: number;
  enterDuration: number;
  enterStagger: number;
  exitDuration: number;
  exitHeight: number;
  exitScale: number;
  exitStagger: number;
  entranceScale: number;
  scale: boolean;
};

type RoleTransitionState = {
  current: string;
  previous: string;
  version: number;
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

function characterCustom(character: RoleCharacter): RoleCharacterCustom {
  return {
    index: character.index,
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

function characterTransitionWindow(
  text: string,
  duration: number,
  stagger: number,
  firstAnimatedIndex = 0,
) {
  const characterCount = Array.from(text).length;

  if (characterCount <= firstAnimatedIndex) return 0;

  return duration + Math.max(characterCount - 1, 0) * stagger;
}

function createReducedMotionCharacterVariants(config: RoleMotionConfig): Variants {
  return {
    initial: { opacity: 0 },
    animate: ({ index }: RoleCharacterCustom) => ({
      opacity: 1,
      transition: {
        delay: (index * config.enterStagger) / 1000,
        duration: Math.min(config.enterDuration / 1000, 0.18),
        ease: "linear",
      },
    }),
    exit: ({ index }: RoleCharacterCustom) => ({
      opacity: 0,
      transition: {
        delay: (index * config.exitStagger) / 1000,
        duration: Math.min(config.exitDuration / 1000, 0.18),
        ease: "linear",
      },
    }),
  };
}

function createRoleCharacterVariants(config: RoleMotionConfig): Variants {
  const enterDuration = config.enterDuration / 1000;
  const exitDuration = config.exitDuration / 1000;
  const enterScale = config.scale ? [config.entranceScale, 1] : 1;
  const exitScale = config.scale ? config.exitScale : 1;
  const initialFilter = config.blur ? "blur(3px)" : "blur(0px)";
  const enterFilter = config.blur ? ["blur(3px)", "blur(0.5px)", "blur(0px)"] : "blur(0px)";
  const exitFilter = config.blur ? "blur(3px)" : "blur(0px)";

  return {
    initial: {
      opacity: 0,
      y: "72%",
      scale: config.scale ? config.entranceScale : 1,
      filter: initialFilter,
    },
    animate: ({ index }: RoleCharacterCustom) => {
      const delay = (index * config.enterStagger) / 1000;

      return {
        opacity: 1,
        y: ["72%", "-8%", "0%"],
        scale: enterScale,
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
            ease: easeOutStrong,
            times: [0, 0.76, 1],
          },
          scale: {
            delay,
            duration: enterDuration,
            ease: easeOutStrong,
            times: [0, 1],
          },
        },
      };
    },
    exit: ({ index }: RoleCharacterCustom) => {
      const delay = (index * config.exitStagger) / 1000;

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
  stable,
  transitionKey,
  variants,
}: {
  character: RoleCharacter;
  setSlotRef: (index: number, element: HTMLSpanElement | null) => void;
  stable: boolean;
  transitionKey: string;
  variants: Variants;
}) {
  return (
    <span
      className={cn("inline-block", !stable && "relative align-baseline")}
      ref={(element) => setSlotRef(character.index, element)}
    >
      {stable ? (
        displayCharacter(character.character)
      ) : (
        <>
          <span aria-hidden="true" className="invisible">
            {displayCharacter(character.character)}
          </span>
          <motion.span
            key={`in-${transitionKey}-${character.index}-${character.character}`}
            custom={characterCustom(character)}
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
  stablePrefixLength,
  transitionKey,
  variants,
}: {
  characters: RoleCharacter[];
  setSlotRef: (index: number, element: HTMLSpanElement | null) => void;
  stablePrefixLength: number;
  transitionKey: string;
  variants: Variants;
}) {
  return (
    <>
      {characters.map((character) => (
        <RoleMotionCharacterSlot
          key={character.index}
          character={character}
          setSlotRef={setSlotRef}
          stable={character.index < stablePrefixLength}
          transitionKey={transitionKey}
          variants={variants}
        />
      ))}
    </>
  );
}

function RoleMotionExitingCharacters({
  previousMeasures,
  previousText,
  stablePrefixLength,
  transitionKey,
  variants,
}: {
  previousMeasures: Map<number, RoleCharacterMeasure>;
  previousText: string;
  stablePrefixLength: number;
  transitionKey: string;
  variants: Variants;
}) {
  const previousCharacters = splitCharacters(previousText).filter(
    (character) => character.index >= stablePrefixLength,
  );

  return (
    <>
      {previousCharacters.map((character) => {
        const previousMeasure = previousMeasures.get(character.index);

        if (!previousMeasure) return null;

        return (
          <motion.span
            key={`out-${transitionKey}-${character.index}-${character.character}`}
            custom={characterCustom(character)}
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
  enterStagger = DEFAULT_ENTER_STAGGER_MS,
  exitDuration,
  exitHeight = DEFAULT_EXIT_HEIGHT,
  exitScale = DEFAULT_EXIT_SCALE,
  exitStagger = DEFAULT_EXIT_STAGGER_MS,
  index: controlledIndex,
  interval = ROLE_HOLD_MS,
  preservePrefix = true,
  roles = defaultRoleMotionRoles,
  scale = true,
  entranceScale = DEFAULT_ENTRANCE_SCALE,
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
  const stablePrefixLength = preservePrefix ? commonPrefixLength(previousText, activeRole) : 0;
  const transitionKey = `${transitionState.version}-${safeIndex}-${activeRole}`;
  const characters = React.useMemo(() => splitCharacters(activeRole), [activeRole]);
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
      enterStagger: clampMotionNumber(enterStagger, DEFAULT_ENTER_STAGGER_MS),
      exitDuration: clampMotionNumber(
        exitDuration ?? resolvedDuration * 0.82,
        resolvedDuration * 0.82,
      ),
      exitHeight: clampMotionNumber(exitHeight, DEFAULT_EXIT_HEIGHT),
      exitScale: clampScale(exitScale, DEFAULT_EXIT_SCALE),
      exitStagger: clampMotionNumber(exitStagger, DEFAULT_EXIT_STAGGER_MS),
      entranceScale: clampScale(entranceScale, DEFAULT_ENTRANCE_SCALE),
      scale,
    };
  }, [
    blur,
    duration,
    enterDuration,
    enterStagger,
    exitDuration,
    exitHeight,
    exitScale,
    exitStagger,
    entranceScale,
    scale,
  ]);
  const variants = React.useMemo(
    () =>
      reduceMotion
        ? createReducedMotionCharacterVariants(config)
        : createRoleCharacterVariants(config),
    [config, reduceMotion],
  );
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
      stablePrefixLength,
    ),
    characterTransitionWindow(
      previousText,
      config.exitDuration,
      config.exitStagger,
      stablePrefixLength,
    ),
  );
  const previousRootSize = React.useRef<RoleRootSize | null>(null);
  const rootSizeAnimationFrame = React.useRef<number | null>(null);
  const rootSizeCleanupTimer = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    const root = rootElement.current;
    const sizing = sizingElement.current;

    if (!root || !sizing) return;

    const previousSize = previousRootSize.current;
    const visualSize = measureElementSize(root);
    const hadPinnedWidth = root.style.width !== "";

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

    root.style.transitionProperty = "width";
    root.style.transitionDuration = `${rootTransitionDuration}ms`;
    root.style.transitionTimingFunction = easeOutStrongCss;

    rootSizeAnimationFrame.current = window.requestAnimationFrame(() => {
      rootSizeAnimationFrame.current = null;
      root.style.width = `${nextSize.width}px`;
    });

    rootSizeCleanupTimer.current = window.setTimeout(() => {
      rootSizeCleanupTimer.current = null;
      clearRootSizeStyles(root);
    }, rootTransitionDuration + 80);
  }, [activeRole, previousText, reduceMotion, rootTransitionDuration, transitionState.version]);

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
      className={cn(
        "relative isolate inline-grid w-fit overflow-visible py-1 leading-tight",
        className,
      )}
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
        stablePrefixLength={stablePrefixLength}
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
          characters={characters}
          setSlotRef={setSlotRef}
          stablePrefixLength={stablePrefixLength}
          transitionKey={transitionKey}
          variants={variants}
        />
      </span>
    </motion.span>
  );
}

export { RoleMotion, defaultRoleMotionRoles };
export type { RoleMotionProps };
