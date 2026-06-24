"use client";

import * as React from "react";
import { AnimatePresence, motion, type Transition, type Variant } from "motion/react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TransitionPanel } from "@/components/ui/transition-panel";

// Default content swap: crossfade with a small slide + blur.
const DEFAULT_VARIANTS = {
  enter: { opacity: 0, x: 16, filter: "blur(4px)" },
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -16, filter: "blur(4px)" },
};
const DEFAULT_TRANSITION: Transition = { duration: 0.24, ease: [0, 0, 0.2, 1] };

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Observes the width of the element the panel lives in (its inner shell — the
 * chat + panel area, which shrinks when the sidebar opens) rather than the
 * viewport, so docking decisions reflect the real space available.
 */
function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(Number.POSITIVE_INFINITY);

  React.useEffect(() => {
    const container = ref.current?.parentElement;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

const SidePanelContext = React.createContext<{ onClose: () => void } | null>(null);

function useSidePanel() {
  const context = React.useContext(SidePanelContext);
  if (!context) throw new Error("SidePanel parts must be used within <SidePanel>.");
  return context;
}

/**
 * A detail panel that docks inline as an animated column when there's room, and
 * collapses to an overlay contained within its positioned ancestor otherwise.
 * It docks only if the main content keeps at least `dockAt` of width once the
 * panel takes its `width`; otherwise it falls back to the overlay so it can't
 * squish the chat. Swap content inside it with a `<TransitionPanel>`.
 */
function SidePanel({
  open,
  onOpenChange,
  side = "right",
  width = 320,
  dockAt = "md",
  activeIndex,
  variants,
  transition,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  width?: number;
  dockAt?: Breakpoint;
  /** When set, children are treated as indexed panels and swapped with a transition. */
  activeIndex?: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
  transition?: Transition;
  className?: string;
  children: React.ReactNode;
}) {
  const sentinelRef = React.useRef<HTMLSpanElement>(null);
  const available = useContainerWidth(sentinelRef);
  const docked = available >= BREAKPOINTS[dockAt] + width;
  const context = React.useMemo(() => ({ onClose: () => onOpenChange(false) }), [onOpenChange]);
  const panelChildren = React.Children.toArray(children);

  const content =
    activeIndex === undefined ? (
      children
    ) : (
      <TransitionPanel
        activeIndex={activeIndex}
        variants={variants ?? DEFAULT_VARIANTS}
        transition={transition ?? DEFAULT_TRANSITION}
        className="h-full"
      >
        {panelChildren}
      </TransitionPanel>
    );

  return (
    <SidePanelContext.Provider value={context}>
      {/* Measures the inner shell (parent) width to decide dock vs. overlay. */}
      <span ref={sentinelRef} aria-hidden className="hidden" />
      {docked ? (
        <aside
          data-slot="side-panel"
          data-state={open ? "open" : "closed"}
          style={{ "--side-panel-width": `${width}px` } as React.CSSProperties}
          className={cn(
            "h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open ? "w-(--side-panel-width)" : "w-0",
          )}
        >
          <div
            className={cn(
              "relative h-full w-(--side-panel-width) overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm",
              className,
            )}
          >
            {content}
          </div>
        </aside>
      ) : (
        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                className="absolute inset-0 z-40 bg-black/35"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                onClick={() => onOpenChange(false)}
              />
              <motion.aside
                data-slot="side-panel"
                style={{ width }}
                className={cn(
                  "absolute inset-y-2 z-50 max-w-[86%] overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[var(--shadow-overlay-lg)]",
                  side === "right" ? "right-2" : "left-2",
                  className,
                )}
                initial={{ x: side === "right" ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: side === "right" ? 24 : -24, opacity: 0, filter: "blur(4px)" }}
                transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              >
                {content}
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>
      )}
    </SidePanelContext.Provider>
  );
}

function SidePanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="side-panel-header"
      className={cn("flex h-12 shrink-0 items-center justify-between gap-2 pr-2 pl-4", className)}
      {...props}
    />
  );
}

function SidePanelTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="side-panel-title"
      className={cn("min-w-0 truncate text-sm leading-snug font-medium text-foreground", className)}
      {...props}
    />
  );
}

function SidePanelDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="side-panel-description"
      className={cn("min-w-0 truncate text-xs leading-snug text-muted-foreground", className)}
      {...props}
    />
  );
}

function SidePanelClose({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { onClose } = useSidePanel();

  return (
    <Button
      data-slot="side-panel-close"
      variant="ghost"
      size="icon-sm"
      aria-label="Close panel"
      onClick={onClose}
      className={cn("shrink-0", className)}
      {...props}
    >
      <XIcon />
    </Button>
  );
}

function SidePanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="side-panel-body"
      className={cn("min-h-0 flex-1 overflow-y-auto", className)}
      {...props}
    />
  );
}

export {
  SidePanel,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelDescription,
  SidePanelClose,
  SidePanelBody,
};
