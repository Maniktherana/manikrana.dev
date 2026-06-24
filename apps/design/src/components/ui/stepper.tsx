"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import {
  useAutoPlay,
  useStepperAutoPlay,
  type UseAutoPlayOptions,
  type UseAutoPlayReturn,
  type UseStepperAutoPlayOptions,
  type UseStepperAutoPlayReturn,
} from "@/components/ui/hooks/use-stepper-auto-play";
import { cn } from "@/lib/utils";

type StepperOrientation = "horizontal" | "vertical";
type StepPhase = "entering" | "stable" | "exiting";

type AnimatingStep = {
  index: number;
  key: number;
  phase: StepPhase;
};

type StepperContextValue = {
  active: number;
  collapseDuration: number;
  count: number;
  disabled: boolean;
  easing: string;
  fillDuration: number;
  filling: boolean;
  maxVisible?: number;
  orientation: StepperOrientation;
  readOnly: boolean;
  setValue: (value: number) => void;
  stepLabel?: (index: number, count: number) => string;
  steps: AnimatingStep[];
  transitionDuration: number;
};

type StepperStepContextValue = {
  filling: boolean;
  orientation: StepperOrientation;
};

type StepperProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
  active?: number;
  count: number;
  defaultValue?: number;
  disabled?: boolean;
  easing?: string;
  fillDuration?: number;
  filling?: boolean;
  maxVisible?: number;
  onStepClick?: (value: number) => void;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  readOnly?: boolean;
  stepLabel?: (index: number, count: number) => string;
  transitionDuration?: number;
  value?: number;
};

type StepperTrackProps = ComponentProps<"div">;

type StepperStepProps = Omit<ComponentProps<"button">, "children"> & {
  children?: ComponentProps<"button">["children"];
  index: number;
  phase?: StepPhase;
};

type StepperIndicatorProps = ComponentProps<"span">;

type StepperFillProps = ComponentProps<"span">;

const DOT_SIZE = 8;
const ACTIVE_SIZE = 24;
const GAP = 6;
const DEFAULT_EASING = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const DEFAULT_TRANSITION_DURATION = 500;
const DEFAULT_FILL_DURATION = 3000;

const StepperContext = createContext<StepperContextValue | null>(null);
const StepperStepContext = createContext<StepperStepContextValue | null>(null);

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function useStepperContext(component: string) {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error(`${component} must be used within Stepper`);
  }

  return context;
}

function useStepperStepContext(component: string) {
  const context = useContext(StepperStepContext);

  if (!context) {
    throw new Error(`${component} must be used within StepperStep`);
  }

  return context;
}

function clampStep(value: number, count: number) {
  if (!Number.isFinite(value) || count <= 0) return 0;

  return Math.min(Math.max(Math.trunc(value), 0), count - 1);
}

function normalizeCount(count: number) {
  if (!Number.isFinite(count)) return 0;

  return Math.max(0, Math.trunc(count));
}

function getStepWindow({
  active,
  count,
  maxVisible,
  orientation,
}: {
  active: number;
  count: number;
  maxVisible: number | undefined;
  orientation: StepperOrientation;
}) {
  const visibleCount = maxVisible == null ? undefined : Math.max(1, Math.trunc(maxVisible));

  if (visibleCount == null || count <= visibleCount) {
    return {
      containerSize: undefined,
      transformValue: "none",
    };
  }

  const half = Math.floor(visibleCount / 2);
  const windowStart = Math.max(0, Math.min(active - half, count - visibleCount));
  const offset = windowStart * (DOT_SIZE + GAP);
  const axis = orientation === "vertical" ? "Y" : "X";
  const containerSize = (visibleCount - 1) * DOT_SIZE + ACTIVE_SIZE + (visibleCount - 1) * GAP;

  return {
    containerSize,
    transformValue: `translate${axis}(-${offset}px)`,
  };
}

class StepAnimator {
  private keyGen: number;
  private steps: AnimatingStep[];

  constructor(count: number) {
    this.keyGen = count;
    this.steps = Array.from({ length: count }, (_, index) => ({
      index,
      key: index,
      phase: "stable",
    }));
  }

