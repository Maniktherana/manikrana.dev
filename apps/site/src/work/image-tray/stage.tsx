import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { Toolbar, ToolbarButton } from "@/components/toolbar";
import { Chat } from "@/work/image-tray/chat";
import type { WebImage } from "@/work/image-tray/image-tray";
import { useWatching } from "@/work/use-watching";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Plays once the stage is in view; Replay runs it again.
 *
 *    0ms   an empty chat
 *  300ms   the question sends, y 8 → 0 (180ms)
 * 1000ms   the images slide into the strip (staggered 35ms)
 * 1700ms   the answer streams, a word every 46ms
 *
 * Then tap an image to raise its tray. The toolbar steps aside
 * while the tray is up, since the tray rises where it floats.
 * With reduced motion the chat is there at once.
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  sent: 300, // question bubble sends
  found: 1000, // images slide into the strip
  answered: 1700, // answer starts streaming
};

const BEATS = ["sent", "found", "answered"] as const;

export function Stage() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const [image, setImage] = useState<WebImage | null>(null);
  const open = image !== null;
  const reached = reduceMotion ? BEATS.length : step;

  useEffect(() => {
    if (!watching || reduceMotion) return;
    const timers = BEATS.map((beat, index) =>
      window.setTimeout(() => setStep((current) => Math.max(current, index + 1)), TIMING[beat]),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [watching, reduceMotion, run]);

  const replay = () => {
    setImage(null);
    setStep(0);
    setRun((current) => current + 1);
  };

  return (
    <div ref={ref} className="relative size-full">
      <Chat
        sent={reached >= 1}
        found={reached >= 2}
        answered={reached >= 3}
        image={image}
        onSelect={setImage}
        onClose={() => setImage(null)}
      />
      <Toolbar
        aria-label="Image tray"
        inert={open}
        className={cn("transition-opacity duration-200 ease-out", open && "opacity-0")}
      >
        <ToolbarButton onClick={replay}>Replay</ToolbarButton>
      </Toolbar>
    </div>
  );
}
