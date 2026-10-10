import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

const glide = { type: "spring", duration: 0.3, bounce: 0 } as const;

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: ReactNode }[];
  className?: string;
}) {
  const indicator = useId();
  return (
    <fieldset
      className={cn(
        "flex h-9 w-fit min-w-0 items-center gap-0.5 rounded-xl bg-control p-1",
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const pressed = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(option.value)}
            className="relative flex h-7 items-center rounded-lg px-2.5 text-sm leading-none whitespace-nowrap text-control-foreground outline-none transition-[color] duration-150 ease-out hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:text-foreground"
          >
            {pressed && (
              <motion.span
                layoutId={indicator}
                transition={glide}
                className="absolute inset-0 rounded-lg bg-popover shadow-raised"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
