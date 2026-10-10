"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { X } from "lucide-react";
import { Button } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { easeOut } from "@manikrana/ui/lib/motion";

type BannerStackItem = { id: string; title: string; description?: ReactNode };
type BannerStackProps = Omit<
  HTMLMotionProps<"section">,
  "children" | "animate" | "initial" | "transition"
> & {
  items: readonly BannerStackItem[];
  onDismiss?: (id: string) => void;
};

function Banner({
  item,
  depth,
  offset,
  expanded,
  reducedMotion,
  onDismiss,
  elementRef,
}: {
  item: BannerStackItem;
  depth: number;
  offset: number;
  expanded: boolean;
  reducedMotion: boolean;
  onDismiss?: (id: string) => void;
  elementRef: (element: HTMLElement | null) => void;
}) {
  const present = useIsPresent();
  const hidden = !present || (!expanded && depth > 0);
  return (
    <motion.article
      ref={elementRef}
      data-slot="stack-banner"
      data-depth={present ? depth : 3}
      aria-hidden={hidden}
      inert={hidden}
      className="absolute bottom-0 left-0 flex w-full items-start gap-3 rounded-card bg-card p-4 shadow-raised data-[depth=0]:z-30 data-[depth=1]:z-20 data-[depth=2]:z-10 data-[depth=3]:z-0"
      initial={
        reducedMotion ? { opacity: 0 } : { y: 60, scale: 0.97, opacity: 0, filter: "blur(2px)" }
      }
      animate={{
        bottom: reducedMotion ? offset : 0,
        y: reducedMotion ? 0 : -offset,
        scale: expanded ? 1 : 1 - depth * 0.06,
        opacity: expanded ? 1 : depth === 0 ? 1 : depth === 1 ? 0.6 : 0.36,
        filter: expanded ? "blur(0px)" : `blur(${depth}px)`,
        originY: depth === 0 ? 0.5 : 1,
      }}
      exit={
        reducedMotion
          ? { opacity: 0, transition: { duration: 0 } }
          : {
              y: -36,
              originY: 1,
              scale: 0.82,
              opacity: 0,
              filter: "blur(2px)",
              transition: { duration: 0.25, ease: easeOut },
            }
      }
      transition={{ type: "tween", duration: reducedMotion ? 0 : 0.35, ease: easeOut }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.description && (
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Dismiss ${item.title}`}
          onClick={() => onDismiss(item.id)}
        >
          <X />
        </Button>
      )}
    </motion.article>
  );
}

function BannerStack({
  items,
  onDismiss,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
  ...props
}: BannerStackProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = Boolean(useReducedMotion());
  const expanded = hovered || focused || reducedMotion;
  const elements = useRef(new Map<string, HTMLElement>());
  const [heights, setHeights] = useState<Record<string, number>>({});
  const visible = items.slice(0, 3);

  useEffect(() => {
    if (onDismiss) for (const item of items.slice(3)) onDismiss(item.id);
  }, [items, onDismiss]);

  useLayoutEffect(() => {
    const measure = () => {
      setHeights((previous) => {
        const next: Record<string, number> = {};
        for (const item of items.slice(0, 3)) {
          const element = elements.current.get(item.id);
          if (element) next[item.id] = element.offsetHeight;
        }
        return Object.keys(next).length === Object.keys(previous).length &&
          Object.entries(next).every(([id, height]) => previous[id] === height)
          ? previous
          : next;
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const element of elements.current.values()) observer.observe(element);
    return () => observer.disconnect();
  }, [items]);

  const offsets = visible.map((_, depth) =>
    expanded
      ? visible.slice(0, depth).reduce((sum, item) => sum + (heights[item.id] ?? 88) + 8, 0)
      : depth * 12,
  );
  const height =
    visible.length === 0
      ? 0
      : expanded
        ? visible.reduce((sum, item) => sum + (heights[item.id] ?? 88), 0) +
          (visible.length - 1) * 8
        : (heights[visible[0].id] ?? 88) + (visible.length - 1) * 12;

  return (
    <motion.section
      {...props}
      data-slot="banner-stack"
      data-expanded={expanded}
      aria-label={props["aria-label"] ?? "Notifications"}
      className={cn("relative w-full", className)}
      initial={false}
      animate={{ height }}
      transition={{ type: "tween", duration: reducedMotion ? 0 : 0.35, ease: easeOut }}
      onMouseEnter={(event) => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      onFocusCapture={(event) => {
        setFocused(true);
        onFocusCapture?.(event);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        onBlurCapture?.(event);
      }}
    >
      <output className="sr-only">{visible[0]?.title}</output>
      <AnimatePresence initial={false}>
        {visible.map((item, depth) => (
          <Banner
            key={item.id}
            item={item}
            depth={depth}
            offset={offsets[depth]}
            expanded={expanded}
            reducedMotion={reducedMotion}
            onDismiss={onDismiss}
            elementRef={(element) => {
              if (element) elements.current.set(item.id, element);
              else elements.current.delete(item.id);
            }}
          />
        ))}
      </AnimatePresence>
    </motion.section>
  );
}

export { BannerStack, type BannerStackItem, type BannerStackProps };
