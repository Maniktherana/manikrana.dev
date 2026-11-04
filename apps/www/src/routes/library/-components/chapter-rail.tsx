import { useState, type CSSProperties } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import type { Chapter } from "@/routes/library/-components/chapter-navigation";

type RailProps = {
  chapters: Chapter[];
  current: number;
  visible: ReadonlySet<string>;
  position: MotionValue<number>;
  onJump: (chapter: Chapter) => void;
};

const ROW = 30;
const PITCH = 7.5;
const FIRST = 8 + ROW / 2;

export function ChapterRail({ chapters, current, visible, position, onJump }: RailProps) {
  const [open, setOpen] = useState(false);
  const smooth = useSpring(position, { stiffness: 900, damping: 60 });
  const cursor = useTransform(smooth, (value) => FIRST + value * ROW);
  const ruler = Array.from(
    { length: ((chapters.length - 1) * ROW) / PITCH + 1 },
    (_, slot) => FIRST + slot * PITCH,
  );

  return (
    <div className="pointer-events-none absolute inset-y-0 right-full z-50 me-24 hidden w-6 lg:block">
      <nav
        aria-label="Sections"
        className="sticky top-24"
        onPointerLeave={() => setOpen(false)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <div
          aria-hidden="true"
          onPointerEnter={() => setOpen(true)}
          className={cn(
            "pointer-events-auto flex w-6 flex-col pt-[4.25px] pb-1 transition-opacity ease-out",
            open ? "opacity-0 duration-100" : "opacity-100 duration-150 delay-50",
          )}
        >
          {chapters.map((chapter) => (
            <span key={chapter.id} className="flex h-[7.5px] items-center">
              <span
                className={cn(
                  "h-0.5 w-3 rounded-full transition-[background-color,opacity] duration-150 ease-out",
                  visible.has(chapter.id) ? "bg-foreground" : "bg-foreground/45 opacity-50",
                )}
              />
            </span>
          ))}
        </div>

        <div
          onFocus={() => setOpen(true)}
          className={cn(
            "absolute -top-[15px] -left-3 flex w-max flex-col rounded-2xl bg-popover px-3 py-2 shadow-raised transition-opacity ease-out",
            open
              ? "pointer-events-auto opacity-100 duration-150 delay-50"
              : "pointer-events-none opacity-0 duration-100",
          )}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 w-4.5">
            {ruler.map((y) => (
              <span
                key={y}
                style={{ "--y": `${y}px` } as CSSProperties}
                className="absolute top-(--y) left-0 flex -translate-y-1/2"
              >
                <Tick cursor={cursor} y={y} chapter={(y - FIRST) % ROW === 0} />
              </span>
            ))}
          </div>
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              aria-current={index === current ? "location" : undefined}
              onClick={() => onJump(chapter)}
              className="flex h-7.5 cursor-pointer items-center ps-6.5 pe-2 text-left text-sm leading-5 font-medium whitespace-nowrap text-control-foreground outline-none transition-[color] duration-150 ease-out hover:text-foreground focus-visible:text-foreground aria-[current=location]:text-foreground"
            >
              {chapter.title}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Tick({
  cursor,
  y,
  chapter,
}: {
  cursor: MotionValue<number>;
  y: number;
  chapter: boolean;
}) {
  const steps = useTransform(cursor, (value) => Math.abs(value - y) / PITCH);
  const width = useTransform(
    steps,
    chapter ? [0, 1, 2] : [0, 1, 2, 3],
    chapter ? [18, 13.5, 12] : [18, 11.25, 8.4, 7.5],
  );
  const scaleX = useTransform(width, (value) => value / 18);
  const opacity = useTransform(steps, [0, 1, 2], chapter ? [0.75, 0.4, 0.3] : [0.75, 0.4, 0.15]);
  return (
    <motion.span
      style={{ scaleX, opacity }}
      className="h-0.5 w-4.5 origin-left rounded-full bg-foreground"
    />
  );
}
