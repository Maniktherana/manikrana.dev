import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type RefCallback,
} from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { CloseSmallIcon } from "@/components/icons";

const MIN_FADE = 0.15;
const MAX_FADE = 0.27;

const SURFACE_SPRING = { type: "spring", bounce: 0.03, visualDuration: 0.15 } as const;
const CONTENT = {
  hidden: { opacity: 0, y: 8, filter: "blur(3px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)" },
  enter: { duration: 0.1, delay: 0.015 },
  exit: { duration: 0.07 },
};

// Composited on the GPU and limited to scale and colour transitions, so the press stays smooth.
const PRESS =
  "transform-gpu outline-none [backface-visibility:hidden] transition-[scale,background-color] duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]";
const PRESSABLE = cn("flex h-11 w-full items-center text-base leading-none font-semibold", PRESS);

const OUTSIDE = "Family drawer parts must be rendered inside <FamilyDrawer>.";

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  page: string;
  setPage: (page: string) => void;
};

// Kept apart from DrawerContext so `useFamilyDrawer` consumers do not re-render on it.
type FrameContextValue = {
  measure: RefCallback<HTMLDivElement>;
  fadeDuration: number;
  reduceMotion: boolean | null;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);
const FrameContext = createContext<FrameContextValue | null>(null);
const MeasuringContext = createContext(false);
// Each layer keeps the page it rendered with, so a fading-out layer does not switch pages.
const ActivePageContext = createContext<string | null>(null);

// motion's elements type these handlers differently.
type ElementProps<Tag extends "div" | "button"> = Omit<
  ComponentProps<Tag>,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
>;

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  return [controlled ? value : inner, set] as const;
}

function useMeasuredHeight() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!element) return;

    const updateHeight = () => setHeight(element.scrollHeight);
    const observer = new ResizeObserver(updateHeight);

    updateHeight();
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return [setElement, height] as const;
}

function useFrame() {
  const frame = use(FrameContext);

  if (!frame) throw new Error(OUTSIDE);
  return frame;
}

export function useFamilyDrawer() {
  const drawer = use(DrawerContext);

  if (!drawer) throw new Error(OUTSIDE);
  return drawer;
}

export type FamilyDrawerProps = ElementProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  page?: string;
  defaultPage?: string;
  onPageChange?: (page: string) => void;
  closedWidth?: number;
  closedHeight?: number;
  openWidth?: number;
};

export function FamilyDrawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  page: pageProp,
  defaultPage = "",
  onPageChange,
  closedWidth = 190,
  closedHeight = 44,
  openWidth = 338,
  className,
  style,
  children,
  ...props
}: FamilyDrawerProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [page, setPage] = useControllable(pageProp, defaultPage, onPageChange);
  const [measure, contentHeight] = useMeasuredHeight();
  const reduceMotion = useReducedMotion();
  const [lastHeight, setLastHeight] = useState(contentHeight);
  const [fadeDuration, setFadeDuration] = useState(MIN_FADE);

  if (contentHeight !== lastHeight) {
    setLastHeight(contentHeight);
    setFadeDuration(
      lastHeight
        ? Math.min(Math.max(Math.abs(contentHeight - lastHeight) / 500, MIN_FADE), MAX_FADE)
        : MIN_FADE,
    );
  }

  const drawer = useMemo(() => ({ open, setOpen, page, setPage }), [open, setOpen, page, setPage]);
  const frame = useMemo(
    () => ({ measure, fadeDuration, reduceMotion }),
    [measure, fadeDuration, reduceMotion],
  );

  return (
    <MotionConfig reducedMotion="user">
      <DrawerContext value={drawer}>
        <FrameContext value={frame}>
          <motion.div
            animate={
              open && contentHeight
                ? { width: openWidth, height: contentHeight }
                : { width: closedWidth, height: closedHeight }
            }
            className={cn(
              "relative max-w-full overflow-hidden rounded-4xl bg-popover text-foreground shadow-raised",
              className,
            )}
            data-slot="family-drawer"
            data-state={open ? "open" : "closed"}
            initial={false}
            style={
              {
                "--family-drawer-open-width": `${openWidth}px`,
                "--family-drawer-closed-height": `${closedHeight}px`,
                ...style,
              } as CSSProperties
            }
            transition={SURFACE_SPRING}
            {...props}
          >
            {children}
          </motion.div>
        </FrameContext>
      </DrawerContext>
    </MotionConfig>
  );
}