  reconcile(nextCount: number) {
    const liveCount = this.steps.filter((step) => step.phase !== "exiting").length;

    if (nextCount < liveCount) {
      let seen = 0;

      this.steps = this.steps.map((step) => {
        if (step.phase === "exiting") return step;

        seen += 1;

        return seen > nextCount ? { ...step, phase: "exiting" } : step;
      });
    }

    if (nextCount > liveCount) {
      for (let index = liveCount; index < nextCount; index += 1) {
        this.keyGen += 1;
        this.steps.push({
          index,
          key: this.keyGen,
          phase: "entering",
        });
      }
    }

    let index = 0;
    this.steps = this.steps.map((step) =>
      step.phase === "exiting" ? step : { ...step, index: index++ },
    );
  }

  getSteps() {
    return [...this.steps];
  }

  promoteEntering() {
    this.steps = this.steps.map((step) =>
      step.phase === "entering" ? { ...step, phase: "stable" } : step,
    );
  }

  removeExiting() {
    this.steps = this.steps.filter((step) => step.phase !== "exiting");
  }
}

function useAnimatingSteps(count: number, collapseDuration: number) {
  const animatorRef = useRef<StepAnimator | null>(null);

  if (animatorRef.current === null) {
    animatorRef.current = new StepAnimator(count);
  }

  const animator = animatorRef.current;
  const [steps, setSteps] = useState<AnimatingStep[]>(() => animator.getSteps());

  useIsomorphicLayoutEffect(() => {
    animator.reconcile(count);
    setSteps(animator.getSteps());
  }, [animator, count]);

  const hasEntering = steps.some((step) => step.phase === "entering");

  useEffect(() => {
    if (!hasEntering) return undefined;

    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        animator.promoteEntering();
        setSteps(animator.getSteps());
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [animator, hasEntering]);

  const exitingCount = steps.filter((step) => step.phase === "exiting").length;

  useEffect(() => {
    if (exitingCount === 0) return undefined;

    const timer = window.setTimeout(() => {
      animator.removeExiting();
      setSteps(animator.getSteps());
    }, collapseDuration + 50);

    return () => window.clearTimeout(timer);
  }, [animator, collapseDuration, exitingCount]);

  return steps;
}

function focusStep(button: HTMLButtonElement, index: number) {
  window.requestAnimationFrame(() => {
    const root = button.closest<HTMLElement>("[data-slot='stepper']");
    const nextButton = root?.querySelector<HTMLButtonElement>(
      `[data-slot='stepper-step'][data-index="${index}"]`,
    );

    nextButton?.focus();
  });
}

function Stepper({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  active,
  children,
  className,
  count,
  defaultValue = 0,
  disabled = false,
  easing = DEFAULT_EASING,
  fillDuration = DEFAULT_FILL_DURATION,
  filling = false,
  maxVisible,
  onKeyDown,
  onStepClick,
  onValueChange,
  orientation = "horizontal",
  readOnly = false,
  stepLabel,
  transitionDuration = DEFAULT_TRANSITION_DURATION,
  value,
  ...props
}: StepperProps) {
  const safeCount = normalizeCount(count);
  const controlledValue = value ?? active;
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    clampStep(defaultValue, safeCount),
  );
  const currentValue = clampStep(isControlled ? controlledValue : uncontrolledValue, safeCount);
  const collapseDuration = Math.max(1, Math.min(transitionDuration, 250));
  const steps = useAnimatingSteps(safeCount, collapseDuration);

  useEffect(() => {
    if (isControlled) return;

    setUncontrolledValue((current) => clampStep(current, safeCount));
  }, [isControlled, safeCount]);

  const setValue = useCallback(
    (nextValue: number) => {
      const next = clampStep(nextValue, safeCount);

      if (!isControlled) {
        setUncontrolledValue(next);
      }

      onValueChange?.(next);
      onStepClick?.(next);
    },
    [isControlled, onStepClick, onValueChange, safeCount],
  );

  const contextValue = useMemo<StepperContextValue>(
    () => ({
      active: currentValue,
      collapseDuration,
      count: safeCount,
      disabled,
      easing,
      fillDuration,
      filling,
      maxVisible,
      orientation,
      readOnly,
      setValue,
      stepLabel,
      steps,
      transitionDuration,
    }),
    [
      collapseDuration,
      currentValue,
      disabled,
      easing,
      fillDuration,
      filling,
      maxVisible,
      orientation,
      readOnly,
      safeCount,
      setValue,
      stepLabel,
      steps,
      transitionDuration,
    ],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        aria-disabled={disabled || undefined}
        aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? "Progress steps")}
        aria-labelledby={ariaLabelledBy}
        aria-orientation={orientation}
        data-disabled={disabled ? "true" : undefined}
        data-orientation={orientation}
        data-readonly={readOnly ? "true" : undefined}
        data-slot="stepper"
        role="tablist"
        tabIndex={-1}
        className={cn(
          "inline-flex shrink-0 rounded-full bg-muted px-2.5 py-1.5 text-foreground shadow-[var(--shadow-control)] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          className,
        )}
        onKeyDown={onKeyDown}
        {...props}
      >
        {children ?? <StepperTrack />}
      </div>
    </StepperContext.Provider>
  );
}

