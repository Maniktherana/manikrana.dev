import { useState, type ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import type { WebImage } from "./image-tray";

export type ImageStripProps = Omit<ComponentProps<"div">, "children" | "onSelect"> & {
  images: readonly WebImage[];
  onSelect?: (image: WebImage) => void;
};

const SLIDE = { duration: 0.22, ease: [0.23, 1, 0.32, 1] } as const;
const FADE = { duration: 0.16, ease: [0.455, 0.03, 0.515, 0.955] } as const;

// scroll-fade-x needs "shadcn/tailwind.css".
export function ImageStrip({ images, onSelect, className, ...props }: ImageStripProps) {
  const reduceMotion = useReducedMotion();
  const [present] = useState(() => new Set(images.map(({ id }) => id)));

  if (images.length === 0) return null;

  return (
    <div
      data-slot="image-strip"
      className={cn(
        "scroll-fade-x h-26 overflow-x-auto overscroll-x-contain [--scroll-fade-reveal:--spacing(3)] [--scroll-fade-size:--spacing(6)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    >
      <div className="flex h-full w-max gap-2">
        {images.map((image, index) => (
          <motion.button
            key={image.id}
            type="button"
            aria-haspopup="dialog"
            aria-label={`View image: ${image.title ?? image.sourceName ?? "web search result"}`}
            animate={{ opacity: 1, x: 0 }}
            className="relative h-26 w-37 shrink-0 overflow-hidden rounded-[14px] bg-[#2a2a2a] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            initial={
              present.has(image.id) ? false : reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }
            }
            onClick={() => onSelect?.(image)}
            transition={reduceMotion ? FADE : { ...SLIDE, delay: Math.min(index, 4) * 0.035 }}
          >
            <Thumbnail src={image.url} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Thumbnail({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      ref={(node) => {
        if (node?.complete) setLoaded(true);
      }}
      src={src}
      alt=""
      data-loaded={loaded || undefined}
      draggable={false}
      className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-140 ease-[ease-in-out] data-loaded:opacity-100 motion-reduce:transition-none"
      onLoad={() => setLoaded(true)}
    />
  );
}
