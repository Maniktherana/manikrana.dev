import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChapterNavigatorItem = {
  key: string;
  userKey: string;
  rowKeys: string[];
  prompt: string;
  response: string;
};

type HoveredChapter = {
  key: string;
  top: number;
};

const CHAPTER_PREVIEW_LEFT = 44;
const CHAPTER_PREVIEW_WIDTH = 320;

export function ChapterNavigator({
  items,
  scrollRef,
}: {
  items: ChapterNavigatorItem[];
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<HoveredChapter | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<ReadonlySet<string>>(() => new Set());
  const itemSignature = useMemo(
    () => items.map((item) => `${item.key}:${item.rowKeys.join(",")}`).join("\n"),
    [items],
  );
  const hoveredIndex = hovered ? items.findIndex((item) => item.key === hovered.key) : -1;
  const hoveredItem = hoveredIndex >= 0 ? (items[hoveredIndex] ?? null) : null;

  const findRow = useCallback(
    (key: string) => {
      const container = scrollRef.current;
      if (!container) return null;
      return container.querySelector<HTMLElement>(`[data-chat-row-key="${cssEscape(key)}"]`);
    },
    [scrollRef],
  );

  const scrollToChapter = useCallback(
    (item: ChapterNavigatorItem) => {
      const container = scrollRef.current;
      const target = findRow(item.userKey);
      if (!container || !target) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const top =
        container.scrollTop + targetRect.top - containerRect.top - container.clientHeight * 0.24;

      container.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    },
    [findRow, scrollRef],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const composerHeight = parseFloat(
          getComputedStyle(container).getPropertyValue("--composer-height"),
        );
        const visibleTop = containerRect.top;
        const visibleBottom =
          containerRect.bottom - (Number.isFinite(composerHeight) ? composerHeight : 0) - 8;
        const next = new Set<string>();

        for (const item of items) {
          const visible = item.rowKeys.some((rowKey) => {
            const row = findRow(rowKey);
            if (!row) return false;
            const rect = row.getBoundingClientRect();
            return rect.bottom > visibleTop && rect.top < visibleBottom;
          });
          if (visible) next.add(item.key);
        }

        setVisibleKeys((current) => (sameSet(current, next) ? current : next));
      });
    };

    update();
    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const content = container.firstElementChild;
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    if (content instanceof Element) resizeObserver.observe(content);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [findRow, itemSignature, items, scrollRef]);

  useEffect(() => {
    if (!hovered || items.some((item) => item.key === hovered.key)) return;
    setHovered(null);
  }, [hovered, items]);

  const setHoveredFromElement = useCallback((item: ChapterNavigatorItem, element: HTMLElement) => {
    const rail = railRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    setHovered({
      key: item.key,
      top: Math.max(0, itemRect.top - railRect.top),
    });
  }, []);

  if (items.length < 4) return null;

  return (
    <nav
      aria-label="Chapters"
      className="pointer-events-none absolute top-1/2 left-2 z-20 hidden -translate-y-1/2 lg:block"
      data-slot="chapter-navigator"
    >
      <div
        className="relative"
        data-slot="chapter-navigator-positioner"
        style={
          {
            "--chapter-preview-left": `${CHAPTER_PREVIEW_LEFT}px`,
            "--chapter-preview-width": `${CHAPTER_PREVIEW_WIDTH}px`,
          } as CSSProperties
        }
      >
        <div
          ref={railRef}
          className="pointer-events-auto flex max-h-56 w-8 [scrollbar-width:none] flex-col overflow-y-auto py-1 [&::-webkit-scrollbar]:hidden"
          data-slot="chapter-navigator-rail"
          onPointerLeave={() => setHovered(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setHovered(null);
            }
          }}
        >
          {items.map((item, index) => {
            const hoverDistance = hoveredIndex >= 0 ? Math.abs(index - hoveredIndex) : null;
            return (
              <ChapterLine
                key={item.key}
                item={item}
                hoverDistance={hoverDistance}
                lit={visibleKeys.has(item.key)}
                onActivate={() => scrollToChapter(item)}
                onHover={(element) => setHoveredFromElement(item, element)}
              />
            );
          })}
        </div>
        {hovered && hoveredItem ? (
          <ChapterPreviewCard item={hoveredItem} top={hovered.top} />
        ) : null}
      </div>
    </nav>
  );
}

function ChapterLine({
  item,
  hoverDistance,
  lit,
  onActivate,
  onHover,
}: {
  item: ChapterNavigatorItem;
  hoverDistance: number | null;
  lit: boolean;
  onActivate: () => void;
  onHover: (element: HTMLElement) => void;
}) {
  const highlighted = hoverDistance !== null ? hoverDistance === 0 : lit;

  return (
    <button
      type="button"
      aria-label={`Jump to chapter: ${item.prompt}`}
      onClick={onActivate}
      onFocus={(event) => onHover(event.currentTarget)}
      onPointerEnter={(event) => onHover(event.currentTarget)}
      className="group/chapter flex h-2.5 w-8 cursor-pointer items-center justify-start outline-none"
      data-slot="chapter-navigator-trigger"
    >
      <span
        className={cn(
          "h-px rounded-full transition-[width,background-color,opacity] duration-150 ease-out group-focus-visible/chapter:bg-ring",
          lineWidthClass(hoverDistance),
          highlighted ? "bg-foreground opacity-100" : "bg-foreground/45 opacity-50",
        )}
        data-slot="chapter-navigator-line"
      />
    </button>
  );
}

function ChapterPreviewCard({ item, top }: { item: ChapterNavigatorItem; top: number }) {
  return (
    <Card
      size="sm"
      className="pointer-events-none absolute left-[var(--chapter-preview-left)] z-30 w-[var(--chapter-preview-width)] max-w-[min(var(--chapter-preview-width),calc(100vw-5rem))] rounded-xl border border-border/70 bg-popover px-3 py-2.5 text-popover-foreground shadow-[var(--shadow-popover)]"
      data-slot="chapter-preview-card"
      style={{ top }}
    >
      <div className="line-clamp-1 text-[13px] leading-5 font-semibold text-foreground">
        {item.prompt}
      </div>
      {item.response ? (
        <div className="mt-1 line-clamp-3 text-[13px] leading-5 text-muted-foreground">
          {item.response}
        </div>
      ) : null}
    </Card>
  );
}

function lineWidthClass(hoverDistance: number | null): string {
  if (hoverDistance === 0) return "w-7";
  if (hoverDistance === 1) return "w-5";
  if (hoverDistance === 2) return "w-3.5";
  return "w-1.5";
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

function cssEscape(value: string): string {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
