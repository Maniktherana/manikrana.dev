import { useEffect, useRef, useState, type ComponentProps, type FocusEvent } from "react";
import { cn } from "@manikrana/ui/lib/utils";
import { Glass } from "./glass";

type GlassFieldProps = ComponentProps<"label">;

const TEXT = "input, textarea";

function GlassField({ children, className, onBlur, onFocus, ...props }: GlassFieldProps) {
  const [keyed, setKeyed] = useState(false);
  const pointed = useRef(false);

  useEffect(() => {
    const point = () => (pointed.current = true);
    const key = () => (pointed.current = false);
    window.addEventListener("pointerdown", point, true);
    window.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("pointerdown", point, true);
      window.removeEventListener("keydown", key, true);
    };
  }, []);

  return (
    <Glass
      // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- the control is a child
      render={<label />}
      {...(props as ComponentProps<"div">)}
      data-keyed={keyed || undefined}
      onFocus={(event: FocusEvent<HTMLElement>) => {
        if ((event.target as Element).matches(TEXT)) setKeyed(!pointed.current);
        onFocus?.(event as FocusEvent<HTMLLabelElement>);
      }}
      onBlur={(event: FocusEvent<HTMLElement>) => {
        if ((event.target as Element).matches(TEXT)) setKeyed(false);
        onBlur?.(event as FocusEvent<HTMLLabelElement>);
      }}
      className={cn(
        "flex min-h-11 min-w-0 cursor-text items-end rounded-[22px] py-1.5 ps-3.5 pe-1.5 text-(--glass-ink) data-keyed:outline-2 data-keyed:outline-offset-2 data-keyed:outline-ring",
        className,
      )}
    >
      {children}
    </Glass>
  );
}

function GlassFieldTextarea({ className, rows = 1, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      {...props}
      className={cn(
        "max-h-24 min-w-0 flex-1 resize-none bg-transparent py-1 text-[13px] leading-6 [field-sizing:content] outline-none placeholder:text-(--glass-ink)/60",
        className,
      )}
    />
  );
}

function GlassFieldInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "h-8 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-(--glass-ink)/60",
        className,
      )}
    />
  );
}

GlassField.Textarea = GlassFieldTextarea;
GlassField.Input = GlassFieldInput;

export { GlassField };
export type { GlassFieldProps };
