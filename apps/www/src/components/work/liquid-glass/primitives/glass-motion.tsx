import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@manikrana/ui/lib/utils";

type CrossfadeProps = {
  children: ReactNode;
  className?: string;
  shrink?: boolean;
  value: string;
};

function Crossfade({ children, className, shrink = false, value }: CrossfadeProps) {
  const [shown, setShown] = useState({ value, node: children, fresh: false });
  const [gone, setGone] = useState<{ value: string; node: ReactNode }[]>([]);

  if (shown.value !== value) {
    setGone((list) => [...list.filter((item) => item.value !== value), shown]);
    setShown({ value, node: children, fresh: true });
  }

  return [
    ...gone.map((item) => ({ ...item, fresh: false, leaving: true })),
    { value, node: children, fresh: shown.fresh, leaving: false },
  ].map((item) => (
    <span
      key={item.value}
      data-leaving={item.leaving || undefined}
      onTransitionEnd={(event) => {
        if (!item.leaving || event.propertyName !== "opacity") return;
        setGone((list) => list.filter((entry) => entry.value !== item.value));
      }}
      className={cn(
        "col-start-1 row-start-1 grid place-items-center transition-[opacity,filter,scale] duration-200 ease-[ease-out,ease-out,ease-in-out] data-leaving:opacity-0 data-leaving:blur-[5px]",
        shrink && "data-leaving:scale-80",
        item.fresh && "starting:opacity-0 starting:blur-[5px]",
        item.fresh && shrink && "starting:scale-80",
        className,
      )}
    >
      {item.node}
    </span>
  ));
}

type SwapProps = {
  className?: string;
  items: Record<string, ReactNode>;
  shrink?: boolean;
  value: string;
};

function Swap({ className, items, shrink = false, value }: SwapProps) {
  return (
    <span className="grid">
      {Object.entries(items).map(([key, node]) => (
        <span
          key={key}
          aria-hidden={key !== value || undefined}
          data-active={key === value || undefined}
          className={cn(
            "col-start-1 row-start-1 grid place-items-center transition-[opacity,filter,scale] duration-200 ease-[ease-out,ease-out,ease-in-out] not-data-active:opacity-0 not-data-active:blur-[5px]",
            shrink && "not-data-active:scale-80",
            className,
          )}
        >
          {node}
        </span>
      ))}
    </span>
  );
}

const MARQUEE_GAP = 32;
const MARQUEE_SPEED = 30;

function Marquee({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLSpanElement>(null);
  const strip = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const box = frame.current;
    const text = strip.current?.firstElementChild as HTMLElement | null;
    if (!box || !text) return;
    const measure = () => setOverflow(Math.max(0, text.offsetWidth - box.offsetWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(text);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = strip.current;
    const text = node?.firstElementChild as HTMLElement | null;
    if (!node || !text || !overflow) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let run: Animation | null = null;
    const loop = () => {
      timer = window.setTimeout(
        () => {
          const distance = text.offsetWidth + MARQUEE_GAP;
          setMoving(true);
          run = node.animate([{ translate: "0px 0px" }, { translate: `${-distance}px 0px` }], {
            duration: (distance / MARQUEE_SPEED) * 1000,
            easing: "linear",
          });
          run.onfinish = () => {
            setMoving(false);
            loop();
          };
        },
        3000 + Math.random() * 3000,
      );
    };
    loop();
    return () => {
      window.clearTimeout(timer);
      run?.cancel();
      setMoving(false);
    };
  }, [overflow]);

  return (
    <span
      ref={frame}
      data-overflow={overflow > 0 || undefined}
      data-moving={moving || undefined}
      className="block min-w-0 overflow-hidden data-overflow:[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] data-moving:[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)]"
    >
      <span ref={strip} className="flex w-max gap-8">
        <span className="whitespace-nowrap">{children}</span>
        {overflow > 0 && (
          <span aria-hidden="true" className="whitespace-nowrap">
            {children}
          </span>
        )}
      </span>
    </span>
  );
}

export { Crossfade, Marquee, Swap };
export type { CrossfadeProps, SwapProps };
