"use client";

import * as React from "react";
import { KeyIcon, ShieldCheckIcon, Trash2Icon, XIcon } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/lib/utils";

type DrawerView = "default" | "remove" | "phrase" | "key";

function useMeasuredHeight<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const updateHeight = () => setHeight(Math.ceil(element.scrollHeight));
    const observer = new ResizeObserver(updateHeight);

    updateHeight();
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, height] as const;
}

function FamilyDrawer() {
  return (
    <MotionConfig reducedMotion="user">
      <FamilyDrawerRoot />
    </MotionConfig>
  );
}

function FamilyDrawerRoot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [view, setView] = React.useState<DrawerView>("default");

  return (
    <div className="flex min-h-[520px] w-[min(640px,100%)] items-center justify-center py-10">
      <FamilyDrawerSurface
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        setView={setView}
        view={view}
      />
    </div>
  );
}

function FamilyDrawerSurface({
  isOpen,
  onClose,
  onOpen,
  setView,
  view,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  setView: (view: DrawerView) => void;
  view: DrawerView;
}) {
  const [elementRef, boundsHeight] = useMeasuredHeight<HTMLDivElement>();
  const previousHeightRef = React.useRef<number | undefined>(undefined);
  const reduceMotion = useReducedMotion();
  const setSizerView = React.useCallback(() => {}, []);
  const opacityDuration = React.useMemo(() => {
    const currentHeight = boundsHeight;
    const previousHeight = previousHeightRef.current;
    const minDuration = 0.15;
    const maxDuration = 0.27;

    if (!currentHeight || !previousHeight) {
      previousHeightRef.current = currentHeight;
      return minDuration;
    }

    const heightDifference = Math.abs(currentHeight - previousHeight);

    previousHeightRef.current = currentHeight;

    return Math.min(Math.max(heightDifference / 500, minDuration), maxDuration);
  }, [boundsHeight]);

  const contentTransition = {
    duration: reduceMotion ? 0.01 : 0.18,
    ease: [0.165, 0.84, 0.44, 1] as const,
  };
  const surfaceHeight = isOpen ? (boundsHeight ? boundsHeight + 2 : 44) : 44;

  return (
    <div
      className={cn(
        "relative max-w-full overflow-hidden border text-[#222] shadow-[0_14px_34px_rgb(24_24_27_/_10%),0_0_0_1px_rgb(24_24_27_/_5%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4dafff]/60 dark:text-[#f3f3f1] dark:shadow-[0_10px_26px_rgb(0_0_0_/_18%),0_0_0_1px_rgb(255_255_255_/_6%)]",
        isOpen
          ? "border-[#e8e8e5] bg-[#fbfbfa] dark:border-white/10 dark:bg-[#151516]"
          : "border-[#e5e5e3] bg-[#fbfbfa] dark:border-white/10 dark:bg-[#171718]",
      )}
      style={{
        borderRadius: 36,
        height: surfaceHeight,
        transitionDuration: reduceMotion ? "10ms" : "270ms",
        transitionProperty:
          "width, height, border-radius, background-color, border-color",
        transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
        willChange: "width, height, border-radius",
        width: isOpen ? 338 : 190,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-x-0 top-0 w-[338px] px-5 pt-2 pb-5"
        ref={elementRef}
      >
        <FamilyDrawerContent setView={setSizerView} view={view} />
      </div>

      <AnimatePresence initial={false}>
        {!isOpen ? (
          <motion.button
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="absolute inset-0 flex h-11 w-full items-center justify-center px-5 text-[14px] font-semibold text-[#222] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4dafff]/60 active:scale-95 dark:text-[#f3f3f1]"
            exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            key="closed"
            onClick={onOpen}
            transition={contentTransition}
            type="button"
            whileTap={{ scale: 0.94 }}
          >
            Wallet options
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              transition: {
                ...contentTransition,
                delay: reduceMotion ? 0 : 0.06,
              },
            }}
            className="absolute inset-x-0 top-0 w-[338px]"
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            key="open"
            transition={contentTransition}
          >
            <div>
              <button
                aria-label="Close drawer"
                className="absolute top-5 right-6 z-10 flex size-7 items-center justify-center rounded-full bg-[#f0f1f2] text-[#858686] transition-transform hover:bg-[#e9eaeb] focus:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4dafff]/60 active:scale-75 dark:bg-white/10 dark:text-[#c7c7c3] dark:hover:bg-white/[0.14]"
                data-vaul-no-drag=""
                onClick={onClose}
                type="button"
              >
                <XIcon className="size-3.5" />
              </button>

              <div className="px-5 pt-2 pb-5">
                <AnimatePresence custom={view} initial={false} mode="popLayout">
                  <motion.div
                    animate={{ filter: "blur(0px)", opacity: 1 }}
                    exit={{ filter: "blur(3px)", opacity: 0 }}
                    initial={{ filter: "blur(3px)", opacity: 0 }}
                    key={view}
                    transition={{
                      duration: reduceMotion ? 0.01 : opacityDuration,
                      ease: [0.25, 1, 0.5, 1],
                    }}
                  >
                    <FamilyDrawerContent setView={setView} view={view} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FamilyDrawerContent({
  setView,
  view,
}: {
  setView: (view: DrawerView) => void;
  view: DrawerView;
}) {
  if (view === "remove") {
    return (
      <div>
        <div className="px-1.5">
          <FamilyDrawerHeader
            description="You haven't backed up your wallet yet. If you remove it, you could lose access forever. We suggest tapping and backing up your wallet first with a valid recovery method."
            icon={
              <div className="flex size-10 items-center justify-center rounded-full bg-[#fff0f0] text-[#ff3f40] dark:bg-[#ff3f40]/15">
                <Trash2Icon className="size-[18px]" />
              </div>
            }
            title="Are you sure?"
          />
          <div className="mt-6 flex gap-3">
            <FamilyDrawerButton onClick={() => setView("default")}>
              Cancel
            </FamilyDrawerButton>
            <FamilyDrawerButton
              onClick={() => setView("default")}
              tone="destructive"
            >
              Continue
            </FamilyDrawerButton>
          </div>
        </div>
      </div>
    );
  }

  if (view === "phrase") {
    return (
      <div>
        <div className="px-1.5">
          <FamilyDrawerHeader
            description="Your Secret Recovery Phrase is the key used to back up your wallet. Keep it secret at all times."
            icon={
              <div className="flex size-10 items-center justify-center rounded-full bg-[#eef6ff] text-[#278ed3] dark:bg-[#4dafff]/15 dark:text-[#63bcff]">
                <ShieldCheckIcon className="size-[18px]" />
              </div>
            }
            title="Secret Recovery Phrase"
          />
          <FamilyDrawerWarningList
            items={[
              "Keep your Secret Phrase safe",
              "Don't share it with anyone else",
              "If you lose it, we can't recover it",
            ]}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <FamilyDrawerButton onClick={() => setView("default")}>
            Cancel
          </FamilyDrawerButton>
          <FamilyDrawerButton onClick={() => setView("default")} tone="blue">
            <ShieldCheckIcon className="size-4" />
            Reveal
          </FamilyDrawerButton>
        </div>
      </div>
    );
  }

  if (view === "key") {
    return (
      <div>
        <div className="px-1.5">
          <FamilyDrawerHeader
            description="Your Private Key is the key used to back up your wallet. Keep it secret and secure at all times."
            icon={
              <div className="flex size-10 items-center justify-center rounded-full bg-[#f5f3ff] text-[#7c3aed] dark:bg-[#8b5cf6]/15 dark:text-[#a78bfa]">
                <KeyIcon className="size-[18px]" />
              </div>
            }
            title="Private Key"
          />
          <FamilyDrawerWarningList
            items={[
              "Keep your private key safe",
              "Don't share it with anyone else",
              "If you lose it, we can't recover it",
            ]}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <FamilyDrawerButton onClick={() => setView("default")}>
            Cancel
          </FamilyDrawerButton>
          <FamilyDrawerButton onClick={() => setView("default")} tone="blue">
            <ShieldCheckIcon className="size-4" />
            Reveal
          </FamilyDrawerButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-3 flex h-[62px] items-center border-b border-[#eeeeec] pl-1.5 dark:border-white/10">
        <h4 className="text-[17px] font-semibold text-[#222] dark:text-[#f3f3f1]">
          Options
        </h4>
      </header>
      <div className="space-y-2.5">
        <FamilyDrawerAction
          icon={
            <div className="flex size-5 items-center justify-center">
              <KeyIcon className="size-4" />
            </div>
          }
          onClick={() => setView("key")}
        >
          View Private Key
        </FamilyDrawerAction>
        <FamilyDrawerAction
          icon={
            <div className="flex size-5 items-center justify-center">
              <ShieldCheckIcon className="size-4" />
            </div>
          }
          onClick={() => setView("phrase")}
        >
          View Recovery Phase
        </FamilyDrawerAction>
        <FamilyDrawerAction
          icon={
            <div className="flex size-5 items-center justify-center">
              <Trash2Icon className="size-4" />
            </div>
          }
          onClick={() => setView("remove")}
          tone="destructive"
        >
          Remove Wallet
        </FamilyDrawerAction>
      </div>
    </>
  );
}

function FamilyDrawerHeader({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <header className="mt-[18px]">
      {icon}
      <h4 className="mt-2 text-[20px] font-semibold text-[#222] dark:text-[#f3f3f1]">
        {title}
      </h4>
      <p className="mt-2.5 text-[15px] leading-[21px] font-medium text-[#8d8d89] dark:text-[#a5a5a1]">
        {description}
      </p>
    </header>
  );
}

function FamilyDrawerWarningList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3 border-t border-[#eeeeec] pt-5 dark:border-white/10">
      {items.map((item) => (
        <li
          className="flex items-center gap-2.5 text-[14px] font-semibold text-[#8d8d89] dark:text-[#a5a5a1]"
          key={item}
        >
          <span className="flex size-[18px] items-center justify-center rounded-full border border-[#ddddda] text-[#8d8d89] dark:border-white/15 dark:text-[#a5a5a1]">
            <ShieldCheckIcon className="size-3" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function FamilyDrawerAction({
  children,
  icon,
  onClick,
  tone = "default",
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  tone?: "default" | "destructive";
}) {
  return (
    <button
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-[14px] bg-[#f0f1f2] px-3.5 text-left text-[15px] font-semibold text-[#222] transition-transform hover:bg-[#e9eaeb] focus:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4dafff]/60 active:scale-95 dark:bg-white/[0.08] dark:text-[#f3f3f1] dark:hover:bg-white/[0.12]",
        tone === "destructive" &&
          "bg-[#fff0f0] text-[#ff3f40] hover:bg-[#ffe5e5] dark:bg-[#ff3f40]/12 dark:text-[#ff6b6c] dark:hover:bg-[#ff3f40]/18",
      )}
      data-vaul-no-drag=""
      onClick={onClick}
      type="button"
    >
      <span className="flex size-5 items-center justify-center">{icon}</span>
      <span>{children}</span>
    </button>
  );
}

function FamilyDrawerButton({
  children,
  className,
  onClick,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  tone?: "default" | "destructive" | "blue";
}) {
  return (
    <button
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#eceeef] px-3.5 text-center text-[16px] font-semibold text-[#222] transition-transform hover:bg-[#e5e7e8] focus:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4dafff]/60 active:scale-95 dark:bg-white/[0.1] dark:text-[#f3f3f1] dark:hover:bg-white/[0.14]",
        tone === "destructive" && "bg-[#ff3f40] text-white",
        tone === "blue" &&
          "bg-[#278ed3] text-white hover:bg-[#1f7fc1] dark:bg-[#4dafff] dark:text-[#062032] dark:hover:bg-[#69bdff]",
        className,
      )}
      data-vaul-no-drag=""
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export { FamilyDrawer };
