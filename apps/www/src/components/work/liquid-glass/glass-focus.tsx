import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { cn } from "@manikrana/ui/lib/utils";
import { animate } from "motion/react";
import { ChevronUpDownBoldIcon } from "@/components/icons/chevron-up-down-bold";
import { Glass, GlassRim } from "./primitives/glass";
import { focusClose, focusOpen } from "./primitives/springs";

type GlassFocusOption = {
  color: string;
  description: string;
  icon: ReactNode;
  label: string;
};

type GlassFocusProps = {
  className?: string;
  container?: RefObject<HTMLElement | null>;
  onValueChange: (value: string) => void;
  options: readonly GlassFocusOption[];
  value: string;
};

const EMERGE = 70;
const TUCK = 160;
const LEAD = 40;
const EDGE = 16;
const NARROW = 600;

function calm() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function place(trigger: HTMLElement | null, list: HTMLElement | null) {
  const frame = list?.offsetParent;
  if (!trigger || !list || !(frame instanceof HTMLElement)) return;
  const box = frame.getBoundingClientRect();
  const from = trigger.getBoundingClientRect();
  const zoom = frame.offsetWidth / box.width || 1;
  const right = (from.right - box.left) * zoom;
  const middle = (from.top + from.height / 2 - box.top) * zoom;
  const fit = (start: number, size: number, room: number) =>
    Math.min(Math.max(start, EDGE), room - size - EDGE);
  const centered = frame.offsetWidth < NARROW;
  list.style.setProperty(
    "--left",
    `${centered ? (frame.offsetWidth - list.offsetWidth) / 2 : fit(right - list.offsetWidth, list.offsetWidth, frame.offsetWidth)}px`,
  );
  list.style.setProperty(
    "--top",
    `${fit(middle - list.offsetHeight / 2, list.offsetHeight, frame.offsetHeight)}px`,
  );
}

function unpin(nodes: HTMLElement[]) {
  for (const node of nodes) {
    for (const property of ["transform", "width", "height", "column-gap", "opacity", "filter"]) {
      node.style.removeProperty(property);
    }
  }
}

function morph(trigger: HTMLElement | null, list: HTMLElement | null, back: boolean) {
  const row = list?.querySelector<HTMLElement>("[data-checked]");
  const shape = row?.querySelector<HTMLElement>("[data-shape]");
  const content = row?.querySelector<HTMLElement>("[data-content]");
  const dot = row?.querySelector<HTMLElement>("[data-dot]");
  const triggerDot = trigger?.querySelector<HTMLElement>("[data-dot]");
  if (!trigger || !list || !row || !shape || !content || !dot || !triggerDot || calm()) {
    return;
  }
  const others = [...list.querySelectorAll<HTMLElement>("[data-row]:not([data-checked])")];
  if (!back) unpin([shape, content, dot, ...others]);
  const from = trigger.getBoundingClientRect();
  const to = row.getBoundingClientRect();
  const zoom = row.offsetWidth / to.width || 1;
  const dx = (from.left - to.left) * zoom;
  const dy = (from.top - to.top) * zoom;
  const lift = (from.height * zoom - row.offsetHeight) / 2;
  const shift = (triggerDot.getBoundingClientRect().left - dot.getBoundingClientRect().left) * zoom;
  const small = triggerDot.offsetWidth;
  const large = dot.offsetWidth;
  const gaps = [getComputedStyle(trigger).columnGap, getComputedStyle(content).columnGap] as const;
  const ends = <T,>(closed: T, opened: T) => (back ? [opened, closed] : [closed, opened]);
  const spring = { ...(back ? focusClose : focusOpen), delay: back ? LEAD / 1000 : 0 };

  if (back) row.dataset.returning = "";
  else {
    // Motion starts on the next frame; pin the first one so the row never paints in place.
    Object.assign(shape.style, {
      transform: `translateX(${dx}px) translateY(${dy}px)`,
      width: `${from.width * zoom}px`,
      height: `${from.height * zoom}px`,
    });
    Object.assign(content.style, {
      transform: `translateX(${shift}px) translateY(${dy + lift}px)`,
      columnGap: gaps[0],
    });
    Object.assign(dot.style, { width: `${small}px`, height: `${small}px` });
  }
  const runs = [
    animate(
      shape,
      {
        x: ends(dx, 0),
        y: ends(dy, 0),
        width: ends(from.width * zoom, row.offsetWidth),
        height: ends(from.height * zoom, row.offsetHeight),
      },
      spring,
    ),
    animate(
      content,
      {
        x: ends(shift, 0),
        y: ends(dy + lift, 0),
        columnGap: ends(...gaps),
      },
      spring,
    ),
    animate(
      dot,
      {
        width: ends(small, large),
        height: ends(small, large),
      },
      spring,
    ),
  ];

  const center = to.top + to.height / 2;
  for (const other of others) {
    const box = other.getBoundingClientRect();
    const behind = { y: (center - (box.top + box.height / 2)) * zoom, scale: 0.92 };
    if (back) {
      animate(other, behind, { ...focusClose, duration: TUCK / 1000 });
      animate(other, { opacity: 0 }, { duration: TUCK / 1000, ease: "easeOut" });
    } else {
      Object.assign(other.style, {
        transform: `translateY(${behind.y}px) scale(0.92)`,
        opacity: "0",
        filter: "blur(4px)",
      });
      runs.push(
        animate(other, { y: 0, scale: 1 }, { ...focusOpen, delay: EMERGE / 1000 }),
        animate(
          other,
          { opacity: 1, filter: "blur(0px)" },
          { duration: 0.22, delay: EMERGE / 1000, ease: "easeOut" },
        ),
      );
    }
  }

  if (back) return;
  // Hand the settled rows back to CSS, so data-checked styles the row picked next.
  void Promise.all(runs.map((run) => run.finished)).then(() => {
    if (row.dataset.returning === undefined) unpin([shape, content, dot, ...others]);
  });
}

