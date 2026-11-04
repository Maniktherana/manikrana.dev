import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { isWide, Panel } from "@/components/chart";

type MediaProps = { caption: string; width: number; height: number };

/** Percentages of the image, so a note stays on its spot at any size. */
type Note = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  labelAt?: "above" | "below" | "end";
};

export function Screenshot({
  src,
  alt,
  notes,
  ...media
}: MediaProps & { src: string; alt: string; notes?: Note[] }) {
  const frame = useKeepLabelsInside();
  return (
    <Panel caption={media.caption} wide={isWide(media.width, media.height)}>
      <div ref={frame} className="relative">
        <img
          src={src}
          alt={alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          className="h-auto w-full rounded-surface outline-1 -outline-offset-1 outline-white/10"
        />
        {notes?.map((note) => (
          <div
            key={note.label}
            aria-hidden="true"
            style={
              {
                "--x": `${note.x}%`,
                "--y": `${note.y}%`,
                "--w": `${note.width}%`,
                "--h": `${note.height}%`,
              } as CSSProperties
            }
            className="pointer-events-none absolute top-(--y) left-(--x) h-(--h) w-(--w) rounded-[50%] border-2 border-destructive"
          >
            <span
              data-note-label
              className={cn(
                "absolute rounded-md bg-destructive px-1.5 py-0.5 text-xs leading-4 font-medium whitespace-nowrap text-background [transform:translateX(var(--nudge,0px))]",
                note.labelAt === "end"
                  ? "start-full top-1/2 ms-1.5 -translate-y-1/2"
                  : "left-1/2 -translate-x-1/2",
                note.labelAt === "below" && "top-full mt-1.5",
                (note.labelAt ?? "above") === "above" && "bottom-full mb-1.5",
              )}
            >
              {note.label}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const INSET = 8;

function useKeepLabelsInside() {
  const frame = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const fit = () => {
      const bounds = element.getBoundingClientRect();
      for (const label of element.querySelectorAll<HTMLElement>("[data-note-label]")) {
        label.style.removeProperty("--nudge");
        const box = label.getBoundingClientRect();
        const nudge =
          Math.max(0, bounds.left + INSET - box.left) -
          Math.max(0, box.right - (bounds.right - INSET));
        if (nudge) label.style.setProperty("--nudge", `${nudge}px`);
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return frame;
}

// Plays only while on screen, and never on its own when reduced motion is preferred. Sources are
// listed in order of preference, typed by their extension.
export function Recording({
  sources,
  poster,
  ...media
}: MediaProps & { sources: string[]; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStill(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry!.isIntersecting) void element.play().catch(() => {});
      else element.pause();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <Panel caption={media.caption} wide={isWide(media.width, media.height)}>
      <video
        ref={video}
        poster={poster}
        aria-label={media.caption}
        width={media.width}
        height={media.height}
        muted
        loop
        playsInline
        preload="metadata"
        controls={still}
        className="h-auto w-full rounded-surface bg-card outline-1 -outline-offset-1 outline-white/10"
      >
        {sources.map((source) => (
          <source key={source} src={source} type={`video/${source.split(".").pop()}`} />
        ))}
      </video>
    </Panel>
  );
}
