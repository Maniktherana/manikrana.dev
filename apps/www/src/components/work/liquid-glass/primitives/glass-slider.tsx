import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Slider } from "@base-ui/react/slider";
import { cn } from "@manikrana/ui/lib/utils";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { GlassRim } from "./glass";
import { settle } from "./springs";

type GlassSliderProps = Omit<
  Slider.Root.Props<number>,
  "className" | "onValueChange" | "orientation" | "style"
> & {
  accent?: string;
  accentInk?: string;
  className?: string;
  end?: ReactNode;
  icon?: ReactNode | ((onFill: boolean) => ReactNode);
  onValueChange?: (value: number) => void;
  start?: ReactNode;
  style?: CSSProperties;
  variant?: "bar" | "tile";
};

const TILE = 124;
const ICON_BOTTOM = 14;
const ICON_SIZE = 28;
const GIVE = 40;
const SETTLE = 160;
const KNOB = 27;
const EASE_IN = 0.05;

function centre(progress: number) {
  return `(${KNOB / 2}px + ${progress} * (100% - ${KNOB}px))`;
}

function reach(progress: number) {
  if (progress <= EASE_IN) return `calc(${centre(EASE_IN)} * ${progress / EASE_IN})`;
  if (progress >= 1 - EASE_IN) {
    const t = (progress - (1 - EASE_IN)) / EASE_IN;
    return `calc(${centre(1 - EASE_IN)} + ${t} * (100% - ${centre(1 - EASE_IN)}))`;
  }
  return `calc${centre(progress)}`;
}

function band(distance: number) {
  return distance / (1 + distance / GIVE);
}

function GlassSlider({
  accent = "var(--glass-solid)",
  accentInk = "var(--glass-solid-ink)",
  className,
  defaultValue = 50,
  end,
  icon,
  max = 100,
  min = 0,
  onValueChange,
  start,
  style,
  value,
  variant = "bar",
  ...props
}: GlassSliderProps) {
  const [local, setLocal] = useState(defaultValue);
  const current = value ?? local;
  const tokens = { "--accent": accent, "--accent-ink": accentInk, ...style } as CSSProperties;
  const root = {
    ...props,
    min,
    max,
    value: current,
    onValueChange: (next: number | readonly number[]) => {
      const single = next as number;
      setLocal(single);
      onValueChange?.(single);
    },
  };

  if (variant === "tile") {
    return (
      <SliderTile
        root={root}
        className={className}
        style={tokens}
        icon={icon}
        filled={(current - min) / (max - min)}
      />
    );
  }

  return (
    <SliderBar
      root={root}
      className={className}
      style={tokens}
      start={start}
      end={end}
      filled={(current - min) / (max - min)}
    />
  );
}

type Parts = {
  className?: string;
  root: Slider.Root.Props<number>;
  style: CSSProperties;
};

