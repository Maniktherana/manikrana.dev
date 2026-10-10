import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { useAiChat } from "./ai-chat";
import { Bar, Blob } from "./skeleton";

/** Where the demo reply is: asked (no reply yet), thinking, or answered. */
export type ChatReply = "asked" | "thinking" | "answered";

const ENTER = { duration: 0.22, ease: [0, 0, 0.2, 1] } as const;
const EXIT = { duration: 0.2, ease: [0, 0, 0.2, 1] } as const;

// The answer's lines draw in left to right, one after another, like text
// streaming in; the actions under them fade in once the last line has landed.
const ANSWER_LINES = [100, 96, 100, 58]; // each line's width, as a % of the column
const LINE = { duration: 0.5, stagger: 0.18, ease: [0.2, 0, 0, 1] } as const;
const ACTIONS_DELAY = (ANSWER_LINES.length - 1) * LINE.stagger + LINE.duration;

function Row({ className, children }: { className: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: EXIT }}
      transition={ENTER}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// A question, then a reply: the thinking row, the answer's lines, and the
// actions. The thinking row and the sources button open their panels.
export function Conversation({ reply }: { reply: ChatReply }) {
  const { panel, setPanel } = useAiChat();
  const reduceMotion = useReducedMotion();
  const answered = reply === "answered";
  const toggle = (next: string) => setPanel(panel === next ? null : next);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-16">
      <AnimatePresence initial={!reduceMotion}>
        <Row key="question" className="flex justify-end">
          <div aria-hidden="true" className="h-11 w-44 rounded-2xl bg-control" />
        </Row>

        {reply === "asked" ? null : (
          <Row key="reply" className="flex flex-col gap-3">
            <button
              type="button"
              disabled={!answered}
              aria-label="Show thinking"
              aria-expanded={panel === "thinking"}
              onClick={() => toggle("thinking")}
              className="-ml-2 flex min-h-7 w-fit transform-gpu items-center gap-2 rounded-lg py-1 pr-3 pl-2 outline-none [backface-visibility:hidden] transition-[background-color,scale] duration-150 ease-out hover:bg-control focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96] disabled:pointer-events-none aria-expanded:bg-control"
            >
              <Blob className="size-5" />
              <Bar className={cn("w-24", !answered && "motion-safe:animate-pulse")} />
            </button>

            {answered ? (
              <>
                <div className="flex flex-col gap-4 py-2">
                  {ANSWER_LINES.map((width, index) => (
                    <motion.span
                      key={index}
                      aria-hidden="true"
                      initial={reduceMotion ? false : { width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{
                        duration: LINE.duration,
                        delay: index * LINE.stagger,
                        ease: LINE.ease,
                      }}
                      className="block h-3 rounded-full bg-control-selected"
                    />
                  ))}
                </div>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...ENTER, delay: ACTIONS_DELAY }}
                  className="-ml-2 flex items-center gap-1"
                >
                  <Blob className="size-8 bg-control" />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Show sources"
                    aria-expanded={panel === "sources"}
                    className="gap-2 pl-2"
                    onClick={() => toggle("sources")}
                  >
                    <span className="flex -space-x-1">
                      {[0, 1, 2].map((index) => (
                        <Blob key={index} className="size-5 bg-popover ring-2 ring-stage" />
                      ))}
                    </span>
                    <Bar className="h-2 w-10" />
                  </Button>
                </motion.div>
              </>
            ) : null}
          </Row>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The composer drawn as a bar with two buttons, for the footer. */
export function ComposerSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-3xl px-4 pt-8 pb-4">
      <div className="flex h-12 items-center justify-between rounded-3xl bg-control p-1">
        <Blob className="size-10 bg-control" />
        <Blob className="size-10" />
      </div>
    </div>
  );
}
