import { useState, type CSSProperties } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { GlobeIcon } from "@/components/icons";

export type SourceFaviconProps = {
  src?: string;
  size: number;
  className?: string;
};

export function SourceFavicon({ src, size, className }: SourceFaviconProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span
      style={
        {
          "--favicon-size": `${size}px`,
          "--globe-size": `${Math.max(8, Math.floor(size * 0.6))}px`,
        } as CSSProperties
      }
      className={cn(
        "relative inline-flex size-(--favicon-size) shrink-0 items-center justify-center overflow-hidden rounded-full border-[color:var(--favicon-surface,var(--background))] bg-[color:var(--favicon-surface,var(--background))] transition-colors",
        className,
      )}
    >
      {!loaded && (
        <GlobeIcon strokeWidth={1.5} className="size-(--globe-size) text-muted-foreground" />
      )}
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          className="absolute inset-0 size-full rounded-full bg-inherit object-cover"
        />
      )}
    </span>
  );
}
