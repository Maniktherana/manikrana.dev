import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  AlertCircleIcon,
  ArrowUpIcon,
  Loader2Icon,
  PlayIcon,
  PlusIcon,
  SquareIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { InputGroup, InputGroupButton } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

const MIN_TEXTAREA_HEIGHT = 40;
const MAX_TEXTAREA_HEIGHT = 200;
const NARROW_COLUMN_RESERVED = 40 * 2 + 4 * 2;

type MessageComposerAttachmentStatus = "ready" | "uploading" | "failed";

type MessageComposerAttachment = {
  id: string;
  name: string;
  description?: string;
  error?: string;
  kind?: "document" | "image" | "video";
  mimeType?: string;
  objectUrl?: string;
  progress?: number;
  status?: MessageComposerAttachmentStatus;
};

type MessageComposerSubmit = {
  text: string;
  attachments: MessageComposerAttachment[];
};

type MessageComposerProps = {
  attachments?: MessageComposerAttachment[];
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  dropActive?: boolean;
  dropOverlay?: "fixed" | "contained";
  limitMessage?: string;
  onAddAttachment?: () => void;
  onChange?: (value: string) => void;
  onDropFiles?: (files: File[]) => void;
  onInterrupt?: () => void;
  onRemoveAttachment?: (id: string) => void;
  onRetryAttachment?: (id: string) => void;
  onSubmit?: (draft: MessageComposerSubmit) => void;
  placeholder?: string;
  sending?: boolean;
  value?: string;
  working?: boolean;
};

