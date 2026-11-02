import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Switch } from "@base-ui/react/switch";
import { cn } from "@manikrana/ui/lib/utils";
import { GlassRim } from "./glass";

type GlassSwitchProps = Omit<Switch.Root.Props, "className" | "style"> & {
  accent?: string;
  className?: string;
  style?: CSSProperties;
};

const TRAVEL = 20;
const SLOP = 3;
const SETTLE = 240;

function GlassSwitch({
  accent = "#34c759",
  checked,
  className,
  defaultChecked = false,
  onCheckedChange,
  onKeyDown,
  onPointerDown,
  style,
  ...props
}: GlassSwitchProps) {
  const timer = useRef(0);
  const moved = useRef(false);
  const [localChecked, setLocalChecked] = useState(defaultChecked);
  const [active, setActive] = useState(false);
  const [pointed, setPointed] = useState(false);
  const on = checked ?? localChecked;

  function set(next: boolean, details: Switch.Root.ChangeEventDetails) {
    setLocalChecked(next);
    onCheckedChange?.(next, details);
  }

  function press(event: PointerEvent<HTMLElement>) {
    onPointerDown?.(event as Parameters<NonNullable<typeof onPointerDown>>[0]);
    if (event.button !== 0 || props.disabled) return;
    setPointed(true);
    window.clearTimeout(timer.current);
    setActive(true);
    const start = event.clientX;
    const box = event.currentTarget.getBoundingClientRect();
    const middle = box.left + box.width / 2;
    let side = on;
    moved.current = false;
    const follow = (next: globalThis.PointerEvent) => {
      if (!moved.current && Math.abs(next.clientX - start) < SLOP) return;
      moved.current = true;
      const want = next.clientX > middle;
      if (want === side) return;
      side = want;
      set(want, { reason: "none", event: next } as unknown as Switch.Root.ChangeEventDetails);
    };
    const release = () => {
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      timer.current = window.setTimeout(() => setActive(false), SETTLE);
    };
    window.addEventListener("pointermove", follow);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
  }

  return (
    <Switch.Root
      {...props}
      checked={on}
      onCheckedChange={(next, details) => {
        if (moved.current) {
          moved.current = false;
          return;
        }
        set(next, details);
      }}
      onPointerDown={press}
      onKeyDown={(event) => {
        setPointed(false);
        onKeyDown?.(event);
      }}
      onBlur={() => setPointed(false)}
      data-active={active || undefined}
      data-pointed={pointed || undefined}
      style={
        {
          "--accent": accent,
          "--switch-x": `${on ? TRAVEL : 0}px`,
          "--lens": active ? 1 : 0,
          ...style,
        } as CSSProperties
      }
      className={cn(
        "group relative h-7 w-15 shrink-0 cursor-pointer touch-none rounded-full select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-pointed:outline-none data-disabled:cursor-default data-disabled:opacity-50 motion-reduce:transition-none",
        "[transition:--switch-x_var(--spring-settle-time)_var(--spring-settle),--lens_var(--spring-settle-time)_var(--spring-settle)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[rgb(120_120_128/0.36)] transition-[background-color] duration-200 ease-out group-data-checked:bg-(--accent)"
      />
      <Switch.Thumb className="absolute top-0.5 left-0.5 h-6 w-9 translate-x-(--switch-x) scale-[calc(1+var(--lens)*0.6)] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3)] transition-[background-color,box-shadow] duration-180 ease-out group-data-active:bg-white/8 group-data-active:shadow-[0_2px_8px_rgb(0_0_0/0.3)] group-data-active:[backdrop-filter:brightness(1.12)_saturate(1.15)] motion-reduce:transition-none">
        <span className="absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-180 ease-out group-data-active:opacity-100">
          <GlassRim />
        </span>
      </Switch.Thumb>
    </Switch.Root>
  );
}

export { GlassSwitch };
export type { GlassSwitchProps };
