import {
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type RefObject,
} from "react";
import { useReducedMotion } from "motion/react";
import {
  AgentTerminal,
  TERMINAL_SIZE,
  type TerminalFrame,
} from "@/components/work/agent-terminal/agent-terminal";
import { SCRIPT, STILL_FRAME } from "@/components/work/agent-terminal/storyboard";
import { useTerminalPlayback } from "@/components/work/agent-terminal/use-terminal-playback";
import { useWatching } from "@manikrana/ui/hooks/use-watching";

const HEADER = {
  title: "Claude Code",
  version: "v2.1.272",
  subtitle: "Opus 5 (1M context) with high effort · Claude Team",
  path: "~/code/agentsims",
};

const FOOTER = (
  <>
    <span>▶▶</span>
    <span>Bypass permissions on</span>
    <span>·</span>
    <span>Agentsims connected</span>
  </>
);

export function useDemoTerminal(ref: RefObject<Element | null>) {
  const watching = useWatching(ref, { amount: 0.25 });

  // Gated on mount so server and first client render agree.
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion() === true && mounted;
  useEffect(() => setMounted(true), []);

  const [replayed, setReplayed] = useState(false);
  const still = reduced && !replayed;
  const playing = watching && !still;
  const playback = useTerminalPlayback(SCRIPT, { playing, loop: !reduced });

  return {
    frame: still ? STILL_FRAME : playback.frame,
    paused: !playing,
    instant: still,
    replay: () => {
      setReplayed(true);
      playback.replay();
    },
  };
}

// tan(atan2(a, b)) is the unitless ratio a/b in plain CSS.
export function FittedTerminal({
  ref,
  margin,
  reserve = 0,
  frame,
  paused,
  instant,
}: {
  ref: RefObject<HTMLDivElement | null>;
  margin: number;
  reserve?: number;
  frame: TerminalFrame;
  paused: boolean;
  instant: boolean;
}) {
  const across = `tan(atan2(100cqw - ${margin * 2}px, ${TERMINAL_SIZE.width}px))`;
  const down = `tan(atan2(100cqh - ${margin * 2 + reserve}px, ${TERMINAL_SIZE.height}px))`;
  return (
    <div
      style={
        {
          "--fit": `max(0.1, min(1, ${across}, ${down}))`,
          "--reserve": `${reserve}px`,
        } as CSSProperties
      }
      className="@container-size size-full"
    >
      <div className="flex size-full items-center justify-center pb-(--reserve)">
        <AgentTerminal
          ref={ref}
          {...frame}
          header={HEADER}
          footer={FOOTER}
          logo={<ClaudeMark className="size-16 shrink-0" />}
          paused={paused}
          instant={instant}
          className="scale-(--fit)"
        />
        <p className="sr-only">
          Demo: the user asks Claude Code to put iPhone 17 in dark mode, use Liquid Glass icons,
          then replace them with Tinted icons. The sequence repeats.
        </p>
      </div>
    </div>
  );
}

function ClaudeMark(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        className="fill-(--terminal-accent)"
        d="M20.998 10.949H24v3.102h-3v3.028h-1.487V20H18v-2.921h-1.487V20H15v-2.921H9V20H7.488v-2.921H6V20H4.487v-2.921H3V14.05H0V10.95h3V5h17.998v5.949zM6 10.949h1.488V8.102H6v2.847zm10.51 0H18V8.102h-1.49v2.847z"
      />
    </svg>
  );
}
