import { useCallback, useEffect, useLayoutEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { InputGroup, InputGroupButton } from "@manikrana/ui/components/ui/input-group";
import { cn } from "@manikrana/ui/lib/utils";
import { ArrowUpIcon, LoaderIcon, PlusLargeIcon, StopIcon, UploadIcon } from "@/components/icons";
import { PendingAttachmentStrip, type MessageComposerAttachment } from "./attachments";

export type { MessageComposerAttachment } from "./attachments";

const MIN_TEXTAREA_HEIGHT = 40;
const MAX_TEXTAREA_HEIGHT = 200;
// Must match the grid's two 2.5rem button columns and gap-x-1.
const NARROW_COLUMN_RESERVED = 40 * 2 + 4 * 2;
const EASE = [0.16, 1, 0.3, 1] as const;
const RADIUS = 24;

const MotionInputGroup = motion.create(InputGroup);

export type MessageComposerSubmit = {
  text: string;
  attachments: MessageComposerAttachment[];
};

export type MessageComposerProps = {
  attachments?: MessageComposerAttachment[];
  className?: string;
  defaultValue?: string;
  onAddAttachment?: () => void;
  onChange?: (value: string) => void;
  onDropFiles?: (files: File[]) => void;
  onInterrupt?: () => void;
  onRemoveAttachment?: (id: string) => void;
  onSubmit?: (draft: MessageComposerSubmit) => void;
  placeholder?: string;
  sending?: boolean;
  value?: string;
  working?: boolean;
};

export function MessageComposer({
  attachments = [],
  className,
  defaultValue = "",
  onAddAttachment,
  onChange,
  onDropFiles,
  onInterrupt,
  onRemoveAttachment,
  onSubmit,
  placeholder = "Message…",
  sending = false,
  value,
  working = false,
}: MessageComposerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [textareaHeight, setTextareaHeight] = useState(MIN_TEXTAREA_HEIGHT);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);
  const [stackEntryAnimating, setStackEntryAnimating] = useState(false);
  const dragDepthRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gridRef = useRef<HTMLFormElement>(null);
  const measureRef = useRef<HTMLTextAreaElement>(null);
  const textareaHeightRef = useRef(MIN_TEXTAREA_HEIGHT);
  const wasTextareaStackedRef = useRef(false);
  const overflowTimeoutRef = useRef<number | null>(null);
  const heightAnimationFrameRef = useRef<number | null>(null);
  const stackEntryTimeoutRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion() === true;
  const draft = value ?? internalValue;
  const uploadInProgress = attachments.some((attachment) => attachment.status === "uploading");
  const canSend =
    !sending && !uploadInProgress && (draft.trim().length > 0 || attachments.length > 0);
  const isTextareaStacked = draft.includes("\n") || isTextOverflowing;
  const isEnteringTextareaStack = isTextareaStacked && !wasTextareaStackedRef.current;
  const animateLayout = !isTextareaStacked || isEnteringTextareaStack || stackEntryAnimating;
  const layoutTransition = (duration: number) =>
    animateLayout ? { duration, ease: EASE } : { duration: 0 };

  const clearPendingTimers = useCallback(() => {
    if (overflowTimeoutRef.current !== null) {
      window.clearTimeout(overflowTimeoutRef.current);
      overflowTimeoutRef.current = null;
    }
    if (heightAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(heightAnimationFrameRef.current);
      heightAnimationFrameRef.current = null;
    }
    if (stackEntryTimeoutRef.current !== null) {
      window.clearTimeout(stackEntryTimeoutRef.current);
      stackEntryTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearPendingTimers, [clearPendingTimers]);

  const syncTextareaHeight = useCallback(
    (scrollToBottom = false, animateHeight = false) => {
      const el = textareaRef.current;
      if (!el) return;
      clearPendingTimers();

      // Layout height, not the bounding box, so a scaled ancestor can't skew it.
      const previousHeight = el.offsetHeight || textareaHeightRef.current;

      el.style.height = "auto";
      const scrollHeight = el.scrollHeight;
      const nextHeight = Math.min(Math.max(scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
      const isCapped = scrollHeight > MAX_TEXTAREA_HEIGHT;

      const enableOverflowWhenReady = (delay: number) => {
        if (!isCapped) return;
        overflowTimeoutRef.current = window.setTimeout(() => {
          if (textareaRef.current !== el) return;
          el.style.overflowY = "auto";
          if (scrollToBottom) {
            el.scrollTop = el.scrollHeight;
          }
        }, delay);
      };

      el.style.overflowY = "hidden";

      // Pin the old height for a frame so the CSS height transition has a start value.
      if (animateHeight && previousHeight !== nextHeight) {
        setStackEntryAnimating(true);
        textareaHeightRef.current = previousHeight;
        setTextareaHeight(previousHeight);
        el.style.height = `${previousHeight}px`;
        void el.offsetHeight;

        heightAnimationFrameRef.current = window.requestAnimationFrame(() => {
          heightAnimationFrameRef.current = null;
          if (textareaRef.current !== el) return;
          textareaHeightRef.current = nextHeight;
          setTextareaHeight(nextHeight);
          el.style.height = `${nextHeight}px`;
          enableOverflowWhenReady(160);
          stackEntryTimeoutRef.current = window.setTimeout(() => {
            stackEntryTimeoutRef.current = null;
            setStackEntryAnimating(false);
          }, 180);
        });
        return;
      }

      textareaHeightRef.current = nextHeight;
      setTextareaHeight(nextHeight);
      el.style.height = `${nextHeight}px`;
      enableOverflowWhenReady(0);
    },
    [clearPendingTimers],
  );

  const resetTextareaHeight = useCallback(() => {
    clearPendingTimers();
    setStackEntryAnimating(false);
    textareaHeightRef.current = MIN_TEXTAREA_HEIGHT;
    setTextareaHeight(MIN_TEXTAREA_HEIGHT);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
    el.style.overflowY = "hidden";
    el.scrollTop = 0;
  }, [clearPendingTimers]);

  const measureOverflow = useCallback(() => {
    const grid = gridRef.current;
    const mirror = measureRef.current;
    if (!grid || !mirror) return false;
    const narrowWidth = grid.clientWidth - NARROW_COLUMN_RESERVED;
    if (narrowWidth <= 0) return false;
    if (mirror.value !== draft) mirror.value = draft;
    mirror.style.width = `${narrowWidth}px`;
    mirror.style.height = "auto";
    return mirror.scrollHeight > MIN_TEXTAREA_HEIGHT + 1;
  }, [draft]);

  useLayoutEffect(() => {
    setIsTextOverflowing(measureOverflow());
  }, [measureOverflow]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(() => {
      setIsTextOverflowing(measureOverflow());
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [measureOverflow]);

  useLayoutEffect(() => {
    syncTextareaHeight(true, isEnteringTextareaStack);
  }, [isEnteringTextareaStack, syncTextareaHeight, draft]);

  useLayoutEffect(() => {
    wasTextareaStackedRef.current = isTextareaStacked;
  }, [isTextareaStacked]);

  function setDraft(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function submit() {
    if (!canSend || working) return;

    onSubmit?.({
      text: draft,
      attachments,
    });

    if (value === undefined) {
      setInternalValue("");
    }
    resetTextareaHeight();
  }

  // The depth counter ignores the enter/leave pairs fired by child elements.
  const acceptsDrag = (event: DragEvent) =>
    Boolean(onDropFiles) && event.dataTransfer.types.includes("Files");

  return (
    <div
      className={cn("relative mx-auto w-full max-w-3xl px-4 pb-4", className)}
      onDragEnter={(event) => {
        if (!acceptsDrag(event)) return;
        dragDepthRef.current += 1;
        setIsDraggingFile(true);
      }}
      onDragOver={(event) => {
        if (!acceptsDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (!acceptsDrag(event)) return;
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setIsDraggingFile(false);
      }}
      onDrop={(event) => {
        if (!acceptsDrag(event)) return;
        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDraggingFile(false);
        onDropFiles?.(Array.from(event.dataTransfer.files));
      }}
    >
      <div className="relative">
        {/* A motion style, not a class, so layout animation doesn't distort the corners. */}
        <MotionInputGroup
          layout
          style={{ borderRadius: RADIUS }}
          transition={layoutTransition(0.24)}
          className="relative h-auto flex-col items-stretch overflow-hidden p-1 has-[[data-slot=input-group-control]:focus-visible]:ring-0"
        >
          <PendingAttachmentStrip
            attachments={attachments}
            onRemove={onRemoveAttachment}
            transition={layoutTransition(0.24)}
          />
          <motion.form
            ref={gridRef}
            layout
            className={cn(
              "grid min-h-10 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-end gap-x-1",
              isTextareaStacked ? "grid-rows-[auto_2.5rem]" : "grid-rows-[2.5rem]",
            )}
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            transition={layoutTransition(0.22)}
          >
            <motion.div
              layout
              className={cn(
                "col-start-1 row-start-1 size-10 shrink-0",
                isTextareaStacked && "row-start-2",
              )}
              transition={layoutTransition(0.22)}
            >
              <InputGroupButton
                variant="ghost"
                size="icon-sm"
                className="size-full [&_svg]:size-5"
                onClick={onAddAttachment}
                aria-label="Add attachment"
              >
                <PlusLargeIcon />
              </InputGroupButton>
            </motion.div>
            <motion.textarea
              layout="position"
              ref={textareaRef}
              data-slot="input-group-control"
              value={draft}
              rows={1}
              placeholder={placeholder}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              style={{ height: textareaHeight }}
              className={cn(
                "min-h-10 resize-none overflow-y-hidden bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground motion-reduce:transition-none",
                animateLayout && "transition-[height] duration-150 ease-out",
                isTextareaStacked
                  ? "col-span-3 row-start-1 w-full px-3 pt-3 pb-1 leading-6"
                  : "col-start-2 row-start-1 w-full px-1 py-2.5 leading-5",
              )}
              aria-label="Message"
              transition={layoutTransition(0.22)}
            />
            <textarea
              ref={measureRef}
              aria-hidden="true"
              tabIndex={-1}
              readOnly
              rows={1}
              className="pointer-events-none invisible absolute top-0 left-0 -z-10 box-border min-h-10 w-full resize-none overflow-hidden bg-transparent px-1 py-2.5 text-base leading-5"
            />
            <motion.div
              layout
              className={cn(
                "col-start-3 row-start-1 size-10 shrink-0 justify-self-end",
                isTextareaStacked && "row-start-2",
              )}
              transition={layoutTransition(0.22)}
            >
              {working ? (
                <InputGroupButton
                  variant="red"
                  size="icon-sm"
                  className="size-full [&_svg]:size-3.5"
                  onClick={onInterrupt}
                  aria-label="Stop response"
                >
                  <StopIcon />
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  className="size-full [&_svg]:size-5"
                  disabled={!canSend}
                  aria-label="Send message"
                >
                  {sending ? <LoaderIcon className="animate-spin" /> : <ArrowUpIcon />}
                </InputGroupButton>
              )}
            </motion.div>
          </motion.form>
        </MotionInputGroup>
        <DropOverlay active={isDraggingFile} prefersReducedMotion={prefersReducedMotion} />
      </div>
    </div>
  );
}

function DropOverlay({
  active,
  prefersReducedMotion,
}: {
  active: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <AnimatePresence initial={false}>
      {active ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/72 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: EASE }}
        >
          <motion.div
            className="flex items-center gap-2 text-sm leading-none font-medium text-white"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 2, scale: 0.99 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            <UploadIcon />
            Drop files to add them
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
