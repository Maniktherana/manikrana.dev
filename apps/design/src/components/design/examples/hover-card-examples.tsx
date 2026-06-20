import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const hoverCardPreviewTitles: Record<string, string> = {
  "hovercard-demo": "Hover Card",
  "hovercard-align": "Hover Card Align",
  "hovercard-composition": "Hover Card Composition",
};

function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="secondary" />}>Open preview</HoverCardTrigger>
      <HoverCardContent className="w-[210px]">
        <p className="text-[13px] leading-[1.6] font-medium text-foreground">Product owner</p>
        <p className="text-[13px] leading-[1.6] text-secondary-foreground">
          Avery Stone manages this collection.
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}

function HoverCardAlign() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <HoverCard>
        <HoverCardTrigger render={<Button variant="secondary" />}>Start</HoverCardTrigger>
        <HoverCardContent align="start">Aligned to start.</HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger render={<Button variant="secondary" />}>Center</HoverCardTrigger>
        <HoverCardContent align="center">Aligned to center.</HoverCardContent>
      </HoverCard>
      <HoverCard>
        <HoverCardTrigger render={<Button variant="secondary" />}>End</HoverCardTrigger>
        <HoverCardContent align="end">Aligned to end.</HoverCardContent>
      </HoverCard>
    </div>
  );
}

function HoverCardComposition() {
  return (
    <HoverCard>
      <HoverCardTrigger render={<Button variant="secondary" />}>Inventory</HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] leading-[1.6] font-medium text-foreground">Warehouse stock</p>
            <Badge variant="success">Synced</Badge>
          </div>
          <p className="text-[13px] leading-[1.6] text-secondary-foreground">
            42 units available across two stocked locations.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

const hoverCardPreviews: Record<string, React.ComponentType> = {
  "hovercard-demo": HoverCardDemo,
  "hovercard-align": HoverCardAlign,
  "hovercard-composition": HoverCardComposition,
};

function renderHoverCardPreview(name: string) {
  const Preview = hoverCardPreviews[name];

  return Preview ? <Preview /> : null;
}

export { hoverCardPreviewTitles, renderHoverCardPreview };
