import type { ComponentType } from "react";

import { DynamicIsland } from "@/components/design/dynamic-island";

const dynamicIslandPreviewTitles: Record<string, string> = {
  "dynamic-island": "Dynamic Island",
};

function DynamicIslandDemo() {
  return <DynamicIsland />;
}

const dynamicIslandPreviews: Record<string, ComponentType> = {
  "dynamic-island": DynamicIslandDemo,
};

function renderDynamicIslandPreview(name: string) {
  const Preview = dynamicIslandPreviews[name];

  return Preview ? <Preview /> : null;
}

export { dynamicIslandPreviewTitles, renderDynamicIslandPreview };
