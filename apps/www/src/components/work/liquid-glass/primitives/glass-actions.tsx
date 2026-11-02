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
import { GlassGoo, GlassLight, GlassRim } from "./glass";
import { Crossfade } from "./glass-motion";
import { useMagnetic } from "./magnetic";

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
      className={cn(
        "relative h-11 w-[calc(var(--count)*--spacing(15)---spacing(4))] motion-reduce:[--spread-time:0s]",
        open
          ? "[--spread-time:var(--spring-reveal-time)] [--spread:var(--spring-reveal)]"
          : "[--spread-time:var(--spring-gather-time)] [--spread:var(--spring-gather)]",
        className,
      )}
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
  sway?: "split" | "merge";
  visible: boolean;
}) {
  const magnet = useMagnetic<HTMLButtonElement>({ grow: 1.1 });
  const place = { "--offset": `${offset}px` } as CSSProperties;

  return (
    <>
      <div
        inert={!visible}
        data-sway={sway}
        style={place}
        className={cn(
          "absolute top-0 right-0 size-11 translate-x-(--offset)",
          visible
            ? "[transition:translate_var(--spread-time)_var(--spread),opacity_50ms_ease-out]"
            : "pointer-events-none opacity-0 [transition:translate_var(--spread-time)_var(--spread),opacity_100ms_ease-out_200ms]",
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
          {/* The same rim as every glass button; the goo filter only draws the fill and shadow. */}
          <GlassRim />
          <GlassLight />
          <span className="col-start-1 row-start-1 grid">
            <Crossfade value={label} shrink>
              {icon}
            </Crossfade>
          </span>
        </button>
      </div>
      {frost &&
        createPortal(
          <div
            data-sway={sway}
            style={place}
            className={cn(
              "absolute top-4 right-4 size-11 translate-x-(--offset)",
              visible
                ? "[transition:translate_var(--spread-time)_var(--spread)]"
                : "opacity-0 [transition:translate_var(--spread-time)_var(--spread),opacity_0s_350ms]",
            )}
          >
            <span
              ref={magnet.follow}
              className="magnetic block size-full rounded-full shadow-[var(--glass-lift)] [backdrop-filter:var(--glass-backdrop)]"
            />
          </div>,
          frost,
        )}
      {body &&
        createPortal(
          <g
            data-sway={sway}
            style={place}
            className={cn(
              "origin-center translate-x-(--offset) [transform-box:fill-box]",
              visible
                ? "[transition:translate_var(--spread-time)_var(--spread)]"
                : "opacity-0 [transition:translate_var(--spread-time)_var(--spread),opacity_0s_350ms]",
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
          </g>,
          body,
        )}
    </>
  );
}

GlassActions.Trigger = GlassActionsTrigger;
GlassActions.Action = GlassActionsAction;

export { GlassActions };
export type { GlassActionsActionProps, GlassActionsProps, GlassActionsTriggerProps };
