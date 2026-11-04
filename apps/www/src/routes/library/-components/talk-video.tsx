import { useState } from "react";
import { marks } from "@/components/icons/marks";
import { PlayIcon } from "@/components/icons/play";
import type { Talk } from "@/routes/library/-data";

export function TalkVideo({ talk, video }: { talk: Talk; video: string }) {
  const [playing, setPlaying] = useState(false);
  const Mark = talk.mark && marks[talk.mark];
  return (
    <div className="@container relative aspect-video overflow-hidden rounded-surface bg-card outline-1 -outline-offset-1 outline-white/10">
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
          className="group absolute inset-0 flex cursor-pointer flex-col items-start justify-end rounded-[inherit] p-[7.5cqw] text-start outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {Mark && <Mark className="mb-auto size-[7cqw] self-start" />}
          <span className="max-w-[80cqw]">
            <span className="block text-[4.5cqw] leading-tight font-medium tracking-tight text-balance">
              {talk.subtitle ?? talk.title}
            </span>
            <span className="mt-[0.75cqw] block text-[3.25cqw] leading-tight text-muted-foreground">
              Manik Rana, {talk.events[0].venue}
            </span>
          </span>
          <span className="absolute top-1/2 left-1/2 flex -translate-1/2 transform-gpu items-center gap-2 rounded-full bg-control py-2 ps-3 pe-3.5 text-sm leading-4.5 font-medium whitespace-nowrap text-control-foreground transition-[background-color,color,scale] duration-150 ease-out group-hover:bg-control-hover group-hover:text-foreground group-active:scale-[0.96] motion-reduce:transition-[background-color,color]">
            <PlayIcon className="size-3 transform-gpu transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-0.5" />
            Click to Play
          </span>
        </button>
      )}
    </div>
  );
}