export function FamilyDrawerTrigger({
  className,
  children,
  onClick,
  ...props
}: ElementProps<"button">) {
  const { open, setOpen } = useFamilyDrawer();
  const { reduceMotion } = useFrame();

  return (
    <AnimatePresence initial={false}>
      {!open ? (
        <motion.button
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          className={cn(
            "absolute inset-x-0 bottom-0 flex h-(--family-drawer-closed-height) items-center justify-center rounded-full px-5 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
            className,
          )}
          data-slot="family-drawer-trigger"
          exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
          initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
          key="closed"
          onClick={(event) => {
            onClick?.(event);
            setOpen(true);
          }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.18,
            ease: [0.165, 0.84, 0.44, 1],
          }}
          type="button"
          whileTap={{ scale: 0.94 }}
          {...props}
        >
          {children}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

// Also renders an invisible copy of the children, measured so the surface can start
// resizing before the visible page swaps.
export function FamilyDrawerContent({ className, children, ...props }: ElementProps<"div">) {
  const { open } = useFamilyDrawer();
  const { measure } = useFrame();

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-x-0 top-0 w-(--family-drawer-open-width)"
        inert
        ref={measure}
      >
        <MeasuringContext value={true}>{children}</MeasuringContext>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          // Centered, not pinned left, so it rises straight up while the surface widens.
          <motion.div
            animate={{ ...CONTENT.shown, transition: CONTENT.enter }}
            className={cn(
              "absolute top-0 left-1/2 w-(--family-drawer-open-width) -translate-x-1/2",
              className,
            )}
            data-slot="family-drawer-content"
            exit={{ ...CONTENT.hidden, transition: CONTENT.exit }}
            initial={CONTENT.hidden}
            key="open"
            {...props}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function FamilyDrawerClose({
  className,
  children,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const measuring = use(MeasuringContext);
  const { setOpen } = useFamilyDrawer();

  // Absolutely positioned, so leaving it out of the measuring copy does not change the height.
  if (measuring) return null;

  return (
    <button
      aria-label="Close"
      className={cn(
        "absolute top-5 right-6 z-10 flex size-7 items-center justify-center rounded-full bg-control text-control-foreground hover:bg-control-hover",
        PRESS,
        className,
      )}
      data-slot="family-drawer-close"
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      type="button"
      {...props}
    >
      {children ?? <CloseSmallIcon />}
    </button>
  );
}

export function FamilyDrawerPages({ className, children, ...props }: ComponentProps<"div">) {
  const measuring = use(MeasuringContext);
  const { page } = useFamilyDrawer();
  const { fadeDuration, reduceMotion } = useFrame();
  const current = <ActivePageContext value={page}>{children}</ActivePageContext>;

  return (
    <div className={cn("px-5 pt-2 pb-5", className)} data-slot="family-drawer-pages" {...props}>
      {measuring ? (
        current
      ) : (
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            animate={{ filter: "blur(0px)", opacity: 1 }}
            exit={{ filter: "blur(3px)", opacity: 0 }}
            initial={{ filter: "blur(3px)", opacity: 0 }}
            key={page}
            transition={{
              duration: reduceMotion ? 0.01 : fadeDuration,
              ease: [0.25, 1, 0.5, 1],
            }}
          >
            {current}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export function FamilyDrawerPage({ value, children }: { value: string; children: ReactNode }) {
  const active = use(ActivePageContext);

  if (active === null)
    throw new Error("<FamilyDrawerPage> must be rendered inside <FamilyDrawerPages>.");
  return value === active ? children : null;
}

export function FamilyDrawerHeader({ className, ...props }: ComponentProps<"header">) {
  return <header className={className} data-slot="family-drawer-header" {...props} />;
}

export function FamilyDrawerTitle({ className, children, ...props }: ComponentProps<"h4">) {
  return (
    <h4
      className={cn("text-lg leading-snug font-semibold", className)}
      data-slot="family-drawer-title"
      {...props}
    >
      {children}
    </h4>
  );
}

export function FamilyDrawerDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-2 text-sm leading-snug font-medium text-muted-foreground", className)}
      data-slot="family-drawer-description"
      {...props}
    />
  );
}

export function FamilyDrawerItem({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        PRESSABLE,
        "gap-3 rounded-xl px-4 text-left bg-control hover:bg-control-hover",
        className,
      )}
      data-slot="family-drawer-item"
      type="button"
      {...props}
    />
  );
}

export function FamilyDrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mt-6 flex gap-3", className)} data-slot="family-drawer-footer" {...props} />
  );
}

export function FamilyDrawerButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        PRESSABLE,
        "justify-center gap-2 rounded-full px-4 bg-control hover:bg-control-hover",
        className,
      )}
      data-slot="family-drawer-button"
      type="button"
      {...props}
    />
  );
}
