import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@manikrana/ui/lib/utils";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { GlassGoo, GlassLight, GlassRim } from "./glass";
import { Crossfade } from "./glass-motion";
import { useMagnetic } from "./magnetic";
import { gather, reveal } from "./springs";

type GlassActionsProps = {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

type GlassActionsTriggerProps = {
  children: ReactNode;
  label: string;
};

type GlassActionsActionProps = {
  children: ReactNode;
  closeOnClick?: boolean;
  label: string;
  onClick?: () => void;
};

function GlassActionsTrigger(_: GlassActionsTriggerProps) {
  return null;
}

function GlassActionsAction(_: GlassActionsActionProps) {
  return null;
}

const STEP = 60;
function GlassActions({
  children,
  className,
  defaultOpen = false,
  onOpenChange,
  open: openProp,
}: GlassActionsProps) {
  const parts = Children.toArray(children).filter(isValidElement);
  const trigger = parts.find((part) => part.type === GlassActionsTrigger)?.props as
    | GlassActionsTriggerProps
    | undefined;
  const actions = parts
    .filter((part) => part.type === GlassActionsAction)
    .map((part) => part.props as GlassActionsActionProps);
  const icon = trigger?.children;
  const label = trigger?.label ?? "";
  const root = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const liquid = `liquid${useId().replace(/[^\w-]/g, "")}`;
  const [body, setBody] = useState<SVGGElement | null>(null);
  const [frost, setFrost] = useState<HTMLDivElement | null>(null);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = openProp ?? localOpen;
  const [shown, setShown] = useState(open);
  const [moved, setMoved] = useState(false);

  if (shown !== open) {
    setShown(open);
    setMoved(true);
  }

  function setOpen(next: boolean, fromKeyboard = false) {
    setLocalOpen(next);
    onOpenChange?.(next);
    if (!next && fromKeyboard) root.current?.querySelectorAll("button")[anchor]?.focus();
  }

  const anchor = actions.length - 1;

  return (
    <div
      ref={root}
      data-sway={moved && !open ? "recoil" : undefined}
      style={{ "--count": actions.length } as CSSProperties}
      className={cn("relative h-11 w-[calc(var(--count)*--spacing(15)---spacing(4))]", className)}
    >
      <div ref={setFrost} aria-hidden="true" className="pointer-events-none absolute -inset-4">
        {!frost && (
          <span className="absolute top-4 right-4 size-11 rounded-full shadow-[var(--glass-lift)] [backdrop-filter:var(--glass-backdrop)]" />
        )}
      </div>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -top-4 -left-4 h-[calc(100%+--spacing(8))] w-[calc(100%+--spacing(8))] overflow-visible"
      >
        <GlassGoo id={liquid} x={-40} y={-40} width={actions.length * STEP + 96} height={156} />
        <g ref={setBody} filter={`url(#${liquid})`}>
          {!body && <circle cx={actions.length * STEP - 22} cy={38} r={21} fill="white" />}
        </g>
      </svg>
      {actions.map((action, index) => {
        const current = open
          ? { icon: action.children, label: action.label }
          : { icon: index === anchor ? icon : null, label };
        return (
          <Bubble
            key={index}
            icon={current.icon}
            label={current.label}
            body={body}
            frost={frost}
            center={actions.length * STEP - 22}
            offset={open ? (index - anchor) * STEP : 0}
            spread={reduceMotion ? { duration: 0 } : open ? reveal : gather}
            visible={index === anchor || open}
            sway={!moved ? undefined : open ? "split" : "merge"}
            onClick={(fromKeyboard) => {
              if (!open) return setOpen(true);
              action.onClick?.();
              if (action.closeOnClick) setOpen(false, fromKeyboard);
            }}
          />
        );
      })}
    </div>
  );
}

function Bubble({
  body,
  center,
  frost,
  icon,
  label,
  offset,
  onClick,
  spread,
  sway,
  visible,
}: {
  body: SVGGElement | null;
  center: number;
  frost: HTMLDivElement | null;
  icon: ReactNode;
  label: string;
  offset: number;
  onClick: (fromKeyboard: boolean) => void;
  spread: Transition;
  sway?: "split" | "merge";
  visible: boolean;
}) {
  const magnet = useMagnetic<HTMLButtonElement>({ grow: 1.1 });

  return (
    <>
      <motion.div
        inert={!visible}
        data-sway={sway}
        initial={false}
        animate={{ x: offset }}
        transition={spread}
        className={cn(
          "absolute top-0 right-0 size-11",
          visible
            ? "transition-opacity duration-50 ease-out"
            : "pointer-events-none opacity-0 transition-opacity delay-200 duration-100 ease-out",
        )}
      >
        <button
          ref={magnet.ref}
          type="button"
          aria-label={label}
          data-held={magnet.held || undefined}
          {...magnet.handlers}
          onClick={(event) => onClick(event.detail === 0)}
          className="magnetic group relative isolate grid size-full cursor-pointer touch-none place-items-center rounded-full text-(--glass-ink) select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <GlassRim />
          <GlassLight />
          <span className="col-start-1 row-start-1 grid">
            <Crossfade value={label} shrink>
              {icon}
            </Crossfade>
          </span>
        </button>
      </motion.div>
      {frost &&
        createPortal(
          <motion.div
            data-sway={sway}
            initial={false}
            animate={{ x: offset }}
            transition={spread}
            className={cn(
              "absolute top-4 right-4 size-11",
              !visible && "opacity-0 transition-opacity delay-350 duration-0",
            )}
          >
            <span
              ref={magnet.follow}
              className="magnetic block size-full rounded-full shadow-[var(--glass-lift)] [backdrop-filter:var(--glass-backdrop)]"
            />
          </motion.div>,
          frost,
        )}
      {body &&
        createPortal(
          <motion.g
            data-sway={sway}
            initial={false}
            animate={{ x: offset }}
            transition={spread}
            className={cn(
              "origin-center [transform-box:fill-box]",
              !visible && "opacity-0 transition-opacity delay-350 duration-0",
            )}
          >
            <circle
              ref={magnet.follow}
              cx={center}
              cy={38}
              r={21}
              fill="white"
              className="magnetic origin-center [transform-box:fill-box]"
            />
          </motion.g>,
          body,
        )}
    </>
  );
}

GlassActions.Trigger = GlassActionsTrigger;
GlassActions.Action = GlassActionsAction;

export { GlassActions };
export type { GlassActionsActionProps, GlassActionsProps, GlassActionsTriggerProps };
