import { useCallback, useState, type ComponentProps, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { IPhone } from "@/work/iphone";
import { Gradient, type GradientStop } from "./gradient";
import { MessagingApp, type ChatContact, type ChatMessage } from "./messaging-app";
import { Stepper } from "./stepper";
import { useStepPlayback } from "./use-step-playback";

export type ChatShowcaseStep = { label: string; messages: readonly ChatMessage[] };

export type ChatShowcaseProps = Omit<ComponentProps<"div">, "children"> & {
  steps: readonly ChatShowcaseStep[];
  contact: ChatContact;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  paused?: boolean;
  appear?: boolean;
  messageDelay?: number;
  hold?: number;
  gradient?: readonly GradientStop[];
};

// tan(atan2(a, b)) is the unitless ratio a / b. 288px is the phone's width and the height of it that must show.
const FIT =
  "max(0.1, min(tan(atan2(100cqw - 48px, 288px)), tan(atan2(100cqh - 56px, 288px)), 1.5))";

const SLIDE = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { delay: 0.1, duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0.7, scale: 0.85, y: 50 },
  transition: { duration: 0.5 },
} satisfies MotionProps;

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
} satisfies MotionProps;

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [local, setLocal] = useState(initial);
  const controlled = value !== undefined;
  const current = controlled ? value : local;
  const set = useCallback(
    (next: T) => {
      if (next === current) return;
      if (!controlled) setLocal(next);
      onChange?.(next);
    },
    [controlled, current, onChange],
  );
  return [current, set] as const;
}

export function ChatShowcase({
  steps,
  contact,
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  paused = false,
  appear = true,
  messageDelay = 1000,
  hold = 1500,
  gradient,
  className,
  style,
  ...props
}: ChatShowcaseProps) {
  const reduced = useReducedMotion();
  const [step, setStep] = useControllable(stepProp, defaultStep, onStepChange);
  const current = steps[step];
  const count = current?.messages.length ?? 0;
  const { shown } = useStepPlayback({
    step,
    count,
    messageDelay,
    hold,
    paused,
    onComplete: () => {
      if (steps.length > 1) setStep((step + 1) % steps.length);
    },
  });

  return (
    <div
      data-slot="chat-showcase"
      style={{ ...style, "--fit": FIT } as CSSProperties}
      className={cn(
        "@container-size relative h-full w-full overflow-hidden bg-white text-emerald-800",
        className,
      )}
      {...props}
    >
      <Gradient stops={gradient} paused={paused} appear={appear} />
      <Stepper
        labels={steps.map(({ label }) => label)}
        step={step}
        duration={count * messageDelay + hold}
        paused={paused}
        onStepChange={setStep}
        className="absolute inset-x-6 top-4 z-10"
      />
      <div className="absolute inset-x-0 top-14 flex justify-center">
        <div className="relative h-72 w-72 shrink-0 origin-top scale-(--fit)">
          <AnimatePresence initial={false}>
            {current && (
              <motion.div
                key={step}
                className="absolute inset-x-0 top-0"
                {...(reduced ? FADE : SLIDE)}
              >
                <IPhone className="w-full">
                  <div
                    aria-hidden="true"
                    className="absolute top-2 left-1/2 z-20 h-6 w-20 -translate-x-1/2 rounded-full bg-black"
                  />
                  <MessagingApp
                    contact={contact}
                    messages={current.messages.slice(0, shown)}
                    className="h-68"
                  />
                </IPhone>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
