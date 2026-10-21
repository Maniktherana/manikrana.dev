import { useRef, useState, type ComponentProps } from "react";
import { Popover } from "@base-ui/react/popover";
import { cn } from "@manikrana/ui/lib/utils";
import { ChevronLeftIcon } from "@/components/icons/chevron-left";
import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { CitationPreview } from "./citation-preview";
import { SourceFavicon } from "./source-favicon";
import { sourceHref, sourceName, type CitationSource } from "./source";

export type { CitationSource } from "./source";

const CHIP =
  "group inline-flex h-[18px] w-fit max-w-full shrink-0 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-full border-[0.5px] border-white/10 bg-foreground/10 py-0.5 pr-2 pl-0.5 align-middle text-[0.7rem] leading-[1.35] font-medium whitespace-nowrap text-[#d4d4d8] outline-ring/50 transition-colors select-none [--favicon-surface:color-mix(in_srgb,var(--background)_90%,var(--foreground))] hover:bg-foreground hover:text-background hover:[--favicon-surface:var(--foreground)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

const OPEN_DELAY_MS = 120;

const POP =
  "w-80 max-w-[calc(100vw-2rem)] origin-(--transform-origin) text-left outline-none data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none!";

export type CitationChipProps = Omit<ComponentProps<"a">, "href" | "children"> & {
  source: CitationSource;
};

export function CitationChip({ source, className, ...props }: CitationChipProps) {
  const name = sourceName(source);
  const touch = useRef(false);
  const href = sourceHref(source.url);

  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={OPEN_DELAY_MS}
        nativeButton={false}
        render={
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open source: ${name}`}
            className={cn(CHIP, className)}
            {...props}
          />
        }
        onPointerDown={(event) => {
          touch.current = event.pointerType !== "mouse";
        }}
        onClick={(event) => {
          if (touch.current) event.preventDefault();
          else event.preventBaseUIHandler();
        }}
      >
        <SourceFavicon src={source.favicon} size={14} />
        <span className="truncate">{name}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={8} className="isolate z-50">
          <Popover.Popup className={cn(POP, "rounded-xl")}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open source: ${name}`}
              className="block rounded-xl outline-ring/50 focus-visible:outline-2"
            >
              <CitationPreview source={source} />
            </a>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export type CitationGroupChipProps = Omit<ComponentProps<"button">, "children"> & {
  sources: readonly CitationSource[];
};

// A popover, not a tooltip, so its arrows and links are reachable from the keyboard.
export function CitationGroupChip({ sources, className, ...props }: CitationGroupChipProps) {
  const [index, setIndex] = useState(0);
  const source = sources[index];
  if (!source) return null;
  const step = (by: number) =>
    setIndex((current) => (current + by + sources.length) % sources.length);

  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={OPEN_DELAY_MS}
        aria-label={`${sources.length} sources`}
        className={cn(CHIP, className)}
        {...props}
      >
        <span className="inline-flex shrink-0 items-center">
          {sources.slice(0, 3).map((entry, position) => (
            <SourceFavicon
              key={entry.url}
              src={entry.favicon}
              size={16}
              className={cn("border-2", position > 0 && "-ml-[7px]")}
            />
          ))}
        </span>
        <span className="text-foreground/55 group-hover:text-background/70">+{sources.length}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={8} className="isolate z-50">
          <Popover.Popup
            className={cn(
              POP,
              "rounded-xl bg-popover p-1 shadow-[0_-1px_0_0_rgb(255_255_255/6%),0_0_0_1px_rgb(255_255_255/6%),0_0_0_1px_#2c2c2c,0_4px_8px_0_rgb(0_0_0/32%),0_2px_4px_0_rgb(0_0_0/28%)]",
            )}
          >
            <a
              href={sourceHref(source.url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open source: ${sourceName(source)}`}
              className="block rounded-lg outline-ring/50 focus-visible:outline-2"
            >
              <CitationPreview source={source} className="shadow-none" />
            </a>
            <div className="flex h-8 items-center justify-between pt-1">
              <button
                type="button"
                aria-label="Previous source"
                onClick={() => step(-1)}
                className={STEP}
              >
                <ChevronLeftIcon />
              </button>
              <span aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
                {index + 1} / {sources.length}
              </span>
              <button
                type="button"
                aria-label="Next source"
                onClick={() => step(1)}
                className={STEP}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

const STEP =
  "flex size-7 items-center justify-center rounded-lg text-control-foreground outline-none transition-[background-color,color,scale] duration-150 ease-out hover:bg-control hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]";
