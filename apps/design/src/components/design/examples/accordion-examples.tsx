import type * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const accordionPreviewTitles: Record<string, string> = {
  "accordion-demo": "Accordion",
  "accordion-borderless": "Accordion Borderless",
  "accordion-multiple": "Accordion Multiple",
  "accordion-status": "Accordion Status",
};

function AccordionDemo() {
  return (
    <Accordion className="w-full max-w-md" defaultValue={["shipping"]}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping settings</AccordionTrigger>
        <AccordionContent>
          Configure fulfillment windows and carrier defaults for this region.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="payments">
        <AccordionTrigger>Payment capture</AccordionTrigger>
        <AccordionContent>
          Decide whether orders are captured immediately or after review.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AccordionBorderless() {
  return (
    <Accordion className="w-full max-w-md" defaultValue={["shipping"]}>
      <AccordionItem value="shipping" variant="ghost">
        <AccordionTrigger>Shipping settings</AccordionTrigger>
        <AccordionContent>
          Configure fulfillment windows and carrier defaults for this region.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="payments" variant="ghost">
        <AccordionTrigger>Payment capture</AccordionTrigger>
        <AccordionContent>
          Decide whether orders are captured immediately or after review.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AccordionMultiple() {
  return (
    <Accordion
      className="w-full max-w-md"
      defaultValue={["inventory", "pricing"]}
    >
      <AccordionItem value="inventory">
        <AccordionTrigger>Inventory policy</AccordionTrigger>
        <AccordionContent>
          Keep selling when stock is low, or pause the listing when it reaches
          zero.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="pricing">
        <AccordionTrigger>Regional pricing</AccordionTrigger>
        <AccordionContent>
          Use price lists to control currency-specific sale and compare-at
          prices.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="metadata">
        <AccordionTrigger>Metadata</AccordionTrigger>
        <AccordionContent>
          Add structured properties for integrations and storefront filters.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function AccordionStatus() {
  return (
    <Accordion className="w-full max-w-md" defaultValue={["sync"]}>
      <AccordionItem value="sync">
        <AccordionTrigger>
          <span className="flex min-w-0 flex-1 items-center gap-2">
            Sync status
            <Badge variant="success">Ready</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          The product catalog is synced and ready for publishing.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="review">
        <AccordionTrigger>
          <span className="flex min-w-0 flex-1 items-center gap-2">
            Review
            <Badge variant="warning">Pending</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          Resolve missing product attributes before the next sync.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const accordionPreviews: Record<string, React.ComponentType> = {
  "accordion-demo": AccordionDemo,
  "accordion-borderless": AccordionBorderless,
  "accordion-multiple": AccordionMultiple,
  "accordion-status": AccordionStatus,
};

function renderAccordionPreview(name: string) {
  const Preview = accordionPreviews[name];

  return Preview ? <Preview /> : null;
}

export { accordionPreviewTitles, renderAccordionPreview };
