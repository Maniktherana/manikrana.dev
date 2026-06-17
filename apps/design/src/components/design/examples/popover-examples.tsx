import type { ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverFooterActions,
  PopoverFooterButton,
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
  "popover-stretch": "Popover Stretch",
};

function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
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
            <PopoverFooterButton>Back</PopoverFooterButton>
            <PopoverFooterButton tone="primary" stretch>
              Next
            </PopoverFooterButton>
          </PopoverFooterActions>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

function PopoverFooterDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent align="center" showArrow>
        <PopoverHeader>
          <PopoverTitle>Publish changes</PopoverTitle>
          <PopoverDescription>Review this update before it goes live.</PopoverDescription>
        </PopoverHeader>
        <PopoverSeparator />
        <PopoverFooter>
          <PopoverStep>Step 1 of 5</PopoverStep>
          <PopoverFooterActions>
            <PopoverFooterButton>Back</PopoverFooterButton>
            <PopoverFooterButton tone="primary" stretch>
              Next
            </PopoverFooterButton>
          </PopoverFooterActions>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

function PopoverStretch() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent align="center" showArrow>
        <PopoverHeader>
          <PopoverTitle>Confirm action</PopoverTitle>
          <PopoverDescription>Use stretched actions when the footer has no step text.</PopoverDescription>
        </PopoverHeader>
        <PopoverSeparator />
        <PopoverFooter>
          <PopoverFooterActions>
            <PopoverFooterButton stretch>Back</PopoverFooterButton>
            <PopoverFooterButton tone="primary" stretch>
              Next
            </PopoverFooterButton>
          </PopoverFooterActions>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

const popoverPreviews: Record<string, ComponentType> = {
  popover: PopoverDemo,
  "popover-demo": PopoverDemo,
  "popover-footer": PopoverFooterDemo,
  "popover-stretch": PopoverStretch,
};

function renderPopoverPreview(name: string) {
  const Preview = popoverPreviews[name];

  return Preview ? <Preview /> : null;
}

export { popoverPreviewTitles, renderPopoverPreview };
