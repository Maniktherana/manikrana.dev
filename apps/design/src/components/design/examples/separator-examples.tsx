import type * as React from "react";

import { Separator } from "@/components/ui/separator";

const separatorPreviewTitles: Record<string, string> = {
  "separator-demo": "Separator",
  "separator-vertical": "Separator Vertical",
  "separator-content": "Separator Content",
};

function SeparatorDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div>
        <p className="text-[13px] leading-[1.6] font-medium text-foreground">Order summary</p>
        <p className="text-[13px] leading-[1.6] text-secondary-foreground">
          Review totals before capture.
        </p>
      </div>
      <Separator />
      <div className="flex items-center justify-between text-[13px] leading-[1.6]">
        <span className="text-secondary-foreground">Total</span>
        <span className="font-medium text-foreground">$128.00</span>
      </div>
    </div>
  );
}

function SeparatorVertical() {
  return (
    <div className="flex h-5 items-center gap-3 text-[13px] leading-[1.6] text-secondary-foreground">
      <span>Preview</span>
      <Separator orientation="vertical" />
      <span>Code</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
    </div>
  );
}

function SeparatorContent() {
  return (
    <div className="flex w-full max-w-sm items-center gap-3">
      <Separator />
      <span className="shrink-0 text-[13px] leading-[1.6] font-medium text-muted-foreground">
        or
      </span>
      <Separator />
    </div>
  );
}

const separatorPreviews: Record<string, React.ComponentType> = {
  "separator-demo": SeparatorDemo,
  "separator-vertical": SeparatorVertical,
  "separator-content": SeparatorContent,
};

function renderSeparatorPreview(name: string) {
  const Preview = separatorPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderSeparatorPreview, separatorPreviewTitles };
