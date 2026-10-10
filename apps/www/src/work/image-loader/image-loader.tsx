import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { DotGrid, type DotGridOptions } from "./dot-grid";

export type ImageLoaderStatus = "generating" | "done";

export type ImageLoaderProps = Omit<ComponentProps<"div">, "children"> & {
  status: ImageLoaderStatus;
  src?: string;
  alt: string;
  // Width over height, held while generating so the image lands without a jump.
  aspectRatio?: number;
  grid?: DotGridOptions;
};

const ENTER = { duration: 0.34, ease: [0.32, 0.72, 0, 1] } as const;
const REVEAL = { duration: 0.12, ease: "easeInOut" } as const;

export function ImageLoader({
  status,
  src,
  alt,
  aspectRatio = 1,
  grid,
  className,
  style,
  ...props
}: ImageLoaderProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      data-slot="image-loader"
      data-status={status}
      aria-busy={status === "generating"}
      style={{ ...style, "--image-loader-ratio": aspectRatio } as CSSProperties}
      className={cn("w-full max-w-[calc(50dvh*var(--image-loader-ratio))]", className)}
      {...props}
    >
      <motion.div
        initial={
          status === "generating" && !reducedMotion ? { opacity: 0, y: 6, scale: 0.97 } : false
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={ENTER}
        className={cn(
          "relative aspect-(--image-loader-ratio) w-full overflow-hidden rounded-3xl",
          status === "done" && "bg-white/4",
        )}
      >
        {status === "generating" ? (
          <DotGrid {...grid} className="absolute inset-0" />
        ) : (
          src && <Reveal key={src} src={src} alt={alt} />
        )}
      </motion.div>
    </div>
  );
}

function Reveal({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [decoded, setDecoded] = useState(false);

  // decode() also settles for an image that loaded before hydration, whose load
  // event React never hears.
  useEffect(() => {
    let current = true;
    ref.current?.decode().then(
      () => {
        if (current) setDecoded(true);
      },
      () => {},
    );
    return () => {
      current = false;
    };
  }, []);

  return (
    <motion.img
      ref={ref}
      src={src}
      alt={alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: decoded ? 1 : 0 }}
      transition={REVEAL}
      className="size-full object-cover"
    />
  );
}