function StepperTrack({ children, className, style, ...props }: StepperTrackProps) {
  const { active, count, maxVisible, orientation, steps, transitionDuration, easing } =
    useStepperContext("StepperTrack");
  const windowState = getStepWindow({
    active,
    count,
    maxVisible,
    orientation,
  });

  return (
    <div
      data-slot="stepper-viewport"
      className="overflow-hidden"
      style={{
        ...(windowState.containerSize != null
          ? orientation === "vertical"
            ? { height: windowState.containerSize }
            : { width: windowState.containerSize }
          : undefined),
      }}
    >
      <div
        data-orientation={orientation}
        data-slot="stepper-track"
        className={cn(
          "flex items-center transition-transform motion-reduce:transition-none data-[orientation=vertical]:flex-col",
          className,
        )}
        style={{
          marginLeft: orientation === "horizontal" ? -GAP : 0,
          marginTop: orientation === "vertical" ? -GAP : 0,
          transform: windowState.transformValue,
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: easing,
          ...style,
        }}
        {...props}
      >
        {children ??
          steps.map((step) => <StepperStep key={step.key} index={step.index} phase={step.phase} />)}
      </div>
    </div>
  );
}

function StepperStep({
  children,
  className,
  disabled,
  index,
  onClick,
  onKeyDown,
  phase = "stable",
  style,
  ...props
}: StepperStepProps) {
  const {
    active,
    collapseDuration,
    count,
    disabled: rootDisabled,
    easing,
    filling,
    orientation,
    readOnly,
    setValue,
    stepLabel,
    transitionDuration,
  } = useStepperContext("StepperStep");
  const isActive = index === active;
  const isCollapsed = phase !== "stable";
  const isDisabled = rootDisabled || disabled;
  const isFilling = isActive && filling;

  const stepStyle = {
    height:
      isCollapsed && orientation === "vertical"
        ? 0
        : isActive && orientation === "vertical"
          ? ACTIVE_SIZE
          : DOT_SIZE,
    marginLeft: orientation === "horizontal" && !isCollapsed ? GAP : 0,
    marginTop: orientation === "vertical" && !isCollapsed ? GAP : 0,
    opacity: isCollapsed ? 0 : 1,
    transform: isCollapsed ? "scale(0)" : "scale(1)",
    transitionDuration: `${isCollapsed ? collapseDuration : transitionDuration}ms`,
    transitionTimingFunction: easing,
    width:
      isCollapsed && orientation === "horizontal"
        ? 0
        : isActive && orientation === "horizontal"
          ? ACTIVE_SIZE
          : DOT_SIZE,
    ...style,
  } satisfies CSSProperties;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled || readOnly || count <= 0) {
        onKeyDown?.(event);
        return;
      }

      const horizontalPrevious = event.key === "ArrowLeft";
      const horizontalNext = event.key === "ArrowRight";
      const verticalPrevious = event.key === "ArrowUp";
      const verticalNext = event.key === "ArrowDown";
      let next: number | undefined;

      if (
        (orientation === "horizontal" && horizontalPrevious) ||
        (orientation === "vertical" && verticalPrevious)
      ) {
        next = Math.max(index - 1, 0);
      } else if (
        (orientation === "horizontal" && horizontalNext) ||
        (orientation === "vertical" && verticalNext)
      ) {
        next = Math.min(index + 1, count - 1);
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = count - 1;
      }

      if (next !== undefined) {
        event.preventDefault();
        setValue(next);
        focusStep(event.currentTarget, next);
      }

      onKeyDown?.(event);
    },
    [count, index, isDisabled, onKeyDown, orientation, readOnly, setValue],
  );

  return (
    <StepperStepContext.Provider value={{ filling: isFilling, orientation }}>
      <button
        aria-label={stepLabel?.(index, count) ?? `Step ${index + 1}`}
        aria-selected={isActive}
        data-active={isActive ? "true" : "false"}
        data-filling={isFilling ? "true" : "false"}
        data-index={index}
        data-orientation={orientation}
        data-phase={phase}
        data-slot="stepper-step"
        disabled={isDisabled}
        role="tab"
        style={stepStyle}
        tabIndex={isDisabled ? -1 : isActive ? 0 : -1}
        type="button"
        className={cn(
          "group/stepper-step relative isolate shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 outline-none transition-[width,height,margin-left,margin-top,opacity,transform] transform-gpu [backface-visibility:hidden] before:absolute before:-inset-x-2 before:-inset-y-2 before:content-[''] disabled:cursor-not-allowed motion-reduce:transition-none",
          "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        onClick={(event) => {
          if (!readOnly) setValue(index);
          onClick?.(event);
        }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children ?? <StepperIndicator />}
      </button>
    </StepperStepContext.Provider>
  );
}

