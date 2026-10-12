import { useState } from "react";
import { AnimatedMark } from "@/components/icons/animated-mark";
import type { Talk } from "@/data/talks";

export function TalkVideo({ talk, video }: { talk: Talk; video: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="@container relative mt-8 aspect-video overflow-hidden rounded-xl bg-card outline-1 -outline-offset-1 outline-white/10">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0`}
          title={`${talk.title}, recording`}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          aria-label={`Play ${talk.title}`}
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex flex-col items-start justify-end rounded-[inherit] p-[7.5cqw] text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          {talk.mark && (
            <AnimatedMark
              name={talk.mark}
              hovered={false}
              className="mb-auto size-[7cqw] self-start opacity-100 grayscale-0"
            />
          )}
          <span className="max-w-[80cqw]">
            <span className="block text-[4.5cqw] leading-tight font-medium tracking-tight text-balance">
              {talk.subtitle ?? talk.title}
            </span>
            <span className="mt-[0.75cqw] block text-[3.25cqw] leading-tight text-muted-foreground">
              Manik Rana, {talk.events[0].venue}
            </span>
          </span>
          <span className="absolute top-1/2 left-1/2 -translate-1/2 @max-xl:top-[7.5cqw] @max-xl:right-[7.5cqw] @max-xl:left-auto @max-xl:translate-0 rounded-full bg-control px-3.5 py-2 text-sm leading-4.5 font-medium whitespace-nowrap text-control-foreground transition-[background-color,color] duration-150 ease-out group-hover:bg-foreground group-hover:text-background motion-reduce:transition-none">
            Click to Play
          </span>
        </button>
      )}
    </div>
  );
}
