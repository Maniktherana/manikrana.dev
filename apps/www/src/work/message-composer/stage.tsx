import { useEffect, useRef, useState } from "react";
import { MessageComposer, type MessageComposerAttachment } from "./message-composer";

type NewAttachment = Omit<MessageComposerAttachment, "id">;

// What the + button attaches, in turn: a photo, then a document.
const SAMPLES: NewAttachment[] = [
  { name: "manik.png", kind: "image", objectUrl: "/manik.png" },
  { name: "rollout-notes.md", kind: "document", mimeType: "text/markdown" },
];

function kindOf(file: File): MessageComposerAttachment["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

export function Stage() {
  const [attachments, setAttachments] = useState<MessageComposerAttachment[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "working">("idle");
  const added = useRef(0);
  const replyTimer = useRef(0);
  // Previews of dropped files, released once a file is removed or sent.
  const objectUrls = useRef(new Set<string>());
  const uploading = attachments.some((attachment) => attachment.status === "uploading");

  // Uploads are simulated: progress ticks up until each file is ready.
  useEffect(() => {
    if (!uploading) return;
    const interval = window.setInterval(() => {
      setAttachments((current) =>
        current.map((attachment) => {
          if (attachment.status !== "uploading") return attachment;
          const progress = Math.min(1, (attachment.progress ?? 0) + 0.1);
          return { ...attachment, progress, status: progress < 1 ? "uploading" : "ready" };
        }),
      );
    }, 120);
    return () => window.clearInterval(interval);
  }, [uploading]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      window.clearTimeout(replyTimer.current);
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function attach(files: NewAttachment[]) {
    const next = files.map((file) => ({
      ...file,
      id: `attachment-${(added.current += 1)}`,
      status: "uploading" as const,
      progress: 0,
    }));
    setAttachments((current) => [...current, ...next]);
  }

  function release(list: MessageComposerAttachment[]) {
    for (const { objectUrl } of list) {
      if (objectUrl && objectUrls.current.delete(objectUrl)) URL.revokeObjectURL(objectUrl);
    }
  }

  return (
    // The composer is fluid and never scaled, which would throw off its layout
    // animations. It sits on a fixed bottom edge and grows up from it.
    <div className="flex size-full items-end justify-center px-4 pb-24">
      <div className="w-full max-w-120">
        <MessageComposer
          className="p-0"
          attachments={attachments}
          sending={status === "sending"}
          working={status === "working"}
          onAddAttachment={() => attach([SAMPLES[added.current % SAMPLES.length]])}
          onDropFiles={(files) =>
            attach(
              files.map((file) => {
                const kind = kindOf(file);
                const objectUrl = kind === "document" ? undefined : URL.createObjectURL(file);
                if (objectUrl) objectUrls.current.add(objectUrl);
                return { name: file.name, kind, mimeType: file.type, objectUrl };
              }),
            )
          }
          onRemoveAttachment={(id) => {
            release(attachments.filter((attachment) => attachment.id === id));
            setAttachments((current) => current.filter((attachment) => attachment.id !== id));
          }}
          // Sending is simulated too: a beat to send, then a reply that works
          // until it finishes or is stopped.
          onSubmit={() => {
            release(attachments);
            setAttachments([]);
            setStatus("sending");
            replyTimer.current = window.setTimeout(() => {
              setStatus("working");
              replyTimer.current = window.setTimeout(() => setStatus("idle"), 2400);
            }, 600);
          }}
          onInterrupt={() => {
            window.clearTimeout(replyTimer.current);
            setStatus("idle");
          }}
        />
      </div>
    </div>
  );
}
