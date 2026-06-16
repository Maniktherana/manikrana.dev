import {
  ArrowRightIcon,
  CircleHelpIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  LockIcon,
  MapPinIcon,
  PackageIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
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

function RichTooltipExamples() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="outline" />}>
          <CopyIcon data-icon="inline-start" />
          Duplicate
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Duplicate product
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>D</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="outline" />}>
          <RotateCcwIcon data-icon="inline-start" />
          Return policy
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-72 max-w-none flex-col items-start! gap-2 p-3!">
          <span className="medusa-small-plus">Return window</span>
          <span className="medusa-small text-muted-foreground">
            Items can be returned within 30 days if they are unused and include original packaging.
          </span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="secondary" />}>
          <TrendingUpIcon data-icon="inline-start" />
          Sell-through
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-40 max-w-none flex-col items-start! gap-2 p-3!">
          <span className="medusa-small-plus">7 day trend</span>
          <div className="flex h-16 w-full items-end gap-1">
            {[32, 44, 36, 52, 68, 58, 74].map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-sm bg-foreground/20"
                style={{ height }}
              />
            ))}
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="ghost" />}>
          <PackageIcon data-icon="inline-start" />
          Locations
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-48 max-w-none flex-col items-start! gap-2 p-3!">
          <span className="medusa-small-plus">Available stock</span>
          <span className="flex w-full justify-between gap-4">
            <span>New Jersey</span>
            <span className="text-muted-foreground">128</span>
          </span>
          <span className="flex w-full justify-between gap-4">
            <span>Rotterdam</span>
            <span className="text-muted-foreground">42</span>
          </span>
          <span className="flex w-full justify-between gap-4">
            <span>Bengaluru</span>
            <span className="text-muted-foreground">76</span>
          </span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="ghost" />}>
          <MapPinIcon data-icon="inline-start" />
          Ship from
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-44 max-w-none flex-col items-start! gap-1 p-3!">
          <span className="medusa-small-plus">Fulfillment center</span>
          <span>120 Hudson St</span>
          <span className="text-muted-foreground">Jersey City, NJ</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button type="button" variant="outline" />}>
          Path
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-none gap-1">
          Products
          <ArrowRightIcon className="size-3 text-muted-foreground" />
          Variants
          <ArrowRightIcon className="size-3 text-muted-foreground" />
          Pricing
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

      <ComponentDemoBand label="RICH CONTENT" className="mt-8 flex flex-wrap items-center gap-6">
        <RichTooltipExamples />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { TooltipPage };
