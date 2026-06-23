import type { ComponentType } from "react";

import { AiChat } from "@/components/design/ai-chat";

const aiChatPreviewTitles: Record<string, string> = {
  "ai-chat": "AI Chat",
};

function AiChatDemo() {
  return <AiChat />;
}

const aiChatPreviews: Record<string, ComponentType> = {
  "ai-chat": AiChatDemo,
};

function renderAiChatPreview(name: string) {
  const Preview = aiChatPreviews[name];

  return Preview ? <Preview /> : null;
}

export { aiChatPreviewTitles, renderAiChatPreview };
