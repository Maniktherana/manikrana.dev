import type { ComponentType } from "react";

import {
  MessageComposer,
  type MessageComposerAttachment,
} from "@/components/design/message-composer";

const messageComposerPreviewTitles: Record<string, string> = {
  "message-composer": "Message Composer",
  "message-composer-multiline": "Message Composer Multiline",
  "message-composer-attachments": "Message Composer Attachments",
};

function MessageComposerDemo() {
  return (
    <MessageComposer
      defaultValue="Can you compare these two rollout options?"
      className="w-[min(720px,100%)]"
    />
  );
}

function MessageComposerAttachments() {
  const attachments: MessageComposerAttachment[] = [
    {
      id: "profile-photo",
      name: "manik.png",
      kind: "image",
      objectUrl: "/manik.png",
      status: "ready",
    },
    {
      id: "notes",
      name: "notes.md",
      kind: "document",
      mimeType: "text/markdown",
      status: "ready",
    },
  ];

  return (
    <MessageComposer
      attachments={attachments}
      defaultValue="Use these files as context."
      className="w-[min(720px,100%)]"
    />
  );
}

function MessageComposerMultiline() {
  return (
    <MessageComposer
      defaultValue={"Plan the launch checklist:\n- staging QA\n- owner handoff\n- docs cleanup"}
      className="w-[min(720px,100%)]"
    />
  );
}

const messageComposerPreviews: Record<string, ComponentType> = {
  "message-composer": MessageComposerDemo,
  "message-composer-multiline": MessageComposerMultiline,
  "message-composer-attachments": MessageComposerAttachments,
};

function renderMessageComposerPreview(name: string) {
  const Preview = messageComposerPreviews[name];

  return Preview ? <Preview /> : null;
}

export { messageComposerPreviewTitles, renderMessageComposerPreview };
