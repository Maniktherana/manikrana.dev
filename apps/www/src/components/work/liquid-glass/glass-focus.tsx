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
import { ChevronUpDownBoldIcon } from "@/components/icons/chevron-up-down-bold";
import { cssTime } from "./primitives/css-time";
import { Glass, GlassRim } from "./primitives/glass";

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

function spring(name: string) {
  return {
    duration: cssTime(document.documentElement, `--spring-${name}-time`),
    easing: getComputedStyle(document.documentElement).getPropertyValue(`--spring-${name}`),
  };
}

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

function morph(trigger: HTMLElement | null, list: HTMLElement | null, back: boolean) {
  const row = list?.querySelector<HTMLElement>("[data-checked]");
  const shape = row?.querySelector<HTMLElement>("[data-shape]");
  const fill = row?.querySelector<HTMLElement>("[data-fill]");
  const content = row?.querySelector<HTMLElement>("[data-content]");
  const dot = row?.querySelector<HTMLElement>("[data-dot]");
  const triggerDot = trigger?.querySelector<HTMLElement>("[data-dot]");
  if (!trigger || !list || !row || !shape || !fill || !content || !dot || !triggerDot || calm()) {
    return;
  }
  for (const node of list.querySelectorAll<HTMLElement>("[data-row], [data-row] *")) {
    for (const animation of node.getAnimations()) animation.cancel();
  }
  const from = trigger.getBoundingClientRect();
  const to = row.getBoundingClientRect();
  const zoom = row.offsetWidth / to.width || 1;
  const dx = (from.left - to.left) * zoom;
  const dy = (from.top - to.top) * zoom;
  const lift = (from.height * zoom - row.offsetHeight) / 2;
  const timing = {
    ...spring(back ? "focus-close" : "focus-open"),
    delay: back ? LEAD : 0,
    fill: back ? ("both" as const) : ("none" as const),
  };
  const ends = [
    {
      translate: `${dx}px ${dy}px`,
      width: `${from.width * zoom}px`,
      height: `${from.height * zoom}px`,
    },
    { translate: "0px 0px", width: `${row.offsetWidth}px`, height: `${row.offsetHeight}px` },
  ];
  const small = `${triggerDot.offsetWidth}px`;
  const large = `${dot.offsetWidth}px`;
  const shift = (triggerDot.getBoundingClientRect().left - dot.getBoundingClientRect().left) * zoom;
  const travel = [
    { translate: `${shift}px ${dy + lift}px`, gap: getComputedStyle(trigger).columnGap },
    { translate: "0px 0px", gap: getComputedStyle(content).columnGap },
  ];
  const grow = [
    { width: small, height: small },
    { width: large, height: large },
  ];
  const whiten = [{ opacity: 0 }, { opacity: 1 }];
  if (back) row.dataset.returning = "";
  shape.animate(back ? [...ends].reverse() : ends, timing);
  content.animate(back ? [...travel].reverse() : travel, timing);
  dot.animate(back ? [...grow].reverse() : grow, timing);
  fill.animate(back ? [...whiten].reverse() : whiten, { ...timing, easing: "ease-out" });

  const center = to.top + to.height / 2;
  for (const other of list.querySelectorAll<HTMLElement>("[data-row]:not([data-checked])")) {
    const box = other.getBoundingClientRect();
    const behind = {
      translate: `0px ${(center - (box.top + box.height / 2)) * zoom}px`,
      scale: "0.92",
    };
    const spread = { translate: "0px 0px", scale: "1" };
    if (back) {
      other.animate([spread, behind], {
        ...spring("focus-close"),
        duration: TUCK,
        fill: "forwards",
      });
      other.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: TUCK,
        easing: "ease-out",
        fill: "forwards",
      });
    } else {
      other.animate([behind, spread], {
        ...spring("focus-open"),
        delay: EMERGE,
        fill: "backwards",
      });
      other.animate(
        [
          { opacity: 0, filter: "blur(4px)" },
          { opacity: 1, filter: "blur(0px)" },
        ],
        { duration: 220, delay: EMERGE, easing: "ease-out", fill: "backwards" },
      );
    }
  }
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
            <span
              data-fill
              className="absolute inset-0 rounded-full bg-white opacity-0 transition-opacity duration-250 ease-out group-data-checked/row:opacity-100"
            />
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
