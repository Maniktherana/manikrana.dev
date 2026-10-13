import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right";
import { CloseBoldIcon } from "@/components/icons/close-bold";
import { CopyIcon } from "@/components/icons/copy";
import { GlobeIcon } from "@/components/icons/globe";
import { ProgressiveBlur } from "@manikrana/ui/components/progressive-blur";

export type WebImage = {
  id: string;
  url: string;
  title?: string;
  description?: string;
  sourceName?: string;
  sourceUrl?: string;
  faviconUrl?: string;
};

export type ImageTrayProps = Omit<ComponentProps<"div">, "children"> & {
  image: WebImage | null;
  onClose: () => void;
  onCopy?: (image: WebImage) => void;
};

// Reanimated's withSpring({ duration: 300, dampingRatio: 0.86 }), solved for stiffness and damping.
const SPRING = { type: "spring", stiffness: 4039.55, damping: 218.64, mass: 4 } as const;
const FADE = {
  in: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  out: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
} as const;
const INSTANT = { duration: 0 } as const;
const BACKDROP_OPACITY = 0.55;
const PAN = { activate: 8, cancel: 24, dismissBelow: 0.5 };

const PRESS =
  "transform-gpu outline-none [backface-visibility:hidden] transition-[scale,opacity] duration-150 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-97 active:opacity-78 active:duration-50 disabled:pointer-events-none aria-disabled:pointer-events-none motion-reduce:active:scale-100";

