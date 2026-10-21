import { useCallback, useEffect, useLayoutEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { InputGroup, InputGroupButton } from "@manikrana/ui/components/ui/input-group";
import { cn } from "@manikrana/ui/lib/utils";
import { ArrowUpIcon } from "@/components/icons/arrow-up";
import { LoaderIcon } from "@/components/icons/loader";
import { PlusLargeIcon } from "@/components/icons/plus-large";
import { StopIcon } from "@/components/icons/stop";
import { UploadIcon } from "@/components/icons/upload";
import { PendingAttachmentStrip, type MessageComposerAttachment } from "./attachments";

export type { MessageComposerAttachment } from "./attachments";

const MIN_TEXTAREA_HEIGHT = 40;
const MAX_TEXTAREA_HEIGHT = 200;
// Must match the grid's two 2.5rem button columns and gap-x-1.
const NARROW_COLUMN_RESERVED = 40 * 2 + 4 * 2;
const EASE = [0.16, 1, 0.3, 1] as const;
const RADIUS = 24;

type TextLayout = { stacked: boolean; height: number; scrolls: boolean; animate: boolean };

function contentHeight(mirror: HTMLTextAreaElement, text: string, width: number) {
  mirror.value = text;
  mirror.style.width = `${width}px`;
  return mirror.scrollHeight;
}

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
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const draft = value ?? internalValue;
  const [textLayout, setTextLayout] = useState<TextLayout>(() => ({
    stacked: draft.includes("\n"),
    height: MIN_TEXTAREA_HEIGHT,
    scrolls: false,
    animate: false,
  }));
  const dragDepthRef = useRef(0);
  const gridRef = useRef<HTMLFormElement>(null);
  const inlineMirrorRef = useRef<HTMLTextAreaElement>(null);
  const stackedMirrorRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = useReducedMotion() === true;
  const uploadInProgress = attachments.some((attachment) => attachment.status === "uploading");
  const canSend =
    !sending && !uploadInProgress && (draft.trim().length > 0 || attachments.length > 0);
  const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: EASE };
  const layoutTransition = textLayout.animate ? transition : { duration: 0 };

  // One measurement sets stacking and height together, so each change is a single layout animation.
  const measureText = useCallback(() => {
    const grid = gridRef.current;
    const inlineMirror = inlineMirrorRef.current;
    const stackedMirror = stackedMirrorRef.current;
    if (!grid || !inlineMirror || !stackedMirror) return;
    const inlineWidth = grid.clientWidth - NARROW_COLUMN_RESERVED;
    if (inlineWidth <= 0) return;

    const stacked =
      draft.includes("\n") ||
      contentHeight(inlineMirror, draft, inlineWidth) > MIN_TEXTAREA_HEIGHT + 1;
    const content = stacked
      ? contentHeight(stackedMirror, draft, grid.clientWidth)
      : MIN_TEXTAREA_HEIGHT;
    const height = Math.min(Math.max(content, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
    const scrolls = content > MAX_TEXTAREA_HEIGHT;

    setTextLayout((current) =>
      current.stacked === stacked && current.height === height && current.scrolls === scrolls
        ? current
        : { stacked, height, scrolls, animate: current.stacked !== stacked },
    );
  }, [draft]);

  useLayoutEffect(measureText, [measureText]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    let width = grid.clientWidth;
    const observer = new ResizeObserver(() => {
      if (grid.clientWidth === width) return;
      width = grid.clientWidth;
      measureText();
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [measureText]);

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
        <InputGroup className="group/composer relative isolate h-auto flex-col items-stretch rounded-3xl bg-transparent p-1 hover:bg-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0">
          {/* Only this empty surface scales; a motion style radius keeps its corners round. */}
          <motion.div
            aria-hidden="true"
            layout
            transition={layoutTransition}
            style={{ borderRadius: RADIUS }}
            className="absolute inset-0 -z-10 bg-control transition-[background-color] duration-150 ease-out group-hover/composer:bg-control-hover"
          />
          <PendingAttachmentStrip
            attachments={attachments}
            onRemove={onRemoveAttachment}
            transition={transition}
          />
          <form
            ref={gridRef}
            className={cn(
              "grid min-h-10 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-end gap-x-1",
              textLayout.stacked ? "grid-rows-[auto_2.5rem]" : "grid-rows-[2.5rem]",
            )}
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <motion.div
              layout="position"
              transition={layoutTransition}
              className={cn(
                "col-start-1 row-start-1 size-10 shrink-0",
                textLayout.stacked && "row-start-2",
              )}
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
              transition={layoutTransition}
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
              style={{ height: textLayout.height }}
              className={cn(
                "min-h-10 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground",
                textLayout.scrolls ? "overflow-y-auto" : "overflow-y-hidden",
                textLayout.stacked
                  ? "col-span-3 row-start-1 px-3 pt-3 pb-1 leading-6"
                  : "col-start-2 row-start-1 px-1 py-2.5 leading-5",
              )}
              aria-label="Message"
            />
            <textarea
              ref={inlineMirrorRef}
              aria-hidden="true"
              tabIndex={-1}
              readOnly
              rows={1}
              className="pointer-events-none invisible absolute top-0 left-0 -z-10 box-border resize-none overflow-hidden bg-transparent px-1 py-2.5 text-base leading-5"
            />
            <textarea
              ref={stackedMirrorRef}
              aria-hidden="true"
              tabIndex={-1}
              readOnly
              rows={1}
              className="pointer-events-none invisible absolute top-0 left-0 -z-10 box-border resize-none overflow-hidden bg-transparent px-3 pt-3 pb-1 text-base leading-6"
            />
            <motion.div
              layout="position"
              transition={layoutTransition}
              className={cn(
                "col-start-3 row-start-1 size-10 shrink-0 justify-self-end",
                textLayout.stacked && "row-start-2",
              )}
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
          </form>
        </InputGroup>
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