function MessageComposer({
  attachments = [],
  className,
  defaultValue = "",
  disabled = false,
  dropActive = false,
  dropOverlay = "fixed",
  limitMessage,
  onAddAttachment,
  onChange,
  onDropFiles,
  onInterrupt,
  onRemoveAttachment,
  onRetryAttachment,
  onSubmit,
  placeholder = "Message Puch AI...",
  sending = false,
  value,
  working = false,
}: MessageComposerProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [textareaHeight, setTextareaHeight] = React.useState(MIN_TEXTAREA_HEIGHT);
  const [isDraggingFile, setIsDraggingFile] = React.useState(false);
  const [isTextOverflowing, setIsTextOverflowing] = React.useState(false);
  const [stackEntryAnimating, setStackEntryAnimating] = React.useState(false);
  const dragDepthRef = React.useRef(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const gridRef = React.useRef<HTMLFormElement>(null);
  const measureRef = React.useRef<HTMLTextAreaElement>(null);
  const textareaHeightRef = React.useRef(MIN_TEXTAREA_HEIGHT);
  const wasTextareaStackedRef = React.useRef(false);
  const overflowTimeoutRef = React.useRef<number | null>(null);
  const heightAnimationFrameRef = React.useRef<number | null>(null);
  const stackEntryTimeoutRef = React.useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const draft = value ?? internalValue;
  const uploadInProgress = attachments.some((attachment) => attachment.status === "uploading");
  const uploadFailed = attachments.some((attachment) => attachment.status === "failed");
  const canSend =
    !disabled &&
    !sending &&
    !uploadInProgress &&
    !uploadFailed &&
    (draft.trim().length > 0 || attachments.length > 0);
  const hasComposerContentAbove = attachments.length > 0 || Boolean(limitMessage);
  const isTextareaStacked = draft.includes("\n") || isTextOverflowing;
  const isEnteringTextareaStack = isTextareaStacked && !wasTextareaStackedRef.current;
  const shouldAnimateComposerLayout =
    !isTextareaStacked || isEnteringTextareaStack || stackEntryAnimating;
  const shouldAnimateTextareaHeight =
    !isTextareaStacked || isEnteringTextareaStack || stackEntryAnimating;
  const isComposerExpanded = hasComposerContentAbove || isTextareaStacked;
  const showDropZone = (dropActive || isDraggingFile) && !disabled;

  React.useEffect(() => {
    return () => {
      if (overflowTimeoutRef.current !== null) {
        window.clearTimeout(overflowTimeoutRef.current);
      }
      if (heightAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(heightAnimationFrameRef.current);
      }
      if (stackEntryTimeoutRef.current !== null) {
        window.clearTimeout(stackEntryTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (disabled) return;

    const hasFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes("Files");

    function onDragEnter(event: DragEvent) {
      if (!hasFiles(event)) return;
      dragDepthRef.current += 1;
      setIsDraggingFile(true);
    }

    function onDragOver(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    }

    function onDragLeave(event: DragEvent) {
      if (!hasFiles(event)) return;
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setIsDraggingFile(false);
    }

    function reset() {
      dragDepthRef.current = 0;
      setIsDraggingFile(false);
    }

    function onDrop(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      const files = Array.from(event.dataTransfer?.files ?? []);
      reset();
      onDropFiles?.(files);
    }

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragend", reset);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragend", reset);
    };
  }, [disabled, onDropFiles]);

  const syncTextareaHeight = React.useCallback((scrollToBottom = false, animateHeight = false) => {
    const el = textareaRef.current;
    if (!el) return;

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

    const previousHeight = el.getBoundingClientRect().height || textareaHeightRef.current;

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
  }, []);

  const resetTextareaHeight = React.useCallback(() => {
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
    setStackEntryAnimating(false);
    textareaHeightRef.current = MIN_TEXTAREA_HEIGHT;
    setTextareaHeight(MIN_TEXTAREA_HEIGHT);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
    el.style.overflowY = "hidden";
    el.scrollTop = 0;
  }, []);

  const measureOverflow = React.useCallback(() => {
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

  React.useLayoutEffect(() => {
    setIsTextOverflowing(measureOverflow());
  }, [measureOverflow]);

  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setIsTextOverflowing(measureOverflow());
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [measureOverflow]);

  React.useLayoutEffect(() => {
    syncTextareaHeight(true, isEnteringTextareaStack);
  }, [isEnteringTextareaStack, syncTextareaHeight, draft]);

  React.useLayoutEffect(() => {
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

  return (
    <div className={cn("relative mx-auto w-full max-w-3xl px-4 pb-4", className)}>
      <DropOverlay
        active={showDropZone}
        contained={dropOverlay === "contained"}
        prefersReducedMotion={prefersReducedMotion === true}
      />
      <motion.div
        layout
        className="relative"
        transition={
          shouldAnimateComposerLayout
            ? { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0 }
        }
      >
        <InputGroup
          className={cn(
            "h-auto! flex-col items-stretch overflow-visible! bg-secondary before:rounded-[inherit]!",
            isComposerExpanded ? "rounded-3xl!" : "rounded-full!",
            attachments.length > 0 ? "p-1 pt-0.5" : "p-1",
          )}
        >
          <PendingAttachmentStrip
            attachments={attachments}
            onRemove={onRemoveAttachment}
            onRetry={onRetryAttachment}
          />
          {limitMessage ? (
            <p className="mb-1 px-2 text-xs text-muted-foreground">{limitMessage}</p>
          ) : null}
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
            transition={
              shouldAnimateComposerLayout
                ? { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0 }
            }
          >
            <motion.div
              layout
              className={cn(
                "col-start-1 row-start-1 size-10 shrink-0",
                isTextareaStacked && "row-start-2",
              )}
              transition={
                shouldAnimateComposerLayout
                  ? { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0 }
              }
            >
              <InputGroupButton
                variant="ghost"
                size="icon-sm"
                className="size-full rounded-full! [&_svg]:size-5"
                disabled={disabled}
                onClick={onAddAttachment}
                aria-label="Add attachment"
              >
                <PlusIcon aria-hidden="true" />
              </InputGroupButton>
            </motion.div>
            <motion.textarea
              layout="position"
              ref={textareaRef}
              value={draft}
              rows={1}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              style={{ height: textareaHeight }}
              className={cn(
                "min-h-10 resize-none overflow-y-hidden border-0 bg-transparent text-base text-foreground shadow-none outline-none placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:text-muted-foreground motion-reduce:transition-none",
                shouldAnimateTextareaHeight && "transition-[height] duration-150 ease-out",
                isTextareaStacked
                  ? "col-span-3 row-start-1 w-full px-3 pt-3 pb-1 leading-6"
                  : "col-start-2 row-start-1 w-full px-1 py-2.5 leading-5",
              )}
              aria-label="Message"
              transition={
                shouldAnimateComposerLayout
                  ? { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0 }
              }
            />
            <textarea
              ref={measureRef}
              aria-hidden="true"
              tabIndex={-1}
              readOnly
              rows={1}
              className="pointer-events-none invisible absolute top-0 left-0 -z-10 box-border min-h-10 w-full resize-none overflow-hidden border-0 bg-transparent px-1 py-2.5 text-base leading-5"
            />
            <motion.div
              layout
              className={cn(
                "col-start-3 row-start-1 size-10 shrink-0 justify-self-end",
                isTextareaStacked && "row-start-2",
              )}
              transition={
                shouldAnimateComposerLayout
                  ? { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                  : { duration: 0 }
              }
            >
              {working ? (
                <InputGroupButton
                  variant="destructive"
                  size="icon-sm"
                  className="size-full rounded-full! [&_svg]:size-6"
                  onClick={onInterrupt}
                  aria-label="Stop response"
                >
                  <SquareIcon className="size-5 fill-current" aria-hidden="true" />
                </InputGroupButton>
              ) : (
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  className="size-full rounded-full! [&_svg]:size-5"
                  disabled={!canSend}
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2Icon className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowUpIcon aria-hidden="true" />
                  )}
                </InputGroupButton>
              )}
            </motion.div>
          </motion.form>
        </InputGroup>
      </motion.div>
    </div>
  );
}

function DropOverlay({
  active,
  contained,
  prefersReducedMotion,
}: {
  active: boolean;
  contained: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <AnimatePresence initial={false}>
      {active ? (
        <motion.div
          className={cn(
            "pointer-events-none z-[100] flex items-center justify-center bg-black/72",
            contained ? "absolute inset-0 rounded-3xl" : "fixed inset-0",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="flex flex-col items-center gap-3 text-center text-white"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex size-20 items-center justify-center rounded-3xl bg-white/10 shadow-[inset_0_0_0_1px_rgb(255_255_255_/_12%)] backdrop-blur-sm">
              <UploadIcon className="size-8" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-semibold tracking-normal">Add anything</div>
              <div className="text-base font-medium text-white">
                Drop files anywhere to add them to this message
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PendingAttachmentStrip({
  attachments,
  onRemove,
  onRetry,
}: {
  attachments: MessageComposerAttachment[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {attachments.length > 0 ? (
        <motion.div
          key="pending-attachments"
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex gap-1.5 overflow-x-auto pt-1 pb-1.5">
            {attachments.map((attachment) => (
              <PendingAttachmentTile
                key={attachment.id}
                attachment={attachment}
                onRemove={onRemove ? () => onRemove(attachment.id) : undefined}
                onRetry={onRetry ? () => onRetry(attachment.id) : undefined}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PendingAttachmentTile({
  attachment,
  onRemove,
  onRetry,
}: {
  attachment: MessageComposerAttachment;
  onRemove?: () => void;
  onRetry?: () => void;
}) {
  const isUploading = attachment.status === "uploading";
  const isFailed = attachment.status === "failed";
  const progress = Math.max(0, Math.min(1, attachment.progress ?? 0));
  const displayedProgress = isUploading ? Math.max(progress, 0.08) : progress;
  const progressRadius = 18;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset = progressCircumference * (1 - displayedProgress);

  return (
    <div className="relative size-28 shrink-0 overflow-hidden rounded-3xl border border-border/80 bg-secondary shadow-[var(--shadow-control)]">
      <PendingAttachmentPreview attachment={attachment} />
      {isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/44">
          <svg
            className="size-12 -rotate-90 text-white drop-shadow"
            viewBox="0 0 48 48"
            aria-label={`Uploading ${Math.round(progress * 100)}%`}
          >
            <circle
              cx="24"
              cy="24"
              r={progressRadius}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.28"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={progressRadius}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="4"
              strokeDasharray={progressCircumference}
              strokeDashoffset={progressOffset}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
        </div>
      ) : null}
      {isFailed ? (
        <button
          type="button"
          onClick={onRetry}
          className="absolute inset-0 flex items-center justify-center bg-destructive/85 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Retry attachment upload"
          title={attachment.error ?? "Upload failed"}
        >
          <AlertCircleIcon className="size-6" aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-background text-foreground shadow-[var(--shadow-control)] transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label="Remove attachment"
      >
        <XIcon className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function PendingAttachmentPreview({ attachment }: { attachment: MessageComposerAttachment }) {
  if (attachment.kind === "image" && attachment.objectUrl) {
    return (
      <img
        src={attachment.objectUrl}
        alt={attachment.name}
        className="h-full w-full object-cover"
      />
    );
  }

  if (attachment.kind === "video" && attachment.objectUrl) {
    return (
      <>
        <video
          src={attachment.objectUrl}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <span
          className="absolute inset-0 flex items-center justify-center text-white"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.65))" }}
        >
          <PlayIcon className="size-7 fill-current" aria-hidden="true" />
        </span>
      </>
    );
  }

  return <DocumentTile fileName={attachment.name} mimeType={attachment.mimeType} />;
}

function DocumentTile({ fileName, mimeType }: { fileName: string; mimeType?: string }) {
  const label = documentFormatLabel(mimeType, fileName);
  const { stem, extension } = splitDisplayName(fileName, label);

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-xl border border-border/10 bg-secondary p-2.5 text-secondary-foreground">
      <span className="text-left text-xs font-semibold tracking-wide text-secondary-foreground/70">
        {label}
      </span>
      <p className="line-clamp-2 text-left text-sm leading-4 break-words">
        {truncateFileName(stem)}
        {extension ? <span>{extension}</span> : null}
      </p>
    </div>
  );
}

function documentFormatLabel(mimeType: string | undefined, fileName: string) {
  const extension = fileName.split(".").pop()?.toUpperCase();

  if (extension && extension !== fileName.toUpperCase()) return extension;
  if (mimeType?.includes("pdf")) return "PDF";
  if (mimeType?.startsWith("text/")) return "TXT";

  return "FILE";
}

function splitDisplayName(fileName: string, label: string) {
  const suffix = `.${label.toLowerCase()}`;

  if (fileName.toLowerCase().endsWith(suffix)) {
    return {
      stem: fileName.slice(0, -suffix.length),
      extension: suffix,
    };
  }

  return {
    stem: fileName,
    extension: "",
  };
}

function truncateFileName(fileName: string) {
  if (fileName.length <= 25) return fileName;
  return `${fileName.slice(0, 25)}...`;
}

export { MessageComposer };
export type {
  MessageComposerAttachment,
  MessageComposerAttachmentStatus,
  MessageComposerProps,
  MessageComposerSubmit,
};
