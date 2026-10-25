import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Gust } from "@maniktherana/gust";
import { cn } from "@manikrana/ui/lib/utils";
import { ChatMessage } from "@/components/agentchangebench/chat";
import { checks, james, shifts } from "@/components/agentchangebench/james";
import { PauseIcon } from "@/components/icons/pause";
import { PlayIcon } from "@/components/icons/play";
import { STREAM, words } from "@/components/work/citation-preview/stream";
import { downloadNumberMotion, reducedMotionOverrides } from "@/components/work/gust/download";

const lanes = [
  { role: "customer", label: "James" },
  { role: "agent", label: "Agent" },
  { role: "tool", label: "Tools" },
] as const;
const labelOf = (index: number) => lanes.find((lane) => lane.role === james[index]!.role)!.label;

// A bar is a message's own time: typing or thinking, then reading it, or a tool call in flight.
const counts = james.map((message) => (message.role === "tool" ? 0 : words(message.text).length));
const leads = james.map((message, index) => {
  if (message.role === "customer") return Math.min(Math.max(counts[index]! * 25, 700), 1100);
  if (message.role === "agent") return james[index - 1]?.role === "tool" ? 400 : 600;
  return 0;
});
const durations = james.map((message, index) => {
  if (message.role === "tool") return 800;
  const stream = message.role === "agent" ? counts[index]! * STREAM.perWord : 0;
  const read = message.calls ? 400 : Math.min(Math.max(counts[index]! * 75, 800), 1800);
  return leads[index]! + stream + read;
});
const gapAfter = (index: number) => {
  const next = james[index + 1];
  if (!next) return 0;
  if (next.role === "tool") return 350;
  return james[index]!.role === "tool" ? 200 : 300;
};
const starts = durations.map((_, index) =>
  durations.slice(0, index).reduce((sum, duration, before) => sum + duration + gapAfter(before), 0),
);
const TOTAL = starts.at(-1)! + durations.at(-1)!;
const LAST = james.length - 1;
const LOOP_DELAY = 5000;
const named = james.map(
  (message, index) =>
    message.role !== "tool" &&
    james
      .slice(0, index)
      .filter((entry) => entry.role !== "tool")
      .at(-1)?.role !== message.role,
);

const indexAt = (time: number) => Math.max(0, starts.filter((start) => start <= time).length - 1);
const waitingAt = (time: number, index: number) => time < starts[index]! + leads[index]!;
const streamedAt = (time: number, index: number) =>
  james[index]!.role === "agent"
    ? Math.min(
        counts[index]!,
        Math.max(0, Math.floor((time - starts[index]! - leads[index]!) / STREAM.perWord) + 1),
      )
    : counts[index]!;
const doneAt = (time: number, index: number) => time >= starts[index]! + durations[index]!;
const restAt = (index: number) => {
  const role = james[index]!.role;
  if (role === "tool") return starts[index]! + durations[index]!;
  return starts[index]! + leads[index]! + (role === "agent" ? counts[index]! * STREAM.perWord : 0);
};
const percent = (ms: number) => `${(ms / TOTAL) * 100}%`;
const score = (value: number) => `${Number(value.toFixed(1))}%`;
// TSR's 25/45/30 split, spread over the parts a task actually has checks for.
const parts = { info: 25, actions: 45, behavior: 30 };
const scale =
  100 /
  (Object.keys(parts) as (keyof typeof parts)[])
    .filter((part) => checks[part].total > 0)
    .reduce((sum, part) => sum + parts[part], 0);
const WEIGHTS = {
  info: parts.info * scale,
  actions: parts.actions * scale,
  behavior: parts.behavior * scale,
};
const recovered = new Set(shifts.flatMap((shift) => [shift.ack, shift.tool, shift.outcome]));
// The failed calls, which pull TUE down.
const failed = new Set(
  james.flatMap((message, index) => (message.role === "tool" && message.error ? [index] : [])),
);

