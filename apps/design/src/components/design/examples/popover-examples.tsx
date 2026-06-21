import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const popoverPreviewTitles: Record<string, string> = {
  popover: "Popover",
  "popover-demo": "Popover",
  "popover-align": "Popover Align",
  "popover-close": "Popover Close",
  "popover-composition": "Popover Composition",
};

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Project status</PopoverTitle>
        <PopoverDescription>This workspace is synced and ready for review.</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}

function PopoverAlign() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Start</PopoverTrigger>
        <PopoverContent align="start">Aligned to start.</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Center</PopoverTrigger>
        <PopoverContent align="center">Aligned to center.</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>End</PopoverTrigger>
        <PopoverContent align="end">Aligned to end.</PopoverContent>
      </Popover>
    </div>
  );
}

function PopoverCloseDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent className="w-64">
        <PopoverTitle>Publish changes</PopoverTitle>
        <PopoverDescription>Review this update before it goes live.</PopoverDescription>
        <div className="mt-3 flex justify-end">
          <PopoverClose render={<Button type="button" variant="outline" size="sm" />}>
            Close
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PopoverComposition() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Invite</PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-2">
          <PopoverTitle>Invite teammate</PopoverTitle>
          <PopoverDescription>Send a review invite to someone on your team.</PopoverDescription>
          <div className="flex items-center gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" className="flex-1">
              Copy link
            </Button>
            <Button type="button" size="sm" className="flex-1">
              Send
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const popoverPreviews: Record<string, ComponentType> = {
  popover: PopoverDemo,
  "popover-demo": PopoverDemo,
  "popover-align": PopoverAlign,
  "popover-close": PopoverCloseDemo,
  "popover-composition": PopoverComposition,
};

function renderPopoverPreview(name: string) {
  const Preview = popoverPreviews[name];

  return Preview ? <Preview /> : null;
}

export { popoverPreviewTitles, renderPopoverPreview };
