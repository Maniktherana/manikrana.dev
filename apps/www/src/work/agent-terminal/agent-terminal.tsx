import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

export type TerminalRow =
  | { kind: "prompt"; text: string }
  | { kind: "message"; text: string }
  | { kind: "skill"; text: string }
  | { kind: "command"; text: string; tool?: string; program?: string }
  | { kind: "result"; text: string }
  | { kind: "note"; text: string };

export type TerminalFrame = {
  rows: readonly TerminalRow[];
  activity?: string;
  composer?: { text: string; duration: number };
};

export type AgentTerminalProps = Omit<ComponentProps<"div">, "children"> &
  TerminalFrame & {
    header: { title: string; version?: string; subtitle?: string; path?: string };
    logo?: ReactNode;
    footer?: ReactNode;
    paused?: boolean;
    instant?: boolean;
  };

export const TERMINAL_SIZE = { width: 640, height: 528 } as const;

const REVEAL = {
  line: {
    hidden: { opacity: 0, y: 3, filter: "blur(1px)" },
    shown: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] },
    },
  },
  tool: {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: 0.12, ease: "easeOut" } },
  },
} as const;

const STREAM = {
  wordDelay: 0.06,
  duration: 0.35,
  blur: 1,
  ease: [0.22, 1, 0.36, 1],
} as const;

const SHIMMER = {
  duration: 1800,
  spread: 32,
  angle: 110,
  frames: [{ backgroundPosition: "100% 0" }, { backgroundPosition: "0 0" }],
};

// Must match the `tracking-[-0.025em]` class on the terminal.
const TRACKING = -0.025;

const GLINT = [
  ["var(--terminal-accent)", -SHIMMER.spread],
  ["oklch(0.87 0.13084 38.756)", -SHIMMER.spread / 2],
  ["white", 0],
  ["oklch(0.87 0.13084 38.756)", SHIMMER.spread / 2],
  ["var(--terminal-accent)", SHIMMER.spread],
]
  .map(([color, offset]) => `${color} calc(50% + ${offset}px)`)
  .join(", ");

const THEME = {
  "--terminal-w": `${TERMINAL_SIZE.width}px`,
  "--terminal-h": `${TERMINAL_SIZE.height}px`,
  "--terminal-surface": "oklch(0.134409 0 0)",
  "--terminal-border": "oklch(0.204627 0 0)",
  "--terminal-divider": "oklch(0.256153 0 0)",
  "--terminal-accent": "oklch(0.67242 0.13084 38.756)",
  "--terminal-skill": "oklch(0.72 0.18 150)",
  "--terminal-glint": `linear-gradient(${SHIMMER.angle}deg, ${GLINT})`,
  "--terminal-glint-size": `calc(200% + ${SHIMMER.spread * 2}px) 100%`,
} as CSSProperties;

const TONE: Record<Exclude<TerminalRow["kind"], "prompt">, string> = {
  message: "text-white/82",
  skill: "text-white/52",
  command: "text-white/52",
  result: "text-white/32",
  note: "text-white/35",
};

