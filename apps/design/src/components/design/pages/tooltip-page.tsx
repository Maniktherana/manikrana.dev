import {
  CircleHelpIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  LockIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function IconButtonTooltips() {
  return (
    <div className="medusa-raised flex w-fit flex-wrap items-center gap-1 p-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Refresh inventory" />
          }
        >
          <RefreshCwIcon />
        </TooltipTrigger>
        <TooltipContent>Refresh inventory</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Preview storefront" />
          }
        >
          <EyeIcon />
        </TooltipTrigger>
        <TooltipContent>Preview storefront</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Copy product SKU" />
          }
        >
          <CopyIcon />
        </TooltipTrigger>
        <TooltipContent>Copy product SKU</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Adjust inventory filters"
            />
          }
        >
          <SlidersHorizontalIcon />
        </TooltipTrigger>
        <TooltipContent>Adjust inventory filters</TooltipContent>
      </Tooltip>
    </div>
  );
}

function TextControlTooltips() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="outline" />}>
          <DownloadIcon data-icon="inline-start" />
          Export CSV
        </TooltipTrigger>
        <TooltipContent side="bottom">Includes visible columns and active filters</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="secondary" />}>
          <RotateCcwIcon data-icon="inline-start" />
          Reconcile stock
        </TooltipTrigger>
        <TooltipContent side="bottom">Match warehouse counts with reserved units</TooltipContent>
      </Tooltip>
    </div>
  );
}

function FormHelpTooltip() {
  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <div className="flex items-center gap-1.5">
          <FieldLabel htmlFor="tooltip-reorder-threshold">Reorder threshold</FieldLabel>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Explain reorder threshold"
                />
              }
            >
              <CircleHelpIcon />
            </TooltipTrigger>
            <TooltipContent align="start">
              We notify the purchasing team when available stock falls below this number.
            </TooltipContent>
          </Tooltip>
        </div>
        <Input id="tooltip-reorder-threshold" type="number" defaultValue="24" min="0" />
        <FieldDescription>Used for inventory alerts and supplier planning.</FieldDescription>
      </Field>
    </FieldGroup>
  );
}

function DisabledControlTooltip() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex" aria-label="Refund payment unavailable" />}
        >
          <Button type="button" variant="outline" disabled>
            <LockIcon data-icon="inline-start" />
            Refund payment
          </Button>
        </TooltipTrigger>
        <TooltipContent>Capture the payment before issuing a refund.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex" aria-label="Download label unavailable" />}
        >
          <Button type="button" variant="ghost" disabled>
            <DownloadIcon data-icon="inline-start" />
            Download label
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Shipping labels become available after fulfillment is packed.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function TooltipPage() {
  return (
    <ComponentPageShell title="Tooltip">
      <ComponentDemoBand label="ICON BUTTONS" className="mt-8 flex flex-col items-start gap-4">
        <IconButtonTooltips />
        <TextControlTooltips />
      </ComponentDemoBand>

      <ComponentDemoBand label="FORM HELP" className="mt-8 flex flex-wrap items-start gap-6">
        <FormHelpTooltip />
      </ComponentDemoBand>

      <ComponentDemoBand
        label="DISABLED CONTROLS"
        className="mt-8 flex flex-wrap items-center gap-6"
      >
        <DisabledControlTooltip />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { TooltipPage };
