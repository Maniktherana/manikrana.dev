import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { cn } from "@manikrana/ui/lib/utils";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { Glass } from "./glass";
import { settle } from "./springs";

type GlassSegmentedProps = Omit<
  RadioGroup.Props,
  "className" | "defaultValue" | "onValueChange" | "style" | "value"
> & {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  style?: CSSProperties;
  value?: string;
};

type GlassSegmentedItemProps = Omit<Radio.Root.Props, "className" | "value"> & {
  children: ReactNode;
  className?: string;
  value: string;
};

const SEGMENT = 56;
const HALF = 28;
const INSET = 4;
const GIVE = 40;
const PRESS = { grow: 1.02, pull: 0.025, stretch: 0.03 };

function band(distance: number) {
  return distance / (1 + distance / GIVE);
}

function GlassSegmented({
  children,
  className,
  defaultValue,
  onValueChange,
  style,
  value,
  ...props
}: GlassSegmentedProps) {
  const root = useRef<HTMLDivElement>(null);
  const stretch = useMotionValue(0);
  const side = useRef(1);
  const reduceMotion = useReducedMotion();
  const values = Children.toArray(children)
    .filter(isValidElement<GlassSegmentedItemProps>)
    .map((child) => child.props.value);
  const [local, setLocal] = useState(defaultValue ?? values[0]);
  const current = value ?? local;
  const [lens, setLens] = useState<{ x: number; jumping: boolean } | null>(null);
  const end = (values.length - 1) * SEGMENT;
  const x = lens ? lens.x : Math.max(0, values.indexOf(current ?? "")) * SEGMENT;

  useEffect(
    () =>
      stretch.on("change", (amount) => {
        const node = root.current;
        if (!node) return;
        node.style.translate = `${side.current * amount * 50}% 0`;
        node.style.scale = `${1 + amount} ${1 - amount * 0.5}`;
        for (const item of node.querySelectorAll<HTMLElement>("[data-counter]")) {
          item.style.scale = `${1 / (1 + amount)} ${1 / (1 - amount * 0.5)}`;
        }
      }),
    [stretch],
  );

  function select(next: string) {
    setLocal(next);
    onValueChange?.(next);
  }

  function place(clientX: number) {
    const node = root.current;
    if (!node) return 0;
    const box = node.getBoundingClientRect();
    const zoom = node.offsetWidth / box.width || 1;
    return Math.min(end, Math.max(0, (clientX - box.left) * zoom - INSET - HALF));
  }

  function press(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    stretch.stop();
    let at = place(event.clientX);
    setLens({ x: at, jumping: true });
    const box = event.currentTarget.getBoundingClientRect();

    const follow = (next: globalThis.PointerEvent) => {
      at = place(next.clientX);
      setLens({ x: at, jumping: false });
      const over = box.left - next.clientX;
      const under = next.clientX - box.right;
      if (over > 0) side.current = -1;
      else if (under > 0) side.current = 1;
      stretch.set((band(Math.max(over, under, 0)) / box.width) * 0.4);
    };
    const drop = (next: globalThis.PointerEvent) => {
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", drop);
      setLens(null);
      animate(
        stretch,
        0,
        reduceMotion ? { duration: 0 } : { ...settle, velocity: stretch.getVelocity() },
      );
      const nearest = values[Math.round(at / SEGMENT)];
      if (next.type === "pointerup" && nearest !== undefined && nearest !== current) {
        select(nearest);
      }
    };
    window.addEventListener("pointermove", follow);
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);
  }

  return (
    <Glass
      ref={root}
      magnetic={PRESS}
      light={false}
      onPointerDown={press}
      style={style}
      className={cn("flex h-12 w-fit rounded-full p-1", className)}
      render={
        <RadioGroup {...props} value={current} onValueChange={(next) => select(next as string)} />
      }
    >
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ x }}
        transition={
          reduceMotion || (lens && !lens.jumping)
            ? { duration: 0 }
            : lens
              ? { duration: 0.15, ease: "easeOut" }
              : settle
        }
        className="pointer-events-none absolute top-1 left-1 -z-10 h-10 w-14 rounded-full bg-(--glass-lens) [mix-blend-mode:var(--glass-lens-blend)]"
      />
      {children}
    </Glass>
  );
}

function GlassSegmentedItem({ children, className, ...props }: GlassSegmentedItemProps) {
  return (
    <Radio.Root
      {...props}
      className={cn(
        "grid h-10 w-14 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        className,
      )}
    >
      <span data-counter className="grid">
        {children}
      </span>
    </Radio.Root>
  );
}

GlassSegmented.Item = GlassSegmentedItem;

export { GlassSegmented };
export type { GlassSegmentedItemProps, GlassSegmentedProps };
