import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ANSWER_MS, Chat, type ChatBeat } from "@/work/image-tray/chat";
import { images } from "@/work/image-tray/images";
import { useWatching } from "@/work/use-watching";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * One round; each round taps the other of the first two tiles.
 *
 *    0ms   an empty chat
 *  300ms   the question sends, y 8 → 0 (180ms)
 * 1000ms   the images slide into the strip (staggered 35ms)
 * 1700ms   the answer streams, a word every 46ms, settled by 2632ms
 * 3232ms   a tap settles on a tile, scale 1.25 → 1
 * 3512ms   the tap lifts; the tray springs up over the chat
 * 6312ms   the tray springs closed
 * 7012ms   the chat fades out (300ms)
 * 7412ms   the next round begins
 *
 * The beats after the answer follow its length, so they move
 * with the text. Off screen the round pauses where it is. With
 * reduced motion the tile holds the finished chat with the first
 * image's tray open.
 * ───────────────────────────────────────────────────────── */

const settled = 1700 + ANSWER_MS;

const TIMING = {
  rest: 0, // empty chat
  sent: 300, // question bubble sends
  found: 1000, // images slide into the strip
  answered: 1700, // answer starts streaming
  tap: settled + 600, // tap dot lands on a tile
  open: settled + 880, // tray springs up
  closed: settled + 3680, // tray springs closed
  cleared: settled + 4380, // chat fades out
  loop: settled + 4780, // next round
};

const STAGES = ["rest", "sent", "found", "answered", "tap", "open", "closed", "cleared"] as const;

type Stage = (typeof STAGES)[number];

const STILL: ChatBeat = { sent: true, found: true, answered: true };

export function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const watching = useWatching(ref);
  const reduceMotion = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const stage: Stage = STAGES[beat % STAGES.length]!;
  const step = STAGES.indexOf(stage);
  const tile = Math.floor(beat / STAGES.length) % 2;

  useEffect(() => {
    if (!watching || reduceMotion) return;
    const next = STAGES[(step + 1) % STAGES.length]!;
    const nextAt = next === "rest" ? TIMING.loop : TIMING[next];
    const id = window.setTimeout(
      () => setBeat((current) => (current + 1) % (STAGES.length * 2)),
      nextAt - TIMING[stage],
    );
    return () => window.clearTimeout(id);
  }, [beat, stage, step, watching, reduceMotion]);

  const at = (moment: Stage) => step >= STAGES.indexOf(moment);
  const chat: ChatBeat = reduceMotion
    ? STILL
    : { sent: at("sent"), found: at("found"), answered: at("answered"), cleared: at("cleared") };
  const image = reduceMotion ? images[0]! : stage === "open" ? images[tile]! : null;

  return (
    <div ref={ref} className="size-full">
      <Chat {...chat} image={image} tap={!reduceMotion && stage === "tap" ? tile : null} />
    </div>
  );
}
