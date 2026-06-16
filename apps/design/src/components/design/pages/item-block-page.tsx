import {
  ChevronDownIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  PencilLineIcon,
  ReceiptCentIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function ItemBlockExample({
  defaultOpen = false,
  filled = true,
}: {
  defaultOpen?: boolean;
  filled?: boolean;
}) {
  return (
    <details
      className="medusa-item-block"
      open={defaultOpen}
      data-filled={filled ? "true" : "false"}
    >
      <summary className="medusa-item-block-summary">
        <span className="medusa-item-block-main">
          <span className="medusa-item-thumbnail" aria-hidden="true" />
          <span className="medusa-item-copy">
            <span className="medusa-item-title-line">
              <span className="medusa-item-title">
                {filled ? "Everyday Hoodie" : "Untitled item"}
              </span>
              <span className="medusa-item-sku">{filled ? "(HD-240-BLK)" : "(SKU)"}</span>
            </span>
            <span className="medusa-item-meta">
              {filled ? "Black / Medium" : "Option 1 - Option 2"}
            </span>
          </span>
          <span className="medusa-item-badges" aria-label="Item attributes">
            <Badge variant="outline" className="size-5 p-0">
              <ReceiptCentIcon />
            </Badge>
            <Badge variant="outline" className="size-5 p-0">
              <MessageSquareTextIcon />
            </Badge>
            <Badge variant="outline" className="size-5 p-0">
              <FileTextIcon />
            </Badge>
          </span>
        </span>
        <span className="medusa-item-block-side">
          <span className="medusa-item-quantity">1x</span>
          <span className="medusa-item-prices">
            {filled ? <span className="medusa-item-origin-price">$2,000.00</span> : null}
            <span>$1,000.00</span>
          </span>
          <Button type="button" variant="ghost" size="icon-xs" aria-label="Edit item">
            <PencilLineIcon />
          </Button>
          <ChevronDownIcon className="medusa-item-chevron" aria-hidden="true" />
        </span>
      </summary>
      <div className="medusa-item-block-details">
        <div>
          <p className="medusa-small-plus">Details</p>
          <p className="medusa-small text-muted-foreground">
            Quantity, pricing, and item notes stay editable while the row remains compact.
          </p>
        </div>
        <div className="medusa-item-detail-grid">
          <span>Tax inclusive</span>
          <span>{filled ? "Yes" : "Not configured"}</span>
          <span>Fulfillment</span>
          <span>{filled ? "Warehouse A" : "Unassigned"}</span>
          <span>Discount</span>
          <span>{filled ? "Summer edit" : "None"}</span>
        </div>
      </div>
    </details>
  );
}

function ItemBlockPage() {
  return (
    <ComponentPageShell title="Item Block">
      <ComponentDemoBand label="TYPES" className="mt-8 flex w-full flex-col gap-8">
        <ItemBlockExample filled />
        <ItemBlockExample filled defaultOpen />
        <ItemBlockExample filled={false} />
        <ItemBlockExample filled={false} defaultOpen />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { ItemBlockPage };