function StepperIndicator({ children, className, ...props }: StepperIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-slot="stepper-indicator"
      className={cn(
        "absolute inset-0 overflow-hidden rounded-full bg-muted-foreground/25 transition-colors duration-150 ease-out group-hover/stepper-step:bg-muted-foreground/35",
        "group-data-[active=true]/stepper-step:bg-primary group-data-[active=true]/stepper-step:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_18%)]",
        className,
      )}
      {...props}
    >
      {children ?? <StepperFill />}
    </span>
  );
}

function StepperFill({ className, style, ...props }: StepperFillProps) {
  const { filling, orientation } = useStepperStepContext("StepperFill");
  const { fillDuration } = useStepperContext("StepperFill");
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!filling) {
      setFilled(false);
      return undefined;
    }

    let firstFrame = 0;
    let secondFrame = 0;

    setFilled(false);
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setFilled(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [filling, fillDuration]);

  return (
    <span
      aria-hidden="true"
      data-orientation={orientation}
      data-slot="stepper-fill"
      className={cn(
        "absolute top-0 left-0 rounded-[inherit] bg-primary-foreground/45 transition-[width,height] ease-linear motion-reduce:transition-none data-[orientation=horizontal]:bottom-0 data-[orientation=vertical]:right-0",
        className,
      )}
      style={{
        height: orientation === "vertical" ? (filling && filled ? "100%" : 0) : undefined,
        transitionDuration: filling ? `${fillDuration}ms` : "0ms",
        width: orientation === "horizontal" ? (filling && filled ? "100%" : 0) : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

export {
  Stepper,
  StepperFill,
  StepperIndicator,
  StepperStep,
  StepperTrack,
  useAutoPlay,
  useStepperAutoPlay,
  type StepperFillProps,
  type StepperIndicatorProps,
  type StepperProps,
  type StepperStepProps,
  type StepperTrackProps,
  type UseAutoPlayOptions,
  type UseAutoPlayReturn,
  type UseStepperAutoPlayOptions,
  type UseStepperAutoPlayReturn,
};
