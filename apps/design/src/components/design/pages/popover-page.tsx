import {
  BellIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  PackageCheckIcon,
  Settings2Icon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

function SimpleContentPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <PackageCheckIcon data-icon="inline-start" />
        Insert popover
      </PopoverTrigger>
      <PopoverContent align="start" showArrow showCloseButton>
        <PopoverHeader>
          <PopoverTitle>Insert Popover</PopoverTitle>
          <PopoverDescription>
            Insert popover description here. It would look much better as three lines of text.
          </PopoverDescription>
        </PopoverHeader>
        <div className="medusa-popover-footer">
          <span className="medusa-popover-step">Step 1 of 5</span>
          <Button type="button" className="medusa-popover-button-muted">
            Back
          </Button>
          <Button type="button" className="medusa-popover-button-next">
            Next
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SettingsActionPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>
        <Settings2Icon data-icon="inline-start" />
        Table controls
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80" showArrow showCloseButton>
        <PopoverHeader>
          <PopoverTitle>Order table</PopoverTitle>
          <PopoverDescription>
            Adjust the columns and alerts for this saved view.
          </PopoverDescription>
        </PopoverHeader>
        <FieldGroup className="medusa-popover-body gap-3 text-white">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="popover-show-fulfillment">Fulfillment column</FieldLabel>
            <Switch id="popover-show-fulfillment" defaultChecked />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="popover-show-margin">Margin column</FieldLabel>
            <Switch id="popover-show-margin" />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="popover-low-stock-alerts">Low stock alerts</FieldLabel>
            <Switch id="popover-low-stock-alerts" defaultChecked />
          </Field>
        </FieldGroup>
        <Separator className="bg-white/10" />
        <div className="medusa-popover-body grid gap-1 pt-3">
          <Button variant="ghost" className="justify-start text-white hover:bg-white/10">
            <ClipboardListIcon data-icon="inline-start" />
            Export current view
            <ChevronRightIcon data-icon="inline-end" className="ml-auto" />
          </Button>
          <Button variant="ghost" className="justify-start text-white hover:bg-white/10">
            <BellIcon data-icon="inline-start" />
            Manage notifications
            <ChevronRightIcon data-icon="inline-end" className="ml-auto" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FormPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button />}>Add internal note</PopoverTrigger>
      <PopoverContent align="start" className="w-96" showArrow showCloseButton>
        <PopoverHeader>
          <PopoverTitle>Internal note</PopoverTitle>
          <PopoverDescription>Add context for the fulfillment team.</PopoverDescription>
        </PopoverHeader>
        <FieldGroup className="medusa-popover-body gap-4">
          <Field>
            <FieldLabel htmlFor="popover-note-title">Title</FieldLabel>
            <Input id="popover-note-title" placeholder="Restock exception" />
          </Field>
          <Field>
            <FieldLabel htmlFor="popover-note-body">Message</FieldLabel>
            <Textarea
              id="popover-note-body"
              rows={4}
              placeholder="Share supplier notes, customer context, or packing instructions."
            />
            <FieldDescription>Visible to staff with order management access.</FieldDescription>
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" className="medusa-popover-button-muted">
              Cancel
            </Button>
            <Button type="button" className="medusa-popover-button-next">
              Save note
            </Button>
          </div>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

function PopoverPage() {
  return (
    <ComponentPageShell title="Popover">
      <ComponentDemoBand label="CONTENT" className="mt-8 flex flex-wrap items-center gap-6">
        <SimpleContentPopover />
      </ComponentDemoBand>

      <ComponentDemoBand
        label="SETTINGS AND ACTIONS"
        className="mt-8 flex flex-wrap items-center gap-6"
      >
        <SettingsActionPopover />
      </ComponentDemoBand>

      <ComponentDemoBand label="FORM" className="mt-8 flex flex-wrap items-center gap-6">
        <FormPopover />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { PopoverPage };
