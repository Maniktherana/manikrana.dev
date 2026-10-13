import { useState, type ComponentProps } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { ProgressiveBlur } from "@manikrana/ui/components/progressive-blur";
import { SourceFavicon } from "./source-favicon";
import { sourceTitle, type CitationSource } from "./source";

export type CitationPreviewProps = ComponentProps<"div"> & {
  source: CitationSource;
};

const SHADOW = "shadow-[0_2px_4px_0_rgb(0_0_0/0.28),0_8px_20px_0_rgb(0_0_0/0.36)]";

export function CitationPreview({ source, className, ...props }: CitationPreviewProps) {
  const [failed, setFailed] = useState<string>();
  const image = source.image === failed ? undefined : source.image;

  if (!image) {
    return (
      <div
        className={cn(
          "flex flex-col rounded-lg bg-popover p-2.5 shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
          SHADOW,
          className,
        )}
        {...props}
      >
        <Headline source={source} />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full rounded-lg", SHADOW, className)} {...props}>
      <div className="relative aspect-video overflow-hidden rounded-[inherit] bg-[#161616] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgb(255_255_255/10%)]">
        <img
          src={image}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => setFailed(image)}
          className="absolute inset-0 size-full object-cover"
        />
        <ProgressiveBlur side="bottom" size={64} max={16} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,rgb(0_0_0/0),rgb(0_0_0/0.16)_45%,rgb(0_0_0/0.74))]" />
        <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5">
          <Headline source={source} overlay />
        </div>
      </div>
    </div>
  );
}

function Headline({ source, overlay = false }: { source: CitationSource; overlay?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <SourceFavicon
        src={source.favicon}
        size={17}
        className={overlay ? "bg-white" : "bg-popover"}
      />
      <div
        className={cn(
          "min-w-0 flex-1 text-xs leading-snug",
          overlay && "text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.5)]",
        )}
      >
        <p className={cn("truncate font-semibold", !overlay && "text-foreground")}>
          {sourceTitle(source)}
        </p>
      </div>
    </div>
  );
}
