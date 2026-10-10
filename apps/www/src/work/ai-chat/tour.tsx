import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { useWatching } from "@/work/use-watching";
import {
  AiChat,
  AiChatBody,
  AiChatContent,
  AiChatFooter,
  AiChatHeader,
  AiChatPanel,
  AiChatSidebar,
  AiChatSidebarTrigger,
  AiChatViewport,
} from "./ai-chat";
import { ComposerSkeleton, Conversation, type ChatReply } from "./content";
import { PANELS } from "./panels";
import { SidebarContent } from "./sidebar";
import { Blob } from "./skeleton";

const STAGE = {
  asked: 0,
  thinking: 1,
  answered: 2,
  sources: 3,
  trace: 4,
  closed: 5,
  rail: 6,
  expanded: 7,
} as const;

const TIMING = {
  thinking: 700,
  answered: 2000,
  sources: 3800,
  trace: 5800,
  closed: 7600,
  rail: 8600,
  expanded: 10400,
  restart: 11800,
};

type ShellState = { reply: ChatReply; panel: string | null; sidebarOpen: boolean };

const STILL: ShellState = { reply: "answered", panel: "sources", sidebarOpen: true };

function useTour(active: boolean): ShellState {
  const [cycle, setCycle] = useState(0);
  const [stage, setStage] = useState<number>(STAGE.asked);

  useEffect(() => {
    if (!active) return;
    setStage(STAGE.asked);
    const timers = (Object.keys(TIMING) as Array<keyof typeof TIMING>).map((beat) =>
      window.setTimeout(
        () => (beat === "restart" ? setCycle((count) => count + 1) : setStage(STAGE[beat])),
        TIMING[beat],
      ),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [active, cycle]);

  return {
    reply: stage >= STAGE.answered ? "answered" : stage >= STAGE.thinking ? "thinking" : "asked",
    panel:
      stage >= STAGE.closed
        ? null
        : stage >= STAGE.trace
          ? "thinking"
          : stage >= STAGE.sources
            ? "sources"
            : null,
    sidebarOpen: stage < STAGE.rail || stage >= STAGE.expanded,
  };
}

export function TourShell({ interactive = false }: { interactive?: boolean }) {
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [taken, setTaken] = useState<ShellState | null>(null);
  const tour = useTour(useWatching(frameRef) && !reduceMotion && !taken);
  const shell = taken ?? (reduceMotion ? STILL : tour);

  // Scaled by an ancestor transform, so nothing inside may use motion `layout`: it measures scaled boxes wrongly.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const node = shellRef.current;
    if (!frame || !node) return;
    const fit = () =>
      setScale(
        Math.min(frame.clientWidth / node.offsetWidth, frame.clientHeight / node.offsetHeight),
      );
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const take = (patch: Partial<ShellState>) => setTaken({ ...shell, reply: "answered", ...patch });

  return (
    <div ref={frameRef} className="relative size-full overflow-hidden">
      <div
        ref={shellRef}
        style={{ "--scale": scale } as CSSProperties}
        className="absolute top-1/2 left-1/2 h-144 w-256 -translate-1/2 scale-(--scale)"
      >
        <AiChat
          sidebarOpen={shell.sidebarOpen}
          panel={shell.panel}
          onSidebarOpenChange={interactive ? (sidebarOpen) => take({ sidebarOpen }) : undefined}
          onPanelChange={interactive ? (panel) => take({ panel }) : undefined}
        >
          <AiChatSidebar>
            <SidebarContent working={shell.reply === "thinking"} />
          </AiChatSidebar>
          <AiChatBody>
            <AiChatContent>
              <AiChatHeader>
                <AiChatSidebarTrigger>
                  <Blob className="size-5 rounded-md" />
                </AiChatSidebarTrigger>
              </AiChatHeader>
              <AiChatViewport>
                <Conversation reply={shell.reply} />
              </AiChatViewport>
              <AiChatFooter>
                <ComposerSkeleton />
              </AiChatFooter>
            </AiChatContent>
            <AiChatPanel>{shell.panel ? PANELS[shell.panel] : null}</AiChatPanel>
          </AiChatBody>
        </AiChat>
      </div>
    </div>
  );
}
