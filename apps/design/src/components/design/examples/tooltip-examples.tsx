import type * as React from "react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const tooltipPreviewTitles: Record<string, string> = {
  "tooltip-demo": "Tooltip",
  "tooltip-side": "Tooltip Side",
  "tooltip-shortcut": "Tooltip Shortcut",
};

function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>Hover me</TooltipTrigger>
      <TooltipContent>Compact contextual help</TooltipContent>
    </Tooltip>
  );
}

function TooltipSide() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>Top</TooltipTrigger>
        <TooltipContent side="top">Placed above</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>Bottom</TooltipTrigger>
        <TooltipContent side="bottom">Placed below</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>Right</TooltipTrigger>
        <TooltipContent side="right">Placed to the right</TooltipContent>
      </Tooltip>
    </div>
  );
}

function TooltipShortcut() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="secondary" />}>Command menu</TooltipTrigger>
      <TooltipContent>
        Open command menu <Kbd>Cmd</Kbd>
        <Kbd>K</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

const tooltipPreviews: Record<string, React.ComponentType> = {
  "tooltip-demo": TooltipDemo,
  "tooltip-side": TooltipSide,
  "tooltip-shortcut": TooltipShortcut,
};

function renderTooltipPreview(name: string) {
  const Preview = tooltipPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderTooltipPreview, tooltipPreviewTitles };
