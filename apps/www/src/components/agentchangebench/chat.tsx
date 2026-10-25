import { Fragment, type Ref } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import type { Fields, ToolCall as Call, Turn } from "@/components/agentchangebench/conversation";
import { CheckIcon } from "@/components/icons/check";
import { CloseSmallIcon } from "@/components/icons/close-small";
import { STREAM } from "@/components/work/citation-preview/stream";

const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
const hidden = { opacity: 0, y: STREAM.rise, filter: `blur(${STREAM.blur}px)` };
const swap = { opacity: 0, scale: 0.25, filter: "blur(4px)" };
const fadeOut = {
  opacity: 0,
  filter: "blur(2px)",
  transition: { duration: 0.15, ease: "easeOut" },
} as const;

export type ToolResult = { fields: Fields; error?: boolean };

export type ChatMessageProps = {
  message: Turn;
  name?: string;
  /** Typing dots for the customer, a thinking line for the agent. */
  waiting?: boolean;
  /** Words streamed so far; leave out to show the whole message. */
  words?: number;
  called?: boolean;
  /** One per call, left out while that call is still running. */
  results?: (ToolResult | undefined)[];
};

export function ChatMessage({
  message,
  name,
  waiting = false,
  words,
  called = true,
  results = [],
}: ChatMessageProps) {
  const reduceMotion = useReducedMotion();
  const customer = message.role === "customer";
  return (
    <div className={cn("relative flex flex-col gap-1", customer && "items-end")}>
      {name && <span className="text-[13px] leading-5 text-muted-foreground">{name}</span>}
      <AnimatePresence initial={false} mode="popLayout">
        {customer && waiting && (
          <motion.div
            key="typing"
            exit={{ ...fadeOut, scale: 0.96 }}
            className="w-fit origin-bottom-right rounded-2xl rounded-ee-md bg-control px-3.5 py-2"
          >
            <Dots />
          </motion.div>
        )}
        {customer && !waiting && (
          <motion.div
            key="said"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={reduceMotion ? { duration: 0 } : STREAM.word}
            className="w-fit max-w-4/5 origin-bottom-right rounded-2xl rounded-ee-md bg-control px-3.5 py-2 text-[15px] leading-6 text-pretty text-foreground"
          >
            <Text message={message} />
          </motion.div>
        )}
        {!customer && waiting && <Thinking key="thinking" />}
        {!customer && !waiting && (
          <div
            key="reply"
            className="max-w-[90%] text-[15px] leading-6 text-pretty text-control-foreground"
          >
            {message.text && (
              <div>
                <Text message={message} count={words} />
              </div>
            )}
            {called &&
              message.calls?.map((call, index) => (
                <ToolCall key={index} call={call} result={results[index]} />
              ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Dots() {
  return (
    <span className="flex h-6 items-center gap-1">
      <span className="sr-only">Typing</span>
      <span
        aria-hidden="true"
        className="size-1.5 animate-typing rounded-full bg-muted-foreground motion-reduce:animate-none"
      />
      <span
        aria-hidden="true"
        className="size-1.5 animate-typing rounded-full bg-muted-foreground [animation-delay:150ms] motion-reduce:animate-none"
      />
      <span
        aria-hidden="true"
        className="size-1.5 animate-typing rounded-full bg-muted-foreground [animation-delay:300ms] motion-reduce:animate-none"
      />
    </span>
  );
}

// The glint from the agent terminal, in grays.
function Thinking({ ref }: { ref?: Ref<HTMLSpanElement> }) {
  return (
    <motion.span
      ref={ref}
      exit={fadeOut}
      className="w-fit animate-shimmer bg-[linear-gradient(110deg,var(--color-muted-foreground)_calc(50%_-_32px),var(--color-foreground)_50%,var(--color-muted-foreground)_calc(50%_+_32px))] bg-size-[calc(200%_+_64px)_100%] bg-clip-text bg-no-repeat text-[15px] leading-6 text-transparent motion-reduce:animate-none"
    >
      Thinking
    </motion.span>
  );
}

type Tone = "shift" | "detail";
type Piece = { text: string; tone?: Tone };

// Splits text into words, each broken into pieces that mark the goal change or a key detail.
function tokens(text: string, shift?: string, details: string[] = []) {
  const tones = Array.from<Tone | undefined>({ length: text.length });
  const paint = (needle: string, tone: Tone) => {
    for (let at = text.indexOf(needle); at !== -1; at = text.indexOf(needle, at + needle.length)) {
      tones.fill(tone, at, at + needle.length);
    }
  };
  if (shift) paint(shift, "shift");
  for (const detail of details) paint(detail, "detail");
  let offset = 0;
  return text.split(" ").flatMap((word) => {
    const start = offset;
    offset += word.length + 1;
    if (!word) return [];
    const pieces: Piece[] = [];
    for (let index = 0; index < word.length; index += 1) {
      const tone = tones[start + index];
      const last = pieces.at(-1);
      if (last && last.tone === tone) last.text += word[index];
      else pieces.push({ text: word[index]!, tone });
    }
    return [pieces];
  });
}

function Word({ pieces }: { pieces: Piece[] }) {
  return pieces.map((piece, index) =>
    piece.tone ? (
      <span
        key={index}
        className={piece.tone === "shift" ? "text-amber-foreground" : "text-detail"}
      >
        {piece.text}
      </span>
    ) : (
      <Fragment key={index}>{piece.text}</Fragment>
    ),
  );
}

// With a count, only words that have arrived take up space, so the reply grows as it streams.
function Text({ message, count }: { message: Turn; count?: number }) {
  const reduceMotion = useReducedMotion();
  const words = tokens(message.text, message.shift, message.details);
  return (count === undefined ? words : words.slice(0, count)).map((pieces, index) => (
    <Fragment key={index}>
      {index > 0 && " "}
      {count === undefined ? (
        <Word pieces={pieces} />
      ) : (
        <motion.span
          initial={hidden}
          animate={shown}
          transition={reduceMotion ? { duration: 0 } : STREAM.word}
          className="inline-block"
        >
          <Word pieces={pieces} />
        </motion.span>
      )}
    </Fragment>
  ));
}

function ToolCall({ call, result }: { call: Call; result?: ToolResult }) {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? { duration: 0 } : STREAM.word;
  return (
    <div className="mt-4 flex flex-col gap-2 text-sm leading-5 first:mt-0">
      <motion.div
        initial={hidden}
        animate={shown}
        transition={enter}
        className="flex items-start gap-2"
      >
        <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={result ? "done" : "running"}
              initial={swap}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={swap}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              className={
                !result
                  ? "text-muted-foreground"
                  : result.error
                    ? "text-red-foreground"
                    : "text-success"
              }
            >
              {!result ? <Ring /> : result.error ? <CloseSmallIcon /> : <CheckIcon />}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="min-w-0 font-mono text-[13px] break-words text-muted-foreground">
          <span className="text-control-foreground">{call.name}</span> {call.args.join(", ")}
        </span>
      </motion.div>
      {result && (
        <motion.dl
          initial={hidden}
          animate={shown}
          transition={enter}
          className="ms-6 grid w-fit grid-cols-[auto_auto] gap-x-4 gap-y-1 rounded-lg bg-control px-3 py-2"
        >
          {result.fields.map(([label, value]) => (
            <Fragment key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-control-foreground">{value}</dd>
            </Fragment>
          ))}
        </motion.dl>
      )}
    </div>
  );
}

// The ring from loading.dev: a short arc turning over a faint track.
function Ring() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4 animate-spin stroke-current [animation-duration:800ms] motion-reduce:animate-none"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2.5" opacity="0.2" />
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="2.5"
        strokeDasharray="16 46.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