const glide = { type: "spring", duration: 0.3, bounce: 0 } as const;
const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
const hidden = { opacity: 0, y: STREAM.rise, filter: `blur(${STREAM.blur}px)` };
const swap = { opacity: 0, scale: 0.25, filter: "blur(4px)" };

export function ConversationPlayer({ caption }: { caption: string }) {
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const inView = useInView(root, { amount: 0.5 });
  const reducedMotion = useReducedMotion();
  const time = useMotionValue(0);
  const playhead = useTransform(time, [0, TOTAL], ["0%", "100%"]);
  const played = useTransform(time, (value) => `inset(0 ${100 - (value / TOTAL) * 100}% 0 0)`);
  const [frame, setFrame] = useState({ index: 0, waiting: true, streamed: 0, done: false });
  const reached = (at: number) => frame.index > at || (frame.index === at && !frame.waiting);
  const [playing, setPlaying] = useState(false);
  const [touched, setTouched] = useState(false);
  const [finished, setFinished] = useState(false);

  useMotionValueEvent(time, "change", (value) => {
    if (input.current) input.current.value = String(value);
    const index = indexAt(value);
    const waiting = waitingAt(value, index);
    const streamed = streamedAt(value, index);
    const done = doneAt(value, index);
    setFrame((current) =>
      current.index === index &&
      current.waiting === waiting &&
      current.streamed === streamed &&
      current.done === done
        ? current
        : { index, waiting, streamed, done },
    );
  });

  useEffect(() => {
    if (reducedMotion) time.set(TOTAL);
  }, [reducedMotion, time]);

  useEffect(() => {
    if (!inView || touched || reducedMotion) return;
    setTouched(true);
    setPlaying(true);
  }, [inView, touched, reducedMotion]);

  useEffect(() => {
    if (!playing || !inView) return undefined;
    const controls = animate(time, TOTAL, {
      duration: (TOTAL - time.get()) / 1000,
      ease: "linear",
      onComplete: () => {
        setPlaying(false);
        setFinished(true);
      },
    });
    return () => controls.stop();
  }, [playing, inView, time]);

  useEffect(() => {
    if (!finished || !inView || reducedMotion) return undefined;
    const timer = window.setTimeout(() => {
      time.set(0);
      setFinished(false);
      setPlaying(true);
    }, LOOP_DELAY);
    return () => window.clearTimeout(timer);
  }, [finished, inView, reducedMotion, time]);

  function toggle() {
    setTouched(true);
    setFinished(false);
    if (!playing && time.get() >= TOTAL) time.set(0);
    setPlaying(!playing);
  }

  function seek(value: number) {
    setTouched(true);
    setFinished(false);
    setPlaying(false);
    time.set(value);
  }

  const resolved = (index: number) => frame.index > index || (frame.index === index && frame.done);
  const ended = reached(LAST);
  const results = james.flatMap((message, index) =>
    message.role === "tool" && resolved(index) ? [{ error: Boolean(message.error) }] : [],
  );
  const calls = results.length;
  const errors = results.filter((result) => result.error).length;
  // None of the errors mention a bad parameter, so the repo counts every call as having valid ones.
  const tue = calls ? ((0.6 * (calls - errors) + 0.4 * calls) / calls) * 100 : 100;
  const share = (earned: number, total: number) => (total ? earned / total : 0);
  const tsr =
    WEIGHTS.info * share(checks.info.passed.filter((at) => reached(at)).length, checks.info.total) +
    WEIGHTS.actions *
      share(
        checks.actions.credits
          .filter((entry) => frame.index > entry.at)
          .reduce((sum, entry) => sum + entry.credit, 0),
        checks.actions.total,
      ) +
    WEIGHTS.behavior * (ended ? share(checks.behavior.passed, checks.behavior.total) : 0);
  const shift = shifts.filter((entry) => reached(entry.at)).at(-1);
  const gsrt = (["ack", "tool", "outcome"] as const).map((part) => {
    const at = shift?.[part];
    if (!shift) return { label: `GSRT ${part}`, value: "0", tone: "text-muted-foreground" };
    if (at !== undefined && reached(at)) {
      return { label: `GSRT ${part}`, value: String(at - shift.at), tone: "text-success" };
    }
    if (ended) return { label: `GSRT ${part}`, value: "never", tone: "text-red-foreground" };
    return {
      label: `GSRT ${part}`,
      value: String(frame.index - shift.at),
      tone: "text-foreground",
    };
  });
  const stats = [
    { label: "TSR", value: score(tsr), tone: "text-foreground" },
    { label: "TUE", value: score(tue), tone: "text-foreground" },
    ...gsrt,
  ];

  function step(event: KeyboardEvent<HTMLInputElement>) {
    const index = indexAt(time.get());
    const next = restAt(Math.min(index + 1, james.length - 1));
    const previous = restAt(Math.max(index - 1, 0));
    const target = {
      ArrowRight: next,
      ArrowUp: next,
      ArrowLeft: previous,
      ArrowDown: previous,
      Home: 0,
      End: TOTAL,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    seek(target);
  }

  return (
    <MotionConfig reducedMotion="user">
      <figure ref={root} className="my-8">
        <div className="overflow-hidden rounded-3xl bg-card">
          <div className="relative h-88 overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 flex flex-col px-5 pb-5 sm:px-6 sm:pb-6">
              <AnimatePresence initial={false}>
                {james.slice(0, frame.index + 1).map((message, position) => {
                  if (message.role === "tool") return null;
                  return (
                    <Grow key={position}>
                      <ChatMessage
                        message={message}
                        name={named[position] ? labelOf(position) : undefined}
                        waiting={position === frame.index && frame.waiting}
                        words={position === frame.index ? frame.streamed : undefined}
                        called={frame.index > position}
                        results={message.calls?.map((_, offset) => {
                          const result = james[position + 1 + offset];
                          return result?.role === "tool" && resolved(position + 1 + offset)
                            ? result
                            : undefined;
                        })}
                      />
                    </Grow>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-card to-transparent" />
          </div>

          <div className="border-t border-border px-5 pt-1.5 pb-5 sm:px-6">
            <div className="flex gap-3">
              <div className="flex flex-col pt-4 text-sm text-muted-foreground">
                {lanes.map((lane) => (
                  <span key={lane.role} className="flex h-5.5 items-center">
                    {lane.label}
                  </span>
                ))}
              </div>
              <div className="group relative flex-1 px-2">
                <div className="relative pt-4 pb-5">
                  <Bars index={frame.index} />
                  {shifts.map((entry) => (
                    <span
                      key={entry.at}
                      style={{ "--x": percent(starts[entry.at]!) } as CSSProperties}
                      className="absolute top-4 bottom-5 left-(--x) border-l border-dashed border-amber-foreground/60"
                    />
                  ))}
                  <motion.div
                    style={{ clipPath: played }}
                    className="absolute inset-x-0 top-4 bottom-5"
                  >
                    <Bars index={frame.index} played />
                  </motion.div>
                  {shifts.map((entry, order) => {
                    const next = shifts[order + 1];
                    const latest = frame.index >= entry.at && !(next && frame.index >= next.at);
                    return (
                      <motion.span
                        key={entry.at}
                        initial={false}
                        animate={latest ? shown : hidden}
                        transition={STREAM.word}
                        style={{ "--x": percent(starts[entry.at]!) } as CSSProperties}
                        className="absolute bottom-0 left-(--x) -translate-x-1/2 text-sm leading-5 whitespace-nowrap text-amber-foreground"
                      >
                        Goal shift
                      </motion.span>
                    );
                  })}
                </div>
                <input
                  ref={input}
                  type="range"
                  min={0}
                  max={TOTAL}
                  step="any"
                  defaultValue={0}
                  aria-label="Conversation"
                  aria-valuetext={`Message ${frame.index + 1} of ${james.length}, ${labelOf(frame.index)}`}
                  onPointerDown={() => seek(time.get())}
                  onChange={(event) => seek(Number(event.target.value))}
                  onKeyDown={step}
                  className="absolute inset-0 size-full cursor-ew-resize appearance-none opacity-0 [&::-moz-range-thumb]:w-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none"
                />
                <motion.span
                  style={{ x: playhead }}
                  className="pointer-events-none absolute inset-y-0 inset-x-2"
                >
                  <span className="absolute top-2 bottom-5 left-0 w-px -translate-x-1/2 bg-foreground/60" />
                  <span className="absolute top-2 left-0 size-2.5 -translate-1/2 rounded-full bg-foreground group-has-focus-visible:ring-3 group-has-focus-visible:ring-ring/50" />
                </motion.span>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-4">
              <button
                type="button"
                aria-label={playing ? "Pause" : "Play"}
                onClick={toggle}
                className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-control text-control-foreground outline-none transition-[background-color,color,scale] duration-150 ease-out hover:bg-control-hover hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={playing ? "pause" : "play"}
                    initial={swap}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={swap}
                    transition={glide}
                  >
                    {playing ? <PauseIcon /> : <PlayIcon />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <dl className="ms-auto flex flex-wrap justify-end gap-x-4 gap-y-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="min-w-[5ch] text-end">
                    <dt className="text-[13px] leading-5 whitespace-nowrap text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd
                      className={cn(
                        "text-[15px] leading-6 tabular-nums transition-colors duration-150 ease-out",
                        stat.tone,
                      )}
                    >
                      <Value value={stat.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        <figcaption className="mt-3 text-center text-[13px] leading-5 text-pretty text-muted-foreground">
          {caption}
        </figcaption>
      </figure>
    </MotionConfig>
  );
}

function Bars({ index, played }: { index: number; played?: boolean }) {
  return lanes.map((lane) => (
    <div key={lane.role} className="relative h-5.5">
      {james.map((message, position) =>
        message.role === lane.role ? (
          <span
            key={position}
            style={
              {
                "--x": percent(starts[position]!),
                "--w": percent(durations[position]!),
              } as CSSProperties
            }
            className={cn(
              "absolute top-1/2 left-(--x) h-3.5 w-[max(var(--w),2px)] -translate-y-1/2 rounded-sm",
              !played
                ? "bg-foreground/8"
                : shifts.some((entry) => entry.at === position)
                  ? "bg-amber-foreground"
                  : failed.has(position)
                    ? "bg-red-foreground"
                    : recovered.has(position)
                      ? "bg-success"
                      : position === index
                        ? "bg-foreground/70"
                        : "bg-foreground/30",
            )}
          />
        ) : null,
      )}
    </div>
  ));
}

// Animates to its content's height, so the bottom-anchored chat rises instead of jumping.
function Grow({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const node = inner.current!;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: height ?? "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
      transition={{ height: glide, opacity: { duration: 0.2, ease: "easeOut" } }}
      className="overflow-hidden"
    >
      <div ref={inner} className="pt-4">
        {children}
      </div>
    </motion.div>
  );
}

// Gust's download counter without the entrance pop. The angles are cleared so `down` can steer.
const counter = {
  ...downloadNumberMotion,
  enterAngle: undefined,
  exitAngle: undefined,
  entranceScale: 1,
};

// Rolls the digits up when a score rises and down when it falls. The % sign stays put.
function Value({ value }: { value: string }) {
  const reducedMotion = useReducedMotion();
  const [previous, setPrevious] = useState(value);
  const [falling, setFalling] = useState(false);
  if (value !== previous) {
    setPrevious(value);
    setFalling(Number.parseFloat(value) < Number.parseFloat(previous));
  }
  const unit = value.endsWith("%") ? "%" : "";
  return (
    <>
      <Gust
        value={unit ? value.slice(0, -1) : value}
        down={falling}
        {...counter}
        {...(reducedMotion ? reducedMotionOverrides : undefined)}
      />
      {unit}
    </>
  );
}
