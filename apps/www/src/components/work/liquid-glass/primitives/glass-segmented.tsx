import {
  Children,
  createContext,
  isValidElement,
  use,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { cn } from "@manikrana/ui/lib/utils";
import { Glass } from "./glass";

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

const Stretch = createContext(false);

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
  const values = Children.toArray(children)
    .filter(isValidElement<GlassSegmentedItemProps>)
    .map((child) => child.props.value);
  const [local, setLocal] = useState(defaultValue ?? values[0]);
  const current = value ?? local;
  const [lens, setLens] = useState<{ x: number; jumping: boolean } | null>(null);
  const [pull, setPull] = useState<number | null>(null);
  const [from, setFrom] = useState<"left" | "right">("left");
  const end = (values.length - 1) * SEGMENT;
  const x = lens ? lens.x : Math.max(0, values.indexOf(current ?? "")) * SEGMENT;

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
    let at = place(event.clientX);
    setLens({ x: at, jumping: true });
    const box = event.currentTarget.getBoundingClientRect();

    const follow = (next: globalThis.PointerEvent) => {
      at = place(next.clientX);
      setLens({ x: at, jumping: false });
      const over = box.left - next.clientX;
      const under = next.clientX - box.right;
      if (over > 0) {
        setFrom("right");
        setPull((band(over) / box.width) * 0.4);
      } else if (under > 0) {
        setFrom("left");
        setPull((band(under) / box.width) * 0.4);
      } else setPull(0);
    };
    const release = (next: globalThis.PointerEvent) => {
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      setLens(null);
      setPull(null);
      const nearest = values[Math.round(at / SEGMENT)];
      if (next.type === "pointerup" && nearest !== undefined && nearest !== current) {
        select(nearest);
      }
    };
    window.addEventListener("pointermove", follow);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
  }

  return (
    <Stretch value={pull !== null}>
      <Glass
        ref={root}
        magnetic={PRESS}
        light={false}
        onPointerDown={press}
        style={{ "--stretch": pull ?? 0, ...style } as CSSProperties}
        className={cn(
          "flex h-12 w-fit scale-x-[calc(1+var(--stretch))] scale-y-[calc(1-var(--stretch)*0.5)] rounded-full p-1",
          from === "right" ? "origin-right" : "origin-left",
          pull !== null
            ? "transition-none"
            : "[transition:scale_var(--spring-settle-time)_var(--spring-settle)] motion-reduce:transition-none",
          className,
        )}
        render={
          <RadioGroup {...props} value={current} onValueChange={(next) => select(next as string)} />
        }
      >
        <span
          aria-hidden="true"
          style={{ "--x": `${x}px` } as CSSProperties}
          className={cn(
            "pointer-events-none absolute top-1 left-1 -z-10 h-10 w-14 translate-x-(--x) rounded-full bg-(--glass-lens) [mix-blend-mode:var(--glass-lens-blend)] motion-reduce:transition-none",
            !lens && "[transition:translate_var(--spring-settle-time)_var(--spring-settle)]",
            lens?.jumping && "transition-[translate] duration-150 ease-out",
          )}
        />
        {children}
      </Glass>
    </Stretch>
  );
}

function GlassSegmentedItem({ children, className, ...props }: GlassSegmentedItemProps) {
  const stretching = use(Stretch);

  return (
    <Radio.Root
      {...props}
      className={cn(
        "grid h-10 w-14 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        className,
      )}
    >
      <span
        className={cn(
          "grid scale-x-[calc(1/(1+var(--stretch)))] scale-y-[calc(1/(1-var(--stretch)*0.5))]",
          stretching
            ? "transition-none"
            : "[transition:scale_var(--spring-settle-time)_var(--spring-settle)] motion-reduce:transition-none",
        )}
      >
        {children}
      </span>
    </Radio.Root>
  );
}

GlassSegmented.Item = GlassSegmentedItem;

export { GlassSegmented };
export type { GlassSegmentedItemProps, GlassSegmentedProps };
