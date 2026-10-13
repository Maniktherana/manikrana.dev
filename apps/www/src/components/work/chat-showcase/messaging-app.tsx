import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@manikrana/ui/lib/utils";
import { CameraIcon } from "@/components/icons/camera";
import { ChevronLeftIcon } from "@/components/icons/chevron-left";

export type ChatMessage = { from: "me" | "them"; text: string };

export type ChatContact = { name: string; avatar?: string };

export type MessagingAppProps = ComponentProps<"div"> & {
  contact: ChatContact;
  messages: readonly ChatMessage[];
};

const GLIDE = { type: "spring", duration: 0.4, bounce: 0 } as const;

export function MessagingApp({ contact, messages, className, ...props }: MessagingAppProps) {
  const reduced = useReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const y = useMotionValue(0);

  useLayoutEffect(() => {
    if (!viewport.current || !list.current) return;
    const offset = Math.max(0, list.current.offsetHeight - viewport.current.offsetHeight);
    if (reduced) {
      y.set(-offset);
      return;
    }
    const glide = animate(y, -offset, GLIDE);
    return () => glide.stop();
  }, [messages.length, reduced, y]);

  return (
    <div
      data-slot="messaging-app"
      className={cn("relative h-full bg-neutral-950 text-neutral-100", className)}
      {...props}
    >
      <header className="absolute inset-x-0 top-0 z-10 flex h-19 items-center gap-2 border-b border-white/5 bg-neutral-900/80 px-3 pt-7 backdrop-blur-md">
        <ChevronLeftIcon className="size-5 text-emerald-400" />
        {contact.avatar ? (
          <img src={contact.avatar} alt="" className="size-6 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-full bg-linear-to-b from-neutral-500 to-neutral-700 text-xs font-medium text-white"
          >
            {contact.name.charAt(0)}
          </span>
        )}
        <p className="text-xs font-medium">{contact.name}</p>
        <CameraIcon className="ms-auto size-5 text-emerald-400" />
      </header>
      <div ref={viewport} className="h-full overflow-hidden">
        <motion.ul
          ref={list}
          style={{ y }}
          aria-label={`Conversation with ${contact.name}`}
          className="flex flex-col gap-2 px-3 pt-22 pb-4"
        >
          {/* Own presence scope: the phone's AnimatePresence skips initial animations, so bubbles would never rise. */}
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.li
                key={index}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={GLIDE}
                className={cn(
                  "max-w-4/5 rounded-2xl px-3 py-2 text-xs",
                  message.from === "me"
                    ? "self-end rounded-br-sm bg-emerald-700 text-white"
                    : "self-start rounded-bl-sm bg-neutral-800 text-neutral-100",
                )}
              >
                {message.text}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </div>
  );
}