function FocusRows({
  current,
  list,
  onOpened,
  onValueChange,
  options,
}: {
  current: string;
  list: RefObject<HTMLDivElement | null>;
  onOpened: () => void;
  onValueChange: (value: string) => void;
  options: readonly GlassFocusOption[];
}) {
  const opened = useRef(onOpened);
  opened.current = onOpened;

  useLayoutEffect(() => {
    opened.current();
  }, []);

  return (
    <RadioGroup
      ref={list}
      aria-label="Focus"
      value={current}
      onValueChange={(next) => onValueChange(next as string)}
      className="absolute top-(--top) left-(--left) grid w-65 gap-2"
    >
      {options.map((option) => (
        <Radio.Root
          key={option.label}
          data-row
          value={option.label}
          style={{ "--tone": option.color } as CSSProperties}
          className="group/row relative isolate flex h-14 cursor-pointer data-checked:z-10 items-center rounded-full text-start font-[family-name:system-ui] [--ink:var(--glass-ink)] select-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring data-checked:[--ink:black] data-checked:data-returning:[--ink:var(--glass-ink)]"
        >
          <span
            data-shape
            aria-hidden="true"
            className="absolute top-0 left-0 -z-10 size-full rounded-full bg-(image:--glass-fill) shadow-[var(--glass-contact),var(--glass-lift)] [backdrop-filter:blur(8px)_saturate(1.6)]"
          >
            <span className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-250 ease-out group-data-checked/row:opacity-100 group-data-checked/row:starting:opacity-0 group-data-returning/row:opacity-0 group-data-returning/row:delay-40" />
            <GlassRim deep />
            <ChevronUpDownBoldIcon className="absolute top-1/2 right-4 size-2.5 -translate-y-1/2 text-(--glass-ink) opacity-0 transition-opacity duration-150 ease-out group-data-checked/row:starting:opacity-60 group-data-returning/row:opacity-60" />
          </span>
          <span
            data-content
            className="flex items-center gap-3 ps-2 text-(--ink) transition-[color] duration-250 ease-out"
          >
            <span
              data-dot
              className="grid size-10 shrink-0 place-items-center rounded-full bg-(--tone) text-white [&_svg]:size-1/2"
            >
              {option.icon}
            </span>
            <span className="grid leading-4">
              <span className="text-[13px] font-semibold">{option.label}</span>
              <span className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-200 ease-out group-data-returning/row:grid-rows-[0fr] group-data-returning/row:opacity-0 group-data-returning/row:duration-150 starting:grid-rows-[0fr] starting:opacity-0">
                <span className="min-h-0 overflow-hidden text-[12px] opacity-70 group-data-checked/row:opacity-55">
                  {option.label === current ? "On" : option.description}
                </span>
              </span>
            </span>
          </span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

function GlassFocus({ className, container, onValueChange, options, value }: GlassFocusProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [away, setAway] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.label === value) ?? options[0]!;

  function close() {
    morph(trigger.current, list.current, true);
    setOpen(false);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setAway(true);
          setOpen(true);
        } else close();
      }}
      onOpenChangeComplete={(next) => {
        if (!next) setAway(false);
      }}
    >
      <Dialog.Trigger
        ref={trigger}
        render={
          <Glass
            magnetic={{ grow: 1.06 }}
            render={<button type="button" aria-label={`Focus: ${current.label}`} />}
            className={cn(
              "flex h-14 w-48 cursor-pointer items-center gap-2.5 rounded-full ps-3 pe-4 font-[family-name:system-ui] text-(--glass-ink) subpixel-antialiased focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              away && "invisible",
              className,
            )}
          />
        }
      >
        <span
          style={{ "--tone": current.color } as CSSProperties}
          data-dot
          className="grid size-8 shrink-0 place-items-center rounded-full bg-(--tone) text-white [&_svg]:size-1/2"
        >
          {current.icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-start text-[13px] leading-4 font-semibold">
          {current.label}
        </span>
        <ChevronUpDownBoldIcon className="size-2.5 shrink-0 opacity-60" />
      </Dialog.Trigger>
      <Dialog.Portal container={container}>
        <Dialog.Backdrop className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[12px] transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="absolute inset-0 z-30 outline-none transition-[scale] duration-[270ms] ease-out data-ending-style:scale-[0.999] data-starting-style:scale-[0.999]">
          <Dialog.Title className="sr-only">Focus</Dialog.Title>
          <Dialog.Close
            tabIndex={-1}
            aria-label="Close"
            className="absolute inset-0 cursor-default outline-none"
          />
          <FocusRows
            list={list}
            current={current.label}
            options={options}
            onOpened={() => {
              place(trigger.current, list.current);
              morph(trigger.current, list.current, false);
            }}
            onValueChange={onValueChange}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { GlassFocus };
export type { GlassFocusOption, GlassFocusProps };
