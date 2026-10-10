import { useEffect, useRef, type ComponentProps } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";

export type StepperProps = Omit<ComponentProps<"div">, "children"> & {
  labels: readonly string[];
  step: number;
  duration: number;
  paused: boolean;
  onStepChange: (step: number) => void;
};

type StepperFillProps = {
  duration: number;
  paused: boolean;
};

const FILL = [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }];

// Every state sets `transform`, since `scale-x-*` would compose with the animated one.
const FILL_CLASS = "block size-full origin-left rounded-full bg-current";

function Fill({ duration, paused }: StepperFillProps) {
  const reduced = useReducedMotion();
  const element = useRef<HTMLSpanElement>(null);
  const animation = useRef<Animation>(null);

  useEffect(() => {
    if (reduced) return;
    const running = element.current?.animate(FILL, {
      duration,
      easing: "linear",
      fill: "forwards",
    });
    if (!running) return;
    animation.current = running;
    return () => {
      running.cancel();
      animation.current = null;
    };
  }, [duration, reduced]);

  // Reruns when the animation is recreated. A finished one is left alone, since play() rewinds it.
  useEffect(() => {
    const running = animation.current;
    if (!running || running.playState === "finished") return;
    if (paused) running.pause();
    else running.play();
  }, [paused, duration, reduced]);

  return (
    <span
      ref={element}
      className={cn(FILL_CLASS, "transform-[scaleX(0)] motion-reduce:transform-none")}
    />
  );
}

export function Stepper({
  labels,
  step,
  duration,
  paused,
  onStepChange,
  className,
  ...props
}: StepperProps) {
  return (
    <div
      data-slot="stepper"
      className={cn("flex h-5 items-center justify-center gap-2", className)}
      {...props}
    >
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          aria-current={index === step ? "step" : undefined}
          onClick={() => onStepChange(index)}
          className="group relative flex h-5 max-w-12 min-w-4 flex-1 items-center rounded-full outline-none transition-[scale] duration-150 ease-out before:absolute before:inset-x-0 before:-inset-y-3 focus-visible:ring-2 focus-visible:ring-current active:scale-[0.96] motion-reduce:transition-none"
        >
          <span className="h-1 w-full overflow-hidden rounded-full bg-current/20 transition-[height] duration-150 ease-out group-hover:h-2 group-aria-[current=step]:h-2 motion-reduce:transition-none">
            {index === step ? (
              <Fill duration={duration} paused={paused} />
            ) : (
              <span
                className={cn(
                  FILL_CLASS,
                  index < step ? "transform-none" : "transform-[scaleX(0)]",
                )}
              />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
