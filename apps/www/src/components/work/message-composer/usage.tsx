import { useState } from "react";
import { MessageComposer, type MessageComposerAttachment } from "./message-composer";

function toAttachment(file: File): MessageComposerAttachment {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type,
    kind: file.type.startsWith("image/") ? "image" : "document",
    objectUrl: URL.createObjectURL(file),
  };
}

export function Example() {
  const [attachments, setAttachments] = useState<MessageComposerAttachment[]>([]);

  return (
    <MessageComposer
      attachments={attachments}
      onDropFiles={(files) => setAttachments((current) => [...current, ...files.map(toAttachment)])}
      onRemoveAttachment={(id) =>
        setAttachments((current) => current.filter((attachment) => attachment.id !== id))
      }
      onSubmit={() => setAttachments([])}
    />
  );
}
