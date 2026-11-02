import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { GlassLight, GlassRim } from "./primitives/glass";
import { useMagnetic } from "./primitives/magnetic";

type GlowPillProps = Omit<ComponentProps<"button">, "children"> & {
  action?: ReactNode;
  children?: ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

function GlowPill({
  action,
  children,
  className,
  defaultExpanded = false,
  expanded: expandedProp,
  onClick,
  onExpandedChange,
  style,
  ...props
}: GlowPillProps) {
  const glass = useMagnetic<HTMLButtonElement>();
  const tail = useRef<HTMLSpanElement>(null);
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const expanded = Boolean(action) && (expandedProp ?? localExpanded);
  const [room, setRoom] = useState(0);
  const was = useRef(expanded);
  const bump = useEffectEvent(() => glass.recoil(-1, 0, 0.1));

  useEffect(() => {
    if (was.current && !expanded) bump();
    was.current = expanded;
  }, [expanded]);

  useLayoutEffect(() => {
    const node = tail.current;
    if (!node) return;
    const measure = () => setRoom(node.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [action]);

  return (
    <button
      ref={glass.ref}
      type="button"
      aria-expanded={action ? expanded : undefined}
      data-held={glass.held || undefined}
      style={{ "--room": `${room}px`, ...style } as CSSProperties}
      {...glass.handlers}
      onClick={(event) => {
        setLocalExpanded(!expanded);
        onExpandedChange?.(!expanded);
        onClick?.(event);
      }}
      className={cn(
        "magnetic group relative isolate flex h-8 w-fit cursor-pointer touch-none items-center rounded-full bg-(image:--glass-fill) shadow-[var(--glass-contact),var(--glass-lift)] px-3.5 font-[family-name:system-ui] text-xs leading-4.5 font-medium whitespace-nowrap text-(--glass-ink) subpixel-antialiased [backdrop-filter:var(--glass-backdrop)] transition-[margin-inline-end] duration-(--spring-reveal-time) ease-(--spring-reveal) select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 aria-expanded:-me-(--room) motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <GlassRim />
      <GlassLight />
      <span>{children}</span>
      {action && (
        <span className="flex w-0 overflow-hidden transition-[width] duration-(--spring-reveal-time) ease-(--spring-reveal) group-aria-expanded:w-(--room) motion-reduce:transition-none">
          <span
            ref={tail}
            aria-hidden={!expanded}
            className="flex shrink-0 items-center gap-3.5 ps-3.5 opacity-0 blur-[5px] transition-[opacity,filter] duration-200 ease-out group-aria-expanded:opacity-100 group-aria-expanded:blur-none motion-reduce:blur-none"
          >
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-current/10" />
            <span>{action}</span>
          </span>
        </span>
      )}
    </button>
  );
}

export { GlowPill };
export type { GlowPillProps };
