import type { ComponentType } from "react";

import { AIAssistant } from "@/components/design/ai-assistant";

const aiAssistantPreviewTitles: Record<string, string> = {
  "ai-assistant": "AI Assistant",
};

function AIAssistantDemo() {
  return <AIAssistant />;
}

const aiAssistantPreviews: Record<string, ComponentType> = {
  "ai-assistant": AIAssistantDemo,
};

function renderAIAssistantPreview(name: string) {
  const Preview = aiAssistantPreviews[name];

  return Preview ? <Preview /> : null;
}

export { aiAssistantPreviewTitles, renderAIAssistantPreview };
