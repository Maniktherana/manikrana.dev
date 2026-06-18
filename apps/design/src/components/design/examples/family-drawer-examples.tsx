import type { ComponentType } from "react";

import { FamilyDrawer } from "@/components/design/family-drawer";

const familyDrawerPreviewTitles: Record<string, string> = {
  "family-drawer": "Family Drawer",
};

function FamilyDrawerDemo() {
  return <FamilyDrawer />;
}

const familyDrawerPreviews: Record<string, ComponentType> = {
  "family-drawer": FamilyDrawerDemo,
};

function renderFamilyDrawerPreview(name: string) {
  const Preview = familyDrawerPreviews[name];

  return Preview ? <Preview /> : null;
}

export { familyDrawerPreviewTitles, renderFamilyDrawerPreview };
