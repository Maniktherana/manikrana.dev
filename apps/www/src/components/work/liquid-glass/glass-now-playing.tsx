import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Slider } from "@base-ui/react/slider";
import { cn } from "@manikrana/ui/lib/utils";
import { animate, motion, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { AirpodsBoldIcon } from "@/components/icons/airpods-bold";
import { FastForwardBoldIcon } from "@/components/icons/fast-forward-bold";
import { PauseBoldIcon } from "@/components/icons/pause-bold";
import { PlayBoldIcon } from "@/components/icons/play-bold";
import { RewindBoldIcon } from "@/components/icons/rewind-bold";
import { StarBoldIcon } from "@/components/icons/star-bold";
import { StarOutlineBoldIcon } from "@/components/icons/star-outline-bold";
import { GlassLight, GlassRim } from "./primitives/glass";
import { Swap } from "./primitives/glass-motion";
import { useMagnetic } from "./primitives/magnetic";
import { nowPlayingClose, nowPlayingOpen } from "./primitives/springs";

type GlassNowPlayingProps = {
  artist: string;
  artwork: string;
  className?: string;
  src: string;
  title: string;
};

function clock(seconds: number) {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

const MARQUEE_GAP = 32;
const MARQUEE_SPEED = 30;

function Marquee({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLSpanElement>(null);
  const strip = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [moving, setMoving] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const box = frame.current;
    const text = strip.current?.firstElementChild as HTMLElement | null;
    if (!box || !text) return;
    const measure = () => setOverflow(Math.max(0, text.offsetWidth - box.offsetWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(text);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = strip.current;
    const text = node?.firstElementChild as HTMLElement | null;
    if (!node || !text || !overflow || reduceMotion) return;
    let timer = 0;
    let run: AnimationPlaybackControls | null = null;
    const loop = () => {
      timer = window.setTimeout(
        () => {
          const distance = text.offsetWidth + MARQUEE_GAP;
          setMoving(true);
          run = animate(
            node,
            { x: [0, -distance] },
            { duration: distance / MARQUEE_SPEED, ease: "linear" },
          );
          void run.finished.then(() => {
            setMoving(false);
            loop();
          });
        },
        3000 + Math.random() * 3000,
      );
    };
    loop();
    return () => {
      window.clearTimeout(timer);
      run?.cancel();
      setMoving(false);
    };
  }, [overflow, reduceMotion]);

  return (
    <span
      ref={frame}
      data-overflow={overflow > 0 || undefined}
      data-moving={moving || undefined}
      className="block min-w-0 overflow-hidden data-overflow:[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] data-moving:[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)]"
    >
      <span ref={strip} className="flex w-max gap-8">
        <span className="whitespace-nowrap">{children}</span>
        {overflow > 0 && (
          <span aria-hidden="true" className="whitespace-nowrap">
            {children}
          </span>
        )}
      </span>
    </span>
  );
}

function GlassNowPlaying({ artist, artwork, className, src, title }: GlassNowPlayingProps) {
  const magnet = useMagnetic<HTMLDivElement>({ grow: 1.03, pull: 0.025, stretch: 0.02 });
  const reduceMotion = useReducedMotion();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const spring = reduceMotion ? { duration: 0 } : open ? nowPlayingOpen : nowPlayingClose;
  const [playing, setPlaying] = useState(false);
  const [starred, setStarred] = useState(false);
  const [time, setTime] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const node = new Audio(src);
    node.preload = "metadata";
    audio.current = node;
    const sync = () => setTime({ current: node.currentTime, total: node.duration || 0 });
    const play = () => setPlaying(true);
    const pause = () => setPlaying(false);
    const end = () => {
      node.currentTime = 0;
      sync();
    };
    node.addEventListener("loadedmetadata", sync);
    node.addEventListener("play", play);
    node.addEventListener("pause", pause);
    node.addEventListener("ended", end);
    return () => {
      node.pause();
      node.removeEventListener("loadedmetadata", sync);
      node.removeEventListener("play", play);
      node.removeEventListener("pause", pause);
      node.removeEventListener("ended", end);
      audio.current = null;
    };
  }, [src]);

  useEffect(() => {
    const node = audio.current;
    if (!node || !playing) return;
    let id = 0;
    const tick = () => {
      setTime({ current: node.currentTime, total: node.duration || 0 });
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);

  function toggle() {
    const node = audio.current;
    if (!node) return;
    if (node.paused) void node.play();
    else node.pause();
  }

  function seek(fraction: number) {
    const node = audio.current;
    if (!node || !node.duration) return;
    node.currentTime = fraction * node.duration;
    setTime({ current: node.currentTime, total: node.duration });
  }

  function restart() {
    const node = audio.current;
    if (!node) return;
    node.currentTime = 0;
    setTime({ current: 0, total: node.duration || 0 });
  }

  const progress = time.total ? time.current / time.total : 0;
  const playIcon = (size: string) => (
    <span className="grid">
      <Swap
        shrink
        value={playing ? "pause" : "play"}
        items={{
          pause: <PauseBoldIcon className={size} />,
          play: <PlayBoldIcon className={size} />,
        }}
      />
    </span>
  );

  return (
    <div className={cn("relative z-20 h-14 w-82", className)}>
      <motion.div
        ref={magnet.ref}
        data-open={open || undefined}
        initial={false}
        animate={{ gridTemplateRows: open ? "auto 1fr" : "auto 0fr" }}
        transition={spring}
        data-held={magnet.held || undefined}
        {...magnet.handlers}
        onPointerDown={(event) => {
          if (open && (event.target as Element).closest("[data-control]")) return;
          magnet.handlers.onPointerDown(event);
        }}
        className="magnetic group absolute inset-x-0 top-0 isolate grid touch-none rounded-[28px] bg-(image:--glass-fill) font-[family-name:system-ui] text-(--glass-ink) subpixel-antialiased shadow-[var(--glass-contact),var(--glass-lift)] [backdrop-filter:var(--glass-backdrop)] select-none"
      >
        <GlassRim />
        <GlassLight />
        <motion.div
          initial={false}
          animate={{ paddingBottom: open ? 0 : 12 }}
          transition={spring}
          className="flex items-center gap-3 p-3"
        >
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${title} by ${artist}`}
            onClick={() => setOpen(!open)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-[inherit] rounded-[18px] text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <motion.span
              initial={false}
              animate={{ width: open ? 56 : 32, height: open ? 56 : 32 }}
              transition={spring}
              className="grid shrink-0 overflow-hidden rounded-md transition-shadow duration-200 ease-out group-data-open:shadow-[0_4px_14px_rgb(0_0_0/0.35)] group-data-open:duration-250"
            >
              <img src={artwork} alt="" draggable={false} className="size-full object-cover" />
            </motion.span>
            <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-0.5 leading-4">
              <span className="text-[13px] font-semibold">
                <Marquee>{title}</Marquee>
              </span>
              <span className="truncate text-[12px] opacity-70">{artist}</span>
            </span>
          </button>
          <span className="grid size-8 shrink-0 place-items-center">
            <button
              type="button"
              inert={open}
              aria-label={playing ? "Pause" : "Play"}
              onClick={toggle}
              className="col-start-1 row-start-1 grid size-8 cursor-pointer place-items-center rounded-full transition-[opacity,filter] duration-200 ease-out group-data-open:opacity-0 group-data-open:blur-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {playIcon("size-5")}
            </button>
            <span
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 flex h-[18px] items-center gap-0.5 opacity-0 blur-[4px] transition-[opacity,filter] duration-200 ease-out group-data-open:opacity-55 group-data-open:blur-none"
            >
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  style={{ "--bar": bar } as CSSProperties}
                  className={cn(
                    "h-[35%] w-[3px] rounded-full bg-current motion-safe:[animation:glass-wave_900ms_ease-in-out_infinite] motion-safe:[animation-delay:calc(var(--bar)*-170ms)]",
                    !playing && "[animation-play-state:paused]",
                  )}
                />
              ))}
            </span>
          </span>
        </motion.div>
        <div className="min-h-0 overflow-hidden">
          <div inert={!open} data-control className="grid gap-1 px-3 pt-2.5 pb-3">
            {[
              <div key="progress" className="flex items-center gap-2.5 text-[11px] tabular-nums">
                <span className="w-7 opacity-70">{clock(time.current)}</span>
                <Slider.Root
                  aria-label="Playback position"
                  value={progress * 100}
                  step={0.1}
                  onValueChange={(next) => seek((next as number) / 100)}
                  className="flex-1 touch-none select-none"
                >
                  <Slider.Control className="flex h-4 cursor-pointer items-center">
                    <Slider.Track className="h-1 w-full overflow-hidden rounded-full bg-current/25">
                      <Slider.Indicator className="rounded-full bg-current/85" />
                      <Slider.Thumb className="size-0 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring" />
                    </Slider.Track>
                  </Slider.Control>
                </Slider.Root>
                <span className="w-7 text-end opacity-70">-{clock(time.total - time.current)}</span>
              </div>,
              <div key="controls" className="flex h-10 items-center justify-between">
                <button
                  type="button"
                  aria-label="Favorite"
                  aria-pressed={starred}
                  onClick={() => setStarred(!starred)}
                  className="grid size-10 cursor-pointer place-items-center rounded-full opacity-60 drop-shadow-[0_0_0_rgb(255_255_255/0)] transition-[opacity,filter] duration-250 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:drop-shadow-[0_0_6px_rgb(255_255_255/0.5)]"
                >
                  <span className="grid">
                    <Swap
                      className="not-data-active:blur-none"
                      value={starred ? "on" : "off"}
                      items={{
                        on: <StarBoldIcon className="size-5.5" />,
                        off: <StarOutlineBoldIcon className="size-5.5" />,
                      }}
                    />
                  </span>
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Restart"
                    onClick={restart}
                    className="grid size-10 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <RewindBoldIcon className="size-7" />
                  </button>
                  <button
                    type="button"
                    aria-label={playing ? "Pause" : "Play"}
                    onClick={toggle}
                    className="grid size-10 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {playIcon("size-8")}
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    className="grid size-10 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <FastForwardBoldIcon className="size-7" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="AirPods"
                  className="grid size-10 cursor-pointer place-items-center rounded-full opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <AirpodsBoldIcon className="size-5.5" />
                </button>
              </div>,
            ].map((section, index) => (
              <div
                key={index}
                style={{ "--i": index } as CSSProperties}
                className="opacity-0 blur-[4px] transition-[opacity,filter] duration-[120ms] ease-out group-data-open:opacity-100 group-data-open:blur-none group-data-open:delay-[calc(60ms+var(--i)*30ms)] group-data-open:duration-200"
              >
                {section}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export { GlassNowPlaying };
export type { GlassNowPlayingProps };
