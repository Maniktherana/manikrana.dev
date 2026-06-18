import type * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const labelPreviewTitles: Record<string, string> = {
  "label-demo": "Label",
  "label-input": "Label Input",
  "label-checkbox": "Label Checkbox",
  "label-disabled": "Label Disabled",
};

function LabelDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="label-demo-email">Customer email</Label>
      <Input id="label-demo-email" placeholder="customer@example.com" />
    </div>
  );
}

function LabelInput() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="label-input-name">Display name</Label>
      <Input id="label-input-name" defaultValue="Manik Rana" />
    </div>
  );
}

function LabelCheckbox() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="label-checkbox-marketing" defaultChecked />
      <Label htmlFor="label-checkbox-marketing">Send marketing updates</Label>
    </div>
  );
}

function LabelDisabled() {
  return (
    <div className="group flex items-center gap-3" data-disabled="true">
      <Checkbox id="label-disabled-sync" disabled />
      <Label htmlFor="label-disabled-sync">Sync disabled</Label>
    </div>
  );
}

const labelPreviews: Record<string, React.ComponentType> = {
  "label-demo": LabelDemo,
  "label-input": LabelInput,
  "label-checkbox": LabelCheckbox,
  "label-disabled": LabelDisabled,
};

function renderLabelPreview(name: string) {
  const Preview = labelPreviews[name];

  return Preview ? <Preview /> : null;
}

export { labelPreviewTitles, renderLabelPreview };
