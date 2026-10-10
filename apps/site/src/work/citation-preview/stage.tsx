import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { TooltipProvider } from "@manikrana/ui/components/ui/tooltip";
import { Toolbar, ToolbarButton } from "@/components/toolbar";
import { useWatching } from "@/work/use-watching";
import { Answer } from "./answer";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Plays once the stage is in view; Replay runs it again.
 *
 *    0ms   an empty chat
 *  300ms   the question sends, y 8 → 0 (180ms)
 * 1000ms   the answer streams, a word every 46ms, the chips
 *          landing among the words
 *
 * Then hover or focus a chip to open its card. With reduced
 * motion the chat is there at once.
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  sent: 300, // question bubble sends
  answered: 1000, // answer starts streaming
};

const BEATS = ["sent", "answered"] as const;

// Puch wraps its app in a tooltip provider, so moving straight from one chip to
// the next opens the next card without waiting.
export function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const reached = reduceMotion ? BEATS.length : step;

  useEffect(() => {
    if (!watching || reduceMotion) return;
    const timers = BEATS.map((beat, index) =>
      window.setTimeout(() => setStep((current) => Math.max(current, index + 1)), TIMING[beat]),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [watching, reduceMotion, run]);

  const replay = () => {
    setStep(0);
    setRun((current) => current + 1);
  };

  return (
    <TooltipProvider>
      <div ref={ref} className="relative flex size-full items-center justify-center px-6 pb-14">
        <Answer sent={reached >= 1} answered={reached >= 2} className="w-full max-w-xl" />
        <Toolbar aria-label="Citation chips">
          <ToolbarButton onClick={replay}>Replay</ToolbarButton>
        </Toolbar>
      </div>
    </TooltipProvider>
  );
}
