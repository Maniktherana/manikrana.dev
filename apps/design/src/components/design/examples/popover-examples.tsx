import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverFooterActions,
  PopoverHeader,
  PopoverSeparator,
  PopoverStep,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const popoverPreviewTitles: Record<string, string> = {
  popover: "Popover",
  "popover-demo": "Popover Demo",
  "popover-footer": "Popover Footer",
  "popover-sides": "Popover Sides",
  "popover-stretch": "Popover Stretch",
};

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Open popover</PopoverTrigger>
      <PopoverContent align="center" showArrow showCloseButton>
        <PopoverHeader>
          <PopoverTitle>Insert Popover</PopoverTitle>
          <PopoverDescription>
            Insert popover description here. It would look much better as three lines of text.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverSeparator />
        <PopoverFooter>
          <PopoverStep>Step 1 of 5</PopoverStep>
          <PopoverFooterActions>
            <Button type="button" variant="ghost" size="sm">
              Back
            </Button>
            <Button type="button" size="sm" className="flex-1">
              Next
            </Button>
          </PopoverFooterActions>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

function PopoverFooterDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Open popover</PopoverTrigger>
      <PopoverContent align="center" showArrow>
        <PopoverHeader>
          <PopoverTitle>Publish changes</PopoverTitle>
          <PopoverDescription>Review this update before it goes live.</PopoverDescription>
        </PopoverHeader>
        <PopoverSeparator />
        <PopoverFooter>
          <PopoverStep>Step 1 of 5</PopoverStep>
          <PopoverFooterActions>
            <Button type="button" variant="ghost" size="sm">
              Back
            </Button>
            <Button type="button" size="sm" className="flex-1">
              Next
            </Button>
          </PopoverFooterActions>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

function PopoverStretch() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>Open popover</PopoverTrigger>
      <PopoverContent align="center" showArrow>
        <PopoverHeader>
          <PopoverTitle>Confirm action</PopoverTitle>
          <PopoverDescription>Use stretched actions when the footer has no step text.</PopoverDescription>
        </PopoverHeader>
        <PopoverSeparator />
        <PopoverFooter>
          <PopoverFooterActions>
            <Button type="button" variant="ghost" size="sm" className="flex-1">
              Back
            </Button>
            <Button type="button" size="sm" className="flex-1">
              Next
            </Button>
          </PopoverFooterActions>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

function PopoverSides() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-16">
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>Left side</PopoverTrigger>
        <PopoverContent side="left" align="center" showArrow className="w-[240px]">
          <PopoverHeader>
            <PopoverTitle>Left Arrow</PopoverTitle>
            <PopoverDescription>Arrow spacing for left-side placement.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>Right side</PopoverTrigger>
        <PopoverContent side="right" align="center" showArrow className="w-[240px]">
          <PopoverHeader>
            <PopoverTitle>Right Arrow</PopoverTitle>
            <PopoverDescription>Arrow spacing for right-side placement.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const popoverPreviews: Record<string, ComponentType> = {
  popover: PopoverDemo,
  "popover-demo": PopoverDemo,
  "popover-footer": PopoverFooterDemo,
  "popover-sides": PopoverSides,
  "popover-stretch": PopoverStretch,
};

function renderPopoverPreview(name: string) {
  const Preview = popoverPreviews[name];

  return Preview ? <Preview /> : null;
}

export { popoverPreviewTitles, renderPopoverPreview };
