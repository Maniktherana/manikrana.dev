import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";

// The slot animates width and margin together, so a closed panel leaves no gutter.
const PANEL_WIDTH = 320; // matches the w-80 classes below
const PANEL_GAP = 8;
const SLIDE = { duration: 0.2, ease: [0, 0, 0.2, 1] } as const;
const SWAP = { duration: 0.16, ease: [0, 0, 0.2, 1] } as const;

// The edge is an overlay shadow, so nothing inside can cover it.
const INSET_CARD =
  "relative overflow-hidden rounded-2xl bg-stage text-foreground after:pointer-events-none after:absolute after:inset-0 after:z-30 after:rounded-[inherit] after:shadow-stage";

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [local, setLocal] = useState(initial);
  const controlled = value !== undefined;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setLocal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [controlled ? value : local, set] as const;
}

type AiChatContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  panel: string | null;
  setPanel: (panel: string | null) => void;
};

const AiChatContext = createContext<AiChatContextValue | null>(null);

export function useAiChat() {
  const context = useContext(AiChatContext);
  if (!context) throw new Error("useAiChat must be used inside <AiChat>");
  return context;
}

export type AiChatProps = ComponentProps<"div"> & {
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  panel?: string | null;
  defaultPanel?: string | null;
  onPanelChange?: (panel: string | null) => void;
};

export function AiChat({
  sidebarOpen: sidebarOpenProp,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  panel: panelProp,
  defaultPanel = null,
  onPanelChange,
  className,
  ...props
}: AiChatProps) {
  const [sidebarOpen, setSidebarOpen] = useControllable(
    sidebarOpenProp,
    defaultSidebarOpen,
    onSidebarOpenChange,
  );
  const [panel, setPanel] = useControllable<string | null>(panelProp, defaultPanel, onPanelChange);
  const context = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, panel, setPanel }),
    [sidebarOpen, setSidebarOpen, panel, setPanel],
  );

  return (
    <AiChatContext value={context}>
      <div
        data-slot="ai-chat"
        className={cn("flex size-full min-h-0 overflow-hidden bg-card text-foreground", className)}
        {...props}
      />
    </AiChatContext>
  );
}

export function AiChatSidebar({ className, ...props }: ComponentProps<"div">) {
  const { sidebarOpen } = useAiChat();

  return (
    <div
      data-slot="ai-chat-sidebar"
      data-state={sidebarOpen ? "open" : "collapsed"}
      className={cn(
        "group/sidebar h-full shrink-0 overflow-hidden transition-[width] duration-200 ease-out motion-reduce:transition-none",
        sidebarOpen ? "w-56" : "w-12",
        className,
      )}
      {...props}
    />
  );
}

// Pass its open max-width in `className`, such as `max-w-32`, so the width can animate.
export function AiChatSidebarLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="ai-chat-sidebar-label"
      className={cn(
        "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-150 ease-out group-data-[state=collapsed]/sidebar:max-w-0 group-data-[state=collapsed]/sidebar:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export function AiChatSidebarTrigger({ onClick, ...props }: ComponentProps<typeof Button>) {
  const { sidebarOpen, setSidebarOpen } = useAiChat();

  return (
    <Button
      data-slot="ai-chat-sidebar-trigger"
      size="icon"
      variant="ghost"
      aria-label="Toggle sidebar"
      onClick={(event) => {
        onClick?.(event);
        setSidebarOpen(!sidebarOpen);
      }}
      {...props}
    />
  );
}

export function AiChatBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-chat-body"
      className={cn("flex min-w-0 flex-1 py-3 pr-3", className)}
      {...props}
    />
  );
}

export function AiChatContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-chat-content"
      className={cn(INSET_CARD, "flex min-h-0 min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

export function AiChatHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="ai-chat-header"
      className={cn("absolute inset-x-0 top-0 z-10 flex h-12 items-center px-2", className)}
      {...props}
    />
  );
}

export function AiChatViewport({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-chat-viewport"
      className={cn("min-h-0 flex-1 overflow-hidden", className)}
      {...props}
    />
  );
}

export function AiChatFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="ai-chat-footer"
      className={cn(
        "absolute inset-x-0 bottom-0 bg-linear-to-t from-stage via-stage to-transparent",
        className,
      )}
      {...props}
    />
  );
}

// Choose the children from the panel id in the parent, so a leaving card keeps its content.
export function AiChatPanel({ className, children, ...props }: ComponentProps<"div">) {
  const { panel } = useAiChat();

  return (
    <AnimatePresence initial={false}>
      {panel ? (
        <motion.aside
          key="slot"
          initial={{ width: 0, marginLeft: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, marginLeft: PANEL_GAP, opacity: 1 }}
          exit={{ width: 0, marginLeft: 0, opacity: 0 }}
          transition={SLIDE}
          className="h-full shrink-0 overflow-hidden"
        >
          <div className="relative h-full w-80 overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div
                key={panel}
                initial={{ x: PANEL_WIDTH }}
                animate={{ x: 0 }}
                exit={{ x: -PANEL_WIDTH }}
                transition={SWAP}
                className="absolute inset-0"
              >
                <div
                  data-slot="ai-chat-panel"
                  className={cn(INSET_CARD, "flex h-full w-80 flex-col", className)}
                  {...props}
                >
                  {children}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export function AiChatPanelClose({ onClick, ...props }: ComponentProps<typeof Button>) {
  const { setPanel } = useAiChat();

  return (
    <Button
      data-slot="ai-chat-panel-close"
      variant="ghost"
      size="icon-sm"
      aria-label="Close panel"
      onClick={(event) => {
        onClick?.(event);
        setPanel(null);
      }}
      {...props}
    />
  );
}
