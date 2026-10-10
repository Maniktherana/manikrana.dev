import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AiChatPanelClose } from "./ai-chat";
import { Bar, Blob } from "./skeleton";

const LIST_VARIANTS = {
  hidden: {},
  visible: { transition: { delayChildren: 0.04, staggerChildren: 0.045 } },
} as const;
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0, 0, 0.2, 1] } },
} as const;

const SOURCES = 5;
const STEPS = [
  { bar: "w-48", chips: 0 },
  { bar: "w-40", chips: 3 },
  { bar: "w-44", chips: 0 },
  { bar: "w-36", chips: 0 },
  { bar: "w-12", chips: 0 },
];

function PanelHeader({ panel }: { panel: string }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between pr-2 pl-4">
      <Bar className={panel === "sources" ? "w-16" : "w-20"} />
      <AiChatPanelClose aria-label={`Close ${panel}`}>
        <Blob className="size-4" />
      </AiChatPanelClose>
    </header>
  );
}

function PanelBody({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 overflow-hidden">{children}</div>;
}

function SourcesList() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col gap-1 px-4 py-3"
      variants={LIST_VARIANTS}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
    >
      {Array.from({ length: SOURCES }, (_, index) => (
        <motion.div key={index} variants={ITEM_VARIANTS} className="rounded-lg p-2">
          <span className="flex items-center gap-2">
            <Blob className="size-5" />
            <Bar className="h-2 w-24" />
          </span>
          <span className="mt-2 flex flex-col gap-2">
            <Bar className="w-full" />
            <Bar className="w-2/3" />
          </span>
          <Bar className="mt-2 h-2 w-5/6" />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ThinkingTrace() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ol
      className="px-4 py-3"
      variants={LIST_VARIANTS}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
    >
      {STEPS.map((step, index) => {
        const last = index === STEPS.length - 1;

        return (
          <motion.li key={index} variants={ITEM_VARIANTS} className="flex gap-2">
            <div className="flex w-4 shrink-0 flex-col items-center self-stretch">
              <span className="grid h-5 w-4 shrink-0 place-items-center">
                <Blob className="size-2" />
              </span>
              {last ? null : (
                <span className="flex w-4 flex-1 justify-center">
                  <span className="h-full w-px border-l border-dashed border-control-selected" />
                </span>
              )}
            </div>
            <div className={last ? "min-w-0 flex-1" : "min-w-0 flex-1 pb-4"}>
              <div className="flex h-5 items-center">
                <Bar className={step.bar} />
              </div>
              {step.chips ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from({ length: step.chips }, (_, chip) => (
                    <span key={chip} className="block h-5 w-20 rounded-full bg-control" />
                  ))}
                </div>
              ) : null}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

export const PANELS: Record<string, ReactNode> = {
  sources: (
    <>
      <PanelHeader panel="sources" />
      <PanelBody>
        <SourcesList />
      </PanelBody>
    </>
  ),
  thinking: (
    <>
      <PanelHeader panel="thinking" />
      <PanelBody>
        <ThinkingTrace />
      </PanelBody>
    </>
  ),
};
