import {
  Children,
  createContext,
  isValidElement,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Menu } from "@base-ui/react/menu";
import { cn } from "@manikrana/ui/lib/utils";
import { animate, motion } from "motion/react";
import { GlassLight, GlassRim } from "./glass";
import { GlassButton } from "./glass-button";
import { Crossfade } from "./glass-motion";
import { useMagnetic, useReducedMotion } from "./magnetic";
import { menuClose, menuOpen, resize } from "./springs";

type GlassMenuProps = Omit<Menu.Root.Props, "modal"> & {
  modal?: boolean;
};

type GlassMenuTriggerProps = Omit<Menu.Trigger.Props, "className" | "children"> & {
  children: ReactNode;
  className?: string;
  value?: string;
};

type GlassMenuPopupProps = {
  "aria-label"?: string;
  align?: "start" | "center" | "end";
  children: ReactNode;
  className?: string;
  container?: RefObject<HTMLElement | null>;
  side?: "top" | "bottom";
};

type MenuState = {
  covered: boolean;
  natural: RefObject<HTMLSpanElement | null>;
  onClosed: () => void;
  open: boolean;
  reduceMotion: boolean;
  setOpen: (open: boolean) => void;
  trigger: RefObject<ReactNode>;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const TALL = 44;
const WIDTH = 200;
const ROW = 36;
const INSET = 10;
const SEPARATOR = 9;
const LABEL = 24;
const ROUND = ROW / 2 + INSET;

const MenuContext = createContext<MenuState | null>(null);

function useMenu() {
  const state = use(MenuContext);
  if (!state) throw new Error("GlassMenu parts must be inside <GlassMenu>.");
  return state;
}

function GlassMenu({
  children,
  defaultOpen = false,
  modal = false,
  onOpenChange,
  open: openProp,
  ...props
}: GlassMenuProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const actions = useRef<Menu.Root.Actions>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const natural = useRef<HTMLSpanElement>(null);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const trigger = useRef<ReactNode>(null);
  const open = openProp ?? localOpen;
  const [covered, setCovered] = useState(open);

  if (open && !covered) setCovered(true);

  function setOpen(next: boolean, details?: Menu.Root.ChangeEventDetails) {
    setLocalOpen(next);
    if (details) onOpenChange?.(next, details);
  }

  return (
    <MenuContext
      value={{
        covered,
        natural,
        onClosed: () => {
          actions.current?.unmount();
          setCovered(false);
        },
        open,
        reduceMotion,
        setOpen,
        trigger,
        triggerRef,
      }}
    >
      <Menu.Root
        {...props}
        open={open}
        onOpenChange={(next, details) => {
          if (next && details.event?.type === "mousedown") return;
          if (!next && !reduceMotion) details.preventUnmountOnClose();
          setOpen(next, details);
        }}
        actionsRef={actions}
        modal={modal}
      >
        {children}
      </Menu.Root>
    </MenuContext>
  );
}

function GlassMenuTrigger({ children, className, value, ...props }: GlassMenuTriggerProps) {
  const menu = useMenu();
  const { covered, natural, open, reduceMotion, setOpen, trigger, triggerRef } = menu;
  trigger.current = children;

  useLayoutEffect(() => {
    const node = natural.current;
    const button = triggerRef.current;
    if (!node || !button) return;
    let width = node.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (node.offsetWidth === width) return;
      width = node.offsetWidth;
      // Springs even while the menu covers it: the menu is anchored to the trigger, so a snap
      // here would jump the closing menu sideways.
      if (reduceMotion) return;
      animate(button, { width: [button.offsetWidth, width] }, resize);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [natural, triggerRef, reduceMotion]);

  return (
    <Menu.Trigger
      {...props}
      ref={triggerRef}
      onClick={(event) => {
        if (event.detail > 0 && !open) setOpen(true);
        props.onClick?.(event);
      }}
      render={
        <GlassButton
          magnetic
          className={cn(
            "min-w-11 px-0 font-[family-name:system-ui] font-normal subpixel-antialiased",
            covered && "opacity-0",
            className,
          )}
        />
      }
    >
      <span
        ref={natural}
        aria-hidden="true"
        className="invisible absolute grid h-11 w-max min-w-11 place-items-center whitespace-nowrap"
      >
        {children}
      </span>
      <span className="col-start-1 row-start-1 grid">
        <Crossfade value={value ?? "trigger"} className="whitespace-nowrap">
          {children}
        </Crossfade>
      </span>
    </Menu.Trigger>
  );
}

function stack(children: ReactNode): number {
  return Children.toArray(children).reduce<number>((sum, child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return sum;
    if (child.type === GlassMenuItem || child.type === GlassMenuRadioItem) return sum + ROW;
    if (child.type === GlassMenuSeparator) return sum + SEPARATOR;
    if (child.type === GlassMenuGroupLabel) return sum + LABEL;
    return sum + stack(child.props.children);
  }, 0);
}

function GlassMenuPopup({
  align = "start",
  children,
  className,
  container,
  side = "bottom",
  ...props
}: GlassMenuPopupProps) {
  const { natural, onClosed, open, reduceMotion, trigger, triggerRef } = useMenu();
  const tall = stack(children) + INSET * 2;

  return (
    <Menu.Portal container={container}>
      {/* The surface morphs out of the trigger on `side`, so a flipped popup would land elsewhere. */}
      <Menu.Positioner
        side={side}
        align={align}
        sideOffset={-TALL}
        collisionAvoidance={{ side: "none" }}
        collisionPadding={8}
        className="z-50 outline-none"
      >
        <Menu.Popup
          {...props}
          style={{ width: WIDTH, height: tall }}
          className={cn("relative outline-none", className)}
        >
          <Surface
            align={align}
            anchor={triggerRef}
            natural={() => natural.current?.offsetWidth ?? TALL}
            open={open}
            reduceMotion={reduceMotion}
            side={side}
            tall={tall}
            trigger={trigger.current}
            onClosed={onClosed}
          >
            {children}
          </Surface>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

type Styled<T> = Omit<T, "className"> & { className?: string };

function GlassMenuItem({ className, ...props }: Styled<Menu.Item.Props>) {
  return (
    <Menu.Item
      {...props}
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2.5 rounded-full px-3 text-sm font-medium outline-none data-highlighted:bg-(--glass-hover) [&>svg]:opacity-80",
        className,
      )}
    />
  );
}

function GlassMenuRadioItem({
  className,
  closeOnClick = true,
  ...props
}: Styled<Menu.RadioItem.Props>) {
  return (
    <Menu.RadioItem
      {...props}
      closeOnClick={closeOnClick}
      className={cn(
        "flex h-9 cursor-pointer items-center gap-2.5 rounded-full px-3 text-sm font-medium outline-none data-highlighted:bg-(--glass-hover) [&>svg]:opacity-80",
        className,
      )}
    />
  );
}

function GlassMenuSeparator({ className, ...props }: Styled<Menu.Separator.Props>) {
  return <Menu.Separator {...props} className={cn("mx-3 my-1 h-px bg-current/12", className)} />;
}

function GlassMenuGroupLabel({ className, ...props }: Styled<Menu.GroupLabel.Props>) {
  return (
    <Menu.GroupLabel
      {...props}
      className={cn("flex h-6 items-end px-3 pb-1 text-[11px] font-medium opacity-60", className)}
    />
  );
}

function Surface({
  align,
  anchor,
  natural,
  children,
  onClosed,
  open,
  reduceMotion,
  side,
  tall,
  trigger,
}: {
  align: "start" | "center" | "end";
  anchor: RefObject<HTMLButtonElement | null>;
  natural: () => number;
  children: ReactNode;
  onClosed: () => void;
  open: boolean;
  reduceMotion: boolean;
  side: "top" | "bottom";
  tall: number;
  trigger: ReactNode;
}) {
  const magnet = useMagnetic<HTMLDivElement>({ grow: 1.06, pull: 0.045, stretch: 0.04 });
  const flash = useRef<HTMLSpanElement>(null);
  const closed = useRef(onClosed);
  closed.current = onClosed;
  const measure = useRef(natural);
  measure.current = natural;
  const [rest, setRest] = useState(TALL);
  const [placed, setPlaced] = useState(false);
  const expanded = useRef(false);
  const shape =
    reduceMotion || (placed && open)
      ? { x: WIDTH / 2, y: tall / 2, width: WIDTH, height: tall, radius: ROUND, lift: 1 }
      : {
          x: align === "center" ? WIDTH / 2 : align === "end" ? WIDTH - rest / 2 : rest / 2,
          y: side === "top" ? tall - TALL / 2 : TALL / 2,
          width: rest,
          height: TALL,
          radius: TALL / 2,
          lift: 0,
        };

  useLayoutEffect(() => {
    setRest(measure.current());
  }, [open]);

  useEffect(() => {
    let frame = 0;
    let id = 0;
    const check = () => {
      const popup = magnet.ref.current?.parentElement?.getBoundingClientRect();
      const trigger = anchor.current?.getBoundingClientRect();
      if (
        (popup &&
          trigger &&
          Math.abs(side === "top" ? popup.bottom - trigger.bottom : popup.top - trigger.top) < 6) ||
        frame > 5
      ) {
        setPlaced(true);
        return;
      }
      frame += 1;
      id = requestAnimationFrame(check);
    };
    check();
    return () => cancelAnimationFrame(id);
  }, [anchor, magnet.ref, side]);

  useEffect(() => {
    if (!placed || open || reduceMotion) return;
    if (!flash.current) return;
    animate(
      flash.current,
      { opacity: [0, 0.45, 0] },
      { duration: 0.25, times: [0, 0.3, 1], ease: "easeOut" },
    );
  }, [placed, open, reduceMotion]);

  useEffect(() => {
    if (placed && open) expanded.current = true;
    if (placed && !open && (reduceMotion || !expanded.current)) closed.current();
  }, [placed, open, reduceMotion]);

  return (
    <motion.div
      ref={magnet.ref}
      data-held={magnet.held || undefined}
      initial={false}
      animate={{
        "--cx": `${shape.x}px`,
        "--cy": `${shape.y}px`,
        "--w": `${shape.width}px`,
        "--h": `${shape.height}px`,
        "--r": `${shape.radius}px`,
        "--lift": shape.lift,
      }}
      transition={!placed || reduceMotion ? { duration: 0 } : open ? menuOpen : menuClose}
      onAnimationComplete={() => {
        if (placed && !open) closed.current();
      }}
      {...magnet.handlers}
      className={cn(
        "magnetic group absolute isolate touch-none overflow-hidden font-[family-name:system-ui] text-(--glass-ink) subpixel-antialiased select-none [--depth:clamp(0,var(--lift),1)]",
        "top-[calc(var(--cy)-var(--h)/2)] left-[calc(var(--cx)-var(--w)/2)] h-(--h) w-(--w)",
        "rounded-(--r)",
        "bg-[linear-gradient(color-mix(in_srgb,var(--glass-sheen)_calc(100%_-_var(--depth)_*_50%),transparent),rgb(255_255_255/0)_calc(100%_+_var(--depth)_*_6.67%)),linear-gradient(var(--glass-color),var(--glass-color))] [backdrop-filter:var(--glass-backdrop)]",
        "shadow-[var(--glass-contact),var(--glass-lift),0_calc(var(--depth)_*_7px)_calc(var(--depth)_*_8px)_-4px_rgb(0_0_0/calc(var(--depth)_*_0.2)),0_calc(var(--depth)_*_11px)_calc(var(--depth)_*_28px)_-4px_rgb(0_0_0/calc(var(--depth)_*_0.2)),inset_0_0_0_0.5px_rgb(255_255_255/calc(var(--depth)_*_0.16)),inset_0_0_5.5px_rgb(255_255_255/calc(var(--depth)_*_0.1)),inset_0_0.5px_0_rgb(255_255_255/calc(var(--depth)_*_0.3))]",
        !placed && "opacity-0",
      )}
    >
      {/* Closed, the surface wears the trigger's own rim so handing back to the button doesn't pop. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-(--depth) shadow-[inset_0_1px_1.5px_rgb(255_255_255/0.22),inset_0_-1px_1.5px_rgb(255_255_255/0.12)] mask-x-from-70% mask-x-to-100%"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[calc(1-var(--depth))]"
      >
        <GlassRim />
      </span>
      <GlassLight />
      {!reduceMotion && (
        <span
          ref={flash}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-radial from-white/60 to-transparent to-75% opacity-0"
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center text-[13px] leading-4 whitespace-nowrap transition-[opacity,filter] duration-250 ease-out",
          placed && open && "opacity-0 blur-[10px]",
        )}
      >
        <span>{trigger}</span>
      </span>
      <div
        style={{ height: tall }}
        className={cn(
          "absolute top-1/2 left-1/2 w-50 -translate-1/2 p-2.5 transition-[opacity,filter,scale] duration-250 ease-[ease-out,ease-out,ease-in-out]",
          !placed && "opacity-0 blur-[5px] motion-safe:scale-140",
          placed && !open && "opacity-0 blur-[12px] motion-safe:scale-115",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

GlassMenu.Trigger = GlassMenuTrigger;
GlassMenu.Popup = GlassMenuPopup;
GlassMenu.Item = GlassMenuItem;
GlassMenu.RadioGroup = Menu.RadioGroup;
GlassMenu.RadioItem = GlassMenuRadioItem;
GlassMenu.Group = Menu.Group;
GlassMenu.GroupLabel = GlassMenuGroupLabel;
GlassMenu.Separator = GlassMenuSeparator;

export { GlassMenu };
export type { GlassMenuPopupProps, GlassMenuProps, GlassMenuTriggerProps };
