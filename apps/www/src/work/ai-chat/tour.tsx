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

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * The shell is laid out at its desktop size (1024×576) and scaled to fit its
 * box, so small boxes show the same layout. Read top-to-bottom. Each time is
 * ms after the loop starts.
 *
 *     0ms   shell at rest: sidebar open with its recents, the question asked
 *   700ms   reply starts thinking (the active thread pulses)
 *  2000ms   answer lines draw in, actions fade in
 *  3800ms   Sources panel docks in, chat card narrows (slot 0 → 320px, 200ms)
 *  5800ms   panel swaps to the thinking trace (cards slide past each other)
 *  7600ms   panel docks out, chat card widens back
 *  8600ms   sidebar collapses to the icon rail (224 → 48px, 200ms)
 * 10400ms   sidebar expands again
 * 11800ms   reply fades out, loop restarts
 *
 * The scale is a plain ancestor transform, so every move is a CSS width
 * transition or an animation to an explicit value. Nothing uses `layout`,
 * which would measure the scaled boxes wrongly.
 * ───────────────────────────────────────────────────────── */

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

// The stage each beat steps to, ms after the loop starts; `restart` loops.
const TIMING = {
  thinking: 700, // the reply starts thinking
  answered: 2000, // the answer draws in
  sources: 3800, // the sources panel docks in
  trace: 5800, // the panel swaps to the thinking trace
  closed: 7600, // the panel docks out
  rail: 8600, // the sidebar collapses to the rail
  expanded: 10400, // the sidebar expands again
  restart: 11800, // the loop starts over
};

type ShellState = { reply: ChatReply; panel: string | null; sidebarOpen: boolean };

// Reduced motion holds one frame: sidebar open, the sources panel docked.
const STILL: ShellState = { reply: "answered", panel: "sources", sidebarOpen: true };

/** Steps through the storyboard while `active`; coming back from a pause replays from the top. */
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

/**
 * The shell on its tour, scaled to fit the box it fills. With `interactive`,
 * its controls work, and using one takes over from the tour.
 */
export function TourShell({ interactive = false }: { interactive?: boolean }) {
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [taken, setTaken] = useState<ShellState | null>(null);
  const tour = useTour(useWatching(frameRef) && !reduceMotion && !taken);
  const shell = taken ?? (reduceMotion ? STILL : tour);

  // Fit the shell's fixed size (its w-256 h-144) inside the box.
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

  // Taking over holds the shell where the tour had it, with the reply done.
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