export function AgentTerminal({
  rows,
  activity,
  composer,
  header,
  logo,
  footer,
  paused = false,
  instant = false,
  className,
  style,
  ...props
}: AgentTerminalProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const handle = window.requestAnimationFrame(() => {
      const overflow = node.scrollHeight - node.clientHeight;
      if (overflow <= 0) {
        node.scrollTop = 0;
        setScrolled(false);
        return;
      }
      node.scrollTo({ top: overflow, behavior: instant ? "auto" : "smooth" });
      setScrolled(true);
    });
    return () => window.cancelAnimationFrame(handle);
  }, [rows.length, instant]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        aria-hidden="true"
        {...props}
        style={{ ...THEME, ...style }}
        className={cn(
          "relative isolate grid h-(--terminal-h) w-(--terminal-w) shrink-0 grid-rows-[auto_minmax(0,1fr)_28px_auto] overflow-hidden rounded-2xl bg-(--terminal-surface) font-mono text-[13px] leading-normal tracking-[-0.025em] shadow-[0_28px_72px_oklch(0_0_0/45%)] [font-variant-ligatures:none]",
          className,
        )}
      >
        <Header {...header} logo={logo} />

        <div
          ref={scroller}
          data-scrolled={scrolled}
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 1)}
          className="min-h-0 touch-none overflow-hidden [scrollbar-width:none] data-[scrolled=true]:[mask-image:linear-gradient(to_bottom,transparent,black_24px)]"
        >
          <div className="flex min-w-0 flex-col gap-2 px-3 pb-2.5 *:first:mb-0.5">
            {/* Rows are only appended, so an index is a stable key. */}
            {rows.map((row, index) =>
              row.kind === "prompt" ? (
                <PromptRow key={index} instant={instant} text={row.text} />
              ) : (
                <Entry key={index} instant={instant} row={row} />
              ),
            )}
          </div>
        </div>

        <div className="flex h-7 items-center gap-1.5 px-3 text-(--terminal-accent)">
          {activity && (
            <>
              <AsteriskIcon className="size-3.5 shrink-0" />
              <Shimmer key={activity} playing={!paused}>
                {activity}
              </Shimmer>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1.5 px-1.5 pb-2">
          <div className="flex min-w-0 items-center gap-1.5 border-y border-(--terminal-divider) px-1 py-2 whitespace-nowrap text-white/88">
            <span>&gt;</span>
            {composer && (
              <Typing
                key={composer.text}
                text={composer.text}
                duration={composer.duration}
                playing={!paused}
              />
            )}
            <span className="h-[1.05em] w-[7px] flex-none bg-white/60" />
          </div>
          {footer && (
            <div className="flex min-w-0 items-center gap-1.5 px-1 py-0.5 whitespace-nowrap text-white/27">
              {footer}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] border border-(--terminal-border)" />
      </div>
    </MotionConfig>
  );
}

function Header({
  title,
  version,
  subtitle,
  path,
  logo,
}: AgentTerminalProps["header"] & { logo: ReactNode }) {
  return (
    <header className="flex items-start gap-2.5 px-3 pt-3">
      {logo}
      <div className="flex min-w-0 flex-col justify-center gap-px py-1">
        <p className="text-white/92">
          <span className="font-medium">{title}</span>
          {version && (
            <>
              {" "}
              <span className="text-white/36">{version}</span>
            </>
          )}
        </p>
        {subtitle && <p className="truncate text-white/44">{subtitle}</p>}
        {path && <p className="text-white/35">{path}</p>}
      </div>
    </header>
  );
}

function PromptRow({ text, instant }: { text: string; instant: boolean }) {
  return (
    <motion.div
      variants={REVEAL.line}
      initial={instant ? false : "hidden"}
      animate="shown"
      className="grid grid-cols-[1em_minmax(0,1fr)] items-start gap-1.5 overflow-hidden bg-white/[5.5%] py-2 whitespace-nowrap text-white/90"
    >
      <span className="text-white/44">&gt;</span>
      <span>{text}</span>
    </motion.div>
  );
}

function Entry({
  row,
  instant,
}: {
  row: Exclude<TerminalRow, { kind: "prompt" }>;
  instant: boolean;
}) {
  return (
    <motion.div
      variants={row.kind === "message" ? REVEAL.line : REVEAL.tool}
      initial={instant ? false : "hidden"}
      animate="shown"
      className={cn(
        "grid grid-cols-[1em_minmax(0,1fr)] items-start gap-1.5 overflow-hidden whitespace-nowrap",
        TONE[row.kind],
      )}
    >
      <span
        className={cn(
          "flex h-[1.5em] w-[1em] items-center justify-center text-white/38",
          row.kind === "skill" && "text-(--terminal-skill)",
        )}
      >
        {row.kind === "note" ? (
          <AsteriskIcon className="size-3.5 flex-none" />
        ) : row.kind === "result" ? (
          <span className="block -translate-y-[1.5px] text-[13px] leading-none">⎿</span>
        ) : (
          <span className="block size-1.5 rounded-full bg-current" />
        )}
      </span>
      <span className="min-w-0 overflow-hidden whitespace-nowrap">
        <RowText row={row} />
      </span>
    </motion.div>
  );
}

function RowText({ row }: { row: Exclude<TerminalRow, { kind: "prompt" }> }) {
  if (row.kind === "skill") {
    return (
      <>
        <strong className="font-semibold text-white/92">Skill</strong>
        <span className="text-white/92">({row.text})</span>
      </>
    );
  }
  if (row.kind === "command") {
    const { text, program } = row;
    return (
      <>
        <span className="text-white/36">{`${row.tool ?? "Bash"}(`}</span>
        {program && text.startsWith(program) ? (
          <>
            <strong className="font-semibold text-white/92">{program}</strong>
            {text.slice(program.length)}
          </>
        ) : (
          text
        )}
        <span className="text-white/36">)</span>
      </>
    );
  }
  if (row.kind === "message") {
    return <StreamingText>{row.text}</StreamingText>;
  }
  return row.text;
}

function StreamingText({ children }: { children: string }) {
  const reducedMotion = useReducedMotion();
  let word = 0;
  return (
    <span>
      {children.split(/(\s+)/).map((part, index) => {
        if (/^\s+$/.test(part)) return part;
        const delay = word * STREAM.wordDelay;
        word += 1;
        return (
          <motion.span
            key={`${part}-${index}`}
            className="inline-block"
            initial={reducedMotion ? false : { opacity: 0, filter: `blur(${STREAM.blur}px)` }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: reducedMotion ? 0 : STREAM.duration,
              delay: reducedMotion ? 0 : delay,
              ease: STREAM.ease,
            }}
          >
            {part}
          </motion.span>
        );
      })}
    </span>
  );
}

function Shimmer({ playing, children }: { playing: boolean; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useWebAnimation(ref, SHIMMER.frames, SHIMMER.duration, playing, Infinity);
  return (
    <span
      ref={ref}
      className="bg-(image:--terminal-glint) bg-size-(--terminal-glint-size) bg-clip-text bg-no-repeat text-transparent"
    >
      {children}
    </span>
  );
}

function Typing({ text, duration, playing }: { text: string; duration: number; playing: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const keyframes = useMemo(
    () => [
      { width: "0px", easing: `steps(${text.length}, end)` },
      { width: `calc(${text.length} * (1ch + ${TRACKING}em))` },
    ],
    [text],
  );
  useWebAnimation(ref, keyframes, duration, playing);
  return (
    <span ref={ref} className="inline-block w-0 flex-none overflow-hidden whitespace-nowrap">
      {text}
    </span>
  );
}

function useWebAnimation(
  ref: RefObject<HTMLElement | null>,
  keyframes: Keyframe[],
  duration: number,
  playing: boolean,
  iterations = 1,
) {
  const animation = useRef<Animation | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const running = node.animate(keyframes, {
      duration,
      iterations,
      easing: "linear",
      fill: "both",
    });
    animation.current = running;
    return () => running.cancel();
  }, [ref, keyframes, duration, iterations]);
  // Extra deps re-apply the play state when the animation is recreated.
  useEffect(() => {
    if (playing) animation.current?.play();
    else animation.current?.pause();
  }, [playing, ref, keyframes, duration, iterations]);
}

function AsteriskIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12.0001 4V20M19 8L5.00025 16M18.9997 16L5 8" />
    </svg>
  );
}