function SliderTile({
  className,
  filled,
  icon,
  root,
  style,
}: Parts & { filled: number; icon?: GlassSliderProps["icon"] }) {
  const control = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const stretch = useMotionValue(0);
  const side = useRef(1);
  const reduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const covered = Math.min(ICON_SIZE, Math.max(0, filled * TILE - ICON_BOTTOM));
  const draw = (onFill: boolean) => (typeof icon === "function" ? icon(onFill) : icon);

  useEffect(
    () =>
      stretch.on("change", (amount) => {
        if (control.current) {
          control.current.style.translate = `0 ${side.current * amount * 50}%`;
          control.current.style.scale = `${1 - amount * 0.5} ${1 + amount}`;
        }
        if (counter.current) {
          counter.current.style.scale = `${1 / (1 - amount * 0.5)} ${1 / (1 + amount)}`;
        }
      }),
    [stretch],
  );

  function press(node: HTMLElement) {
    stretch.stop();
    setDragging(true);
    const follow = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const over = box.top - event.clientY;
      const under = event.clientY - box.bottom;
      if (over > 0) side.current = -1;
      else if (under > 0) side.current = 1;
      stretch.set((band(Math.max(over, under, 0)) / box.height) * 0.4);
    };
    const drop = () => {
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", drop);
      setDragging(false);
      animate(
        stretch,
        0,
        reduceMotion ? { duration: 0 } : { ...settle, velocity: stretch.getVelocity() },
      );
    };
    window.addEventListener("pointermove", follow);
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);
  }

  return (
    <Slider.Root
      {...root}
      orientation="vertical"
      style={style}
      className={cn("w-fit touch-none select-none", className)}
    >
      <Slider.Control
        ref={control}
        onPointerDown={(event) => {
          if (event.button === 0) press(event.currentTarget);
        }}
        style={{ "--covered": `${covered}px` } as CSSProperties}
        className={cn(
          "relative block h-31 w-14 cursor-pointer rounded-full bg-(image:--glass-fill) shadow-[var(--glass-contact),var(--glass-lift)] [backdrop-filter:var(--glass-backdrop)] has-focus-visible:outline-2 has-focus-visible:outline-ring focus-visible:outline-offset-2",
        )}
      >
        <Slider.Track className="size-full overflow-hidden rounded-full">
          <GlassRim />
          <Slider.Indicator
            className={cn(
              "w-full bg-(--accent)",
              !dragging && "transition-[height] duration-150 ease-out",
            )}
          />
        </Slider.Track>
        <Slider.Thumb className="h-0 w-full" />
        {icon && (
          <span
            aria-hidden="true"
            ref={counter}
            className="pointer-events-none absolute inset-x-0 bottom-3.5 grid h-7 place-items-center"
          >
            <span className="col-start-1 row-start-1 grid text-(--glass-ink) [clip-path:inset(-6px_-6px_var(--covered)_-6px)]">
              {draw(false)}
            </span>
            <span className="col-start-1 row-start-1 grid text-(--accent-ink) [clip-path:inset(calc(100%-var(--covered))_-6px_-6px_-6px)]">
              {draw(true)}
            </span>
          </span>
        )}
      </Slider.Control>
    </Slider.Root>
  );
}

function SliderBar({
  className,
  end,
  filled,
  root,
  start,
  style,
}: Parts & { end?: ReactNode; filled: number; start?: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const timer = useRef(0);
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);

  function press() {
    window.clearTimeout(timer.current);
    setActive(true);
    const release = () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      setDragging(false);
      timer.current = window.setTimeout(() => setActive(false), SETTLE);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
  }

  return (
    <div style={style} className={cn("flex items-center gap-2.5 text-(--glass-ink)", className)}>
      {start && <span className="grid shrink-0 opacity-60">{start}</span>}
      <Slider.Root
        {...root}
        onValueChange={(next, details) => {
          if (active) setDragging(true);
          root.onValueChange?.(next, details);
        }}
        className="min-w-0 flex-1 touch-none select-none"
      >
        <Slider.Control
          onPointerDown={(event) => {
            if (event.button === 0) press();
          }}
          className="flex h-7 cursor-pointer items-center"
        >
          <Slider.Track
            style={{ "--progress": filled } as CSSProperties}
            className="h-1.5 w-full rounded-full bg-(--glass-track)"
          >
            <span
              style={{ "--fill": reach(filled) } as CSSProperties}
              className={cn(
                "absolute inset-y-0 left-0 w-(--fill) rounded-full bg-(--accent)",
                !dragging && "transition-[width] duration-200 ease-out",
              )}
            />
            <Slider.Thumb
              data-active={active || undefined}
              render={
                <motion.div
                  initial={false}
                  animate={{ scale: active ? 1.28 : 1 }}
                  transition={reduceMotion ? { duration: 0 } : settle}
                />
              }
              className={cn(
                "group/knob h-[18px] w-[27px] rounded-full bg-white [inset-inline-start:calc(var(--progress)*(100%-27px)+13.5px)]! shadow-[0_1px_3px_rgb(0_0_0/0.3)] transition-[background-color,box-shadow] duration-180 ease-out has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring data-active:bg-white/8 data-active:shadow-[0_2px_8px_rgb(0_0_0/0.3)] data-active:[backdrop-filter:brightness(1.12)_saturate(1.15)] motion-reduce:transition-none",
                !dragging &&
                  "transition-[background-color,box-shadow,inset-inline-start] [transition-duration:180ms,180ms,200ms]",
              )}
            >
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-180 ease-out group-data-active/knob:opacity-100">
                <GlassRim />
              </span>
            </Slider.Thumb>
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      {end && <span className="grid shrink-0 opacity-60">{end}</span>}
    </div>
  );
}

export { GlassSlider };
export type { GlassSliderProps };
