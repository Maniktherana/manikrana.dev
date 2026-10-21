import { AnimatePresence, motion, type Transition } from "motion/react";
import { CloseIcon } from "@/components/icons/close";
import { PlayIcon } from "@/components/icons/play";

export type MessageComposerAttachment = {
  id: string;
  name: string;
  kind?: "document" | "image" | "video";
  mimeType?: string;
  objectUrl?: string;
  progress?: number;
  status?: "ready" | "uploading";
};

export type PendingAttachmentStripProps = {
  attachments: MessageComposerAttachment[];
  onRemove?: (id: string) => void;
  transition: Transition;
};

// scroll-fade-x needs "shadcn/tailwind.css".
export function PendingAttachmentStrip({
  attachments,
  onRemove,
  transition,
}: PendingAttachmentStripProps) {
  return (
    <AnimatePresence initial={false}>
      {attachments.length > 0 ? (
        <motion.div
          key="pending-attachments"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={transition}
          className="overflow-hidden"
        >
          <div className="scroll-fade-x flex gap-1.5 overflow-x-auto pb-1">
            {attachments.map((attachment) => (
              <PendingAttachmentTile
                key={attachment.id}
                attachment={attachment}
                onRemove={onRemove ? () => onRemove(attachment.id) : undefined}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const PROGRESS_RADIUS = 18;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

function PendingAttachmentTile({
  attachment,
  onRemove,
}: {
  attachment: MessageComposerAttachment;
  onRemove?: () => void;
}) {
  const isUploading = attachment.status === "uploading";
  const progress = Math.max(0, Math.min(1, attachment.progress ?? 0));
  const displayedProgress = isUploading ? Math.max(progress, 0.08) : progress;
  const progressOffset = PROGRESS_CIRCUMFERENCE * (1 - displayedProgress);

  return (
    <div className="relative size-28 shrink-0 overflow-hidden rounded-[calc(var(--radius-3xl)-var(--spacing))] bg-control outline -outline-offset-1 outline-white/10">
      <PendingAttachmentPreview attachment={attachment} />
      {isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/44">
          <span className="sr-only">{`Uploading ${Math.round(progress * 100)}%`}</span>
          <svg
            className="size-12 -rotate-90 text-white drop-shadow"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r={PROGRESS_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.28"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={PROGRESS_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="4"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={progressOffset}
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 flex size-6 transform-gpu items-center justify-center rounded-full bg-popover text-control-foreground shadow-control outline-none [backface-visibility:hidden] transition-[color,scale] duration-150 ease-out hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]"
        aria-label={`Remove ${attachment.name}`}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function PendingAttachmentPreview({ attachment }: { attachment: MessageComposerAttachment }) {
  if (attachment.kind === "image" && attachment.objectUrl) {
    return (
      <img src={attachment.objectUrl} alt={attachment.name} className="size-full object-cover" />
    );
  }

  if (attachment.kind === "video" && attachment.objectUrl) {
    return (
      <>
        <video
          src={attachment.objectUrl}
          aria-label={attachment.name}
          muted
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
          <PlayIcon className="size-7" />
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
    <div className="flex size-full flex-col justify-between p-3 text-control-foreground">
      <span className="text-xs leading-none font-semibold tracking-wide text-muted-foreground">
        {label}
      </span>
      <p className="line-clamp-2 text-sm leading-snug break-words">
        {truncateFileName(stem)}
        {extension}
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
  return `${fileName.slice(0, 25)}…`;
}