const SHADOW = "text-shadow-[0_1px_3px_#000]";

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export function ImageTray({ image, onClose, onCopy, className, ...props }: ImageTrayProps) {
  const reduceMotion = useReducedMotion();
  const open = image !== null;
  const [shown, setShown] = useState(image);
  const surface = useRef<HTMLDialogElement>(null);
  const pan = useRef<{
    id: number;
    x: number;
    y: number;
    scale: number;
    from: number;
    active: boolean;
  } | null>(null);
  const progress = useMotionValue(0);
  const fade = useMotionValue(1);
  const backdrop = useTransform(() => clamp01(progress.get()) * fade.get() * BACKDROP_OPACITY);
  const opacity = useTransform(() => (progress.get() <= 0.001 ? 0 : fade.get()));
  const y = useTransform(progress, (value) => {
    const hidden = 1 - clamp01(value);
    return `calc(${hidden * 100}% + ${hidden} * var(--image-tray-gap))`;
  });

  if (image && image !== shown) setShown(image);

  useEffect(() => {
    let live = true;
    if (!reduceMotion) fade.jump(1);
    else if (open) {
      if (progress.get() <= 0.001) fade.jump(0);
      progress.jump(1);
    }
    const controls = reduceMotion
      ? animate(fade, open ? 1 : 0, open ? FADE.in : FADE.out)
      : animate(progress, open ? 1 : 0, SPRING);
    controls.then(() => {
      if (!live || open) return;
      setShown(null);
      progress.jump(0);
      fade.jump(1);
    });
    return () => {
      live = false;
      controls.stop();
    };
  }, [open, progress, fade, reduceMotion]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    surface.current?.focus({ preventScroll: true });
    const moved = document.activeElement === surface.current;
    return () => {
      if (moved && previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [open]);

  if (!shown) return null;

  const url = shown.sourceUrl;
  const headline = shown.title ?? shown.sourceName ?? "Web search image";
  const caption = shown.title ?? shown.description;

  function startPan(event: PointerEvent<HTMLDivElement>) {
    if (!open || !event.isPrimary) return;
    const region = event.currentTarget;
    pan.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scale: region.getBoundingClientRect().width / region.offsetWidth || 1,
      from: 1,
      active: false,
    };
  }

  function movePan(event: PointerEvent<HTMLDivElement>) {
    const state = pan.current;
    if (!state || state.id !== event.pointerId || !surface.current) return;
    const dx = (event.clientX - state.x) / state.scale;
    const dy = (event.clientY - state.y) / state.scale;
    if (!state.active) {
      if (Math.abs(dx) > PAN.cancel) {
        pan.current = null;
        return;
      }
      if (Math.abs(dy) < PAN.activate) return;
      progress.stop();
      state.active = true;
      state.from = progress.get();
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    progress.set(clamp01(state.from - dy / surface.current.offsetHeight));
  }

  function endPan(event: PointerEvent<HTMLDivElement>) {
    const state = pan.current;
    if (!state || state.id !== event.pointerId) return;
    pan.current = null;
    if (!state.active) return;
    if (progress.get() < PAN.dismissBelow) onClose();
    else animate(progress, 1, reduceMotion ? INSTANT : SPRING);
  }

  function keepFocus(event: KeyboardEvent<HTMLDialogElement>) {
    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      "button:not(:disabled), a[href]",
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    const wrap = event.shiftKey
      ? active === first || active === event.currentTarget
      : active === last;
    if (!wrap) return;
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }

  const copy = () => {
    if (!url) return;
    onClose();
    navigator.clipboard.writeText(url).then(
      () => onCopy?.(shown),
      () => undefined,
    );
  };

  return (
    <div
      data-slot="image-tray"
      data-state={open ? "open" : "closed"}
      className={cn(
        "fixed inset-0 z-50 overflow-hidden [--image-tray-gap:max(16px,env(safe-area-inset-bottom))] [--image-tray-max-width:408px]",
        !open && "pointer-events-none",
        className,
      )}
      {...props}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-black"
        onClick={onClose}
        style={{ opacity: backdrop }}
      />
      {/* `open` rather than showModal(), so it stays in its container instead of the top layer. */}
      <motion.dialog
        ref={surface}
        open
        aria-label={headline}
        aria-modal="true"
        className="absolute inset-x-4 bottom-(--image-tray-gap) mx-auto my-0 flex w-auto max-w-(--image-tray-max-width) flex-col overflow-hidden rounded-[40px] border-0 bg-[#191919] px-6 pt-4.5 pb-4 outline-none select-none"
        onKeyDown={(event) => {
          if (!open) return;
          if (event.key === "Escape") onClose();
          if (event.key === "Tab") keepFocus(event);
        }}
        style={{ y, opacity }}
        tabIndex={-1}
      >
        <div className="-mx-6 -mt-4.5">
          <div className="relative aspect-video overflow-hidden rounded-t-[40px] bg-[#2a2a2a]">
            <img
              src={shown.url}
              alt={headline}
              draggable={false}
              className="absolute inset-0 size-full object-cover"
            />
            <ProgressiveBlur side="bottom" size={112} max={24} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-38 bg-[rgb(25_25_25/0.468)] backdrop-saturate-180 [mask-image:linear-gradient(to_bottom,rgb(255_255_255/0),rgb(255_255_255/0.08)_22%,rgb(255_255_255/0.72)_62%,rgb(255_255_255))]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-38 bg-[linear-gradient(to_bottom,rgb(0_0_0/0),rgb(0_0_0/0.16)_45%,rgb(0_0_0/0.74))]" />
            <div className="pointer-events-none absolute inset-x-4 bottom-3.5">
              <div className="flex items-center gap-2">
                <Favicon src={shown.faviconUrl} />
                <p
                  className={cn(
                    "min-w-0 flex-1 truncate text-[13px] leading-4.5 font-semibold text-white",
                    SHADOW,
                  )}
                >
                  {shown.sourceName ?? "Web image"}
                </p>
              </div>
              {caption && (
                <p
                  className={cn(
                    "mt-1.75 line-clamp-2 text-xs leading-4 text-white opacity-86",
                    SHADOW,
                  )}
                >
                  {caption}
                </p>
              )}
            </div>
            <div
              className="absolute inset-x-0 top-0 z-2 flex h-13.5 touch-none justify-end pt-2.5 pr-2.5"
              onPointerCancel={endPan}
              onPointerDown={startPan}
              onPointerMove={movePan}
              onPointerUp={endPan}
            >
              <button
                type="button"
                aria-label="Close image details"
                className={cn(PRESS, "flex size-11 items-center justify-center rounded-full")}
                onClick={onClose}
              >
                <span className="flex size-8.5 items-center justify-center rounded-full bg-black/52">
                  <CloseBoldIcon
                    className="text-white"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  />
                </span>
              </button>
            </div>
          </div>
          <div className="flex h-11 items-center px-6">
            <p className={cn("truncate text-xs leading-4 text-[#9c9c9c]", url && "select-text")}>
              {url ?? "Source URL unavailable"}
            </p>
          </div>
        </div>
        <div className="flex h-11 gap-2.5">
          <button
            type="button"
            aria-label="Copy image source link"
            className={cn(
              PRESS,
              "flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#2a2a2a]",
            )}
            disabled={!url}
            onClick={copy}
          >
            <CopyIcon className={cn("size-4.5", url ? "text-[#f5f5f5]" : "text-[#9c9c9c]")} />
          </button>
          <a
            aria-disabled={!url || undefined}
            aria-label="Visit image source"
            className={cn(
              PRESS,
              "relative flex h-11 flex-1 items-center justify-center gap-1.75 rounded-full bg-[#f5f5f5] text-lg leading-6 font-semibold text-[#262626]",
            )}
            href={url}
            onClick={onClose}
            rel="noopener noreferrer"
            target="_blank"
          >
            {!url && (
              <span className="absolute inset-0 rounded-full bg-[#191919] opacity-[0.678]" />
            )}
            <span className="relative">Visit</span>
            <ArrowUpRightIcon className="relative size-5 -translate-y-[0.5px]" />
          </a>
        </div>
      </motion.dialog>
    </div>
  );
}

function Favicon({ src }: { src?: string }) {
  const [failed, setFailed] = useState<string>();
  const fallback = !src || failed === src;

  return (
    <span className="relative flex size-4.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
      {fallback ? (
        <GlobeIcon className="size-2.5 text-[#9c9c9c]" />
      ) : (
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full rounded-full object-cover"
          onError={() => setFailed(src)}
        />
      )}
    </span>
  );
}
