import { useState, type ReactNode } from "react";
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

export { Crossfade, Swap };
export type { CrossfadeProps, SwapProps };
