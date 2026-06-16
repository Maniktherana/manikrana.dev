import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { CircleHelpIcon } from "lucide-react";

const fulfillmentTasks = [
  {
    id: "reserve-stock",
    label: "Reserve stock",
    description: "Hold inventory while the order is being packed.",
    defaultChecked: true,
  },
  {
    id: "print-label",
    label: "Print shipping label",
    description: "Create a carrier label after the package is weighed.",
    defaultChecked: true,
  },
  {
    id: "notify-customer",
    label: "Notify customer",
    description: "Send tracking details when fulfillment is marked complete.",
    defaultChecked: false,
  },
] as const;

function CheckboxPage() {
  return (
    <ComponentPageShell title="Checkbox">
      <ComponentDemoBand label="STANDALONE" className="mt-8 flex flex-wrap items-center gap-6">
        <Checkbox aria-label="Select row" />
        <Checkbox aria-label="Selected row" defaultChecked />
        <Checkbox aria-label="Partially selected row" indeterminate />
        <Checkbox aria-label="Disabled row" disabled />
        <Checkbox aria-label="Disabled selected row" disabled defaultChecked />
      </ComponentDemoBand>

      <ComponentDemoBand label="BASE BACKGROUND" className="mt-8 flex flex-wrap items-center gap-6">
        <Checkbox aria-label="Base row" className="medusa-checkbox-base" />
        <Checkbox aria-label="Base selected row" className="medusa-checkbox-base" defaultChecked />
        <Checkbox aria-label="Base partial row" className="medusa-checkbox-base" indeterminate />
      </ComponentDemoBand>

      <ComponentDemoBand label="FIELD TEXT" className="mt-8 flex flex-col gap-5">
        <Field orientation="horizontal" className="max-w-sm">
          <Checkbox id="publish-channels" defaultChecked />
          <FieldContent>
            <Label htmlFor="publish-channels">Publish to all channels</Label>
            <FieldDescription>Keep storefronts in sync after saving.</FieldDescription>
          </FieldContent>
        </Field>

        <Field orientation="horizontal" className="max-w-sm">
          <Checkbox id="sync-prices" />
          <FieldContent>
            <Label htmlFor="sync-prices">Sync catalog prices</Label>
            <FieldDescription>Update channel prices from the primary region.</FieldDescription>
          </FieldContent>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="CHECKBOX LABEL" className="mt-8 flex flex-wrap gap-6">
        <Label htmlFor="checkbox-label-bare" className="medusa-option-card">
          <Checkbox id="checkbox-label-bare" className="pointer-events-none" />
          <FieldContent>
            <FieldTitle>
              Label
              <span className="font-normal text-muted-foreground">(Optional)</span>
              <CircleHelpIcon className="size-[15px] text-muted-foreground" />
            </FieldTitle>
            <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
          </FieldContent>
        </Label>

        <Label htmlFor="checkbox-label-border" className="medusa-option-card" data-border="true">
          <Checkbox id="checkbox-label-border" className="pointer-events-none" />
          <FieldContent>
            <FieldTitle>
              Label
              <span className="font-normal text-muted-foreground">(Optional)</span>
              <CircleHelpIcon className="size-[15px] text-muted-foreground" />
            </FieldTitle>
            <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
          </FieldContent>
        </Label>

        <Label
          htmlFor="checkbox-label-hover"
          className="medusa-option-card"
          data-border="true"
          data-hover="true"
        >
          <Checkbox id="checkbox-label-hover" className="pointer-events-none" defaultChecked />
          <FieldContent>
            <FieldTitle>Checked label</FieldTitle>
            <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
          </FieldContent>
        </Label>

        <Label
          htmlFor="checkbox-label-disabled"
          className="medusa-option-card"
          data-border="true"
          data-disabled="true"
        >
          <Checkbox id="checkbox-label-disabled" className="pointer-events-none" disabled />
          <FieldContent>
            <FieldTitle>Disabled label</FieldTitle>
            <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
          </FieldContent>
        </Label>
      </ComponentDemoBand>

      <ComponentDemoBand label="DISABLED" className="mt-8 flex flex-col gap-5">
        <Field orientation="horizontal" data-disabled className="max-w-sm">
          <Checkbox id="locked-setting" disabled defaultChecked />
          <FieldContent>
            <Label htmlFor="locked-setting">Protected setting</Label>
            <FieldDescription>This option is managed by an admin policy.</FieldDescription>
          </FieldContent>
        </Field>

        <Field orientation="horizontal" data-disabled className="max-w-sm">
          <Checkbox id="disabled-empty" disabled />
          <FieldContent>
            <Label htmlFor="disabled-empty">Unavailable workflow</Label>
            <FieldDescription>Connect a warehouse before enabling this task.</FieldDescription>
          </FieldContent>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="INVALID" className="mt-8 flex flex-col gap-5">
        <Field orientation="horizontal" data-invalid className="max-w-sm">
          <Checkbox id="terms-required" aria-invalid />
          <FieldContent>
            <Label htmlFor="terms-required">Accept payout terms</Label>
            <FieldDescription>Required before payouts can be enabled.</FieldDescription>
            <FieldError>You must accept the payout terms to continue.</FieldError>
          </FieldContent>
        </Field>
      </ComponentDemoBand>

      <ComponentDemoBand label="GROUPED CHECKLIST" className="mt-8">
        <FieldSet className="max-w-md">
          <div>
            <FieldLegend>Fulfillment workflow</FieldLegend>
            <FieldDescription>
              Choose the tasks that should run for each packed order.
            </FieldDescription>
          </div>

          <FieldGroup data-slot="checkbox-group">
            {fulfillmentTasks.map((task) => (
              <Field key={task.id} orientation="horizontal">
                <Checkbox id={task.id} defaultChecked={task.defaultChecked} />
                <FieldContent>
                  <Label htmlFor={task.id}>{task.label}</Label>
                  <FieldDescription>{task.description}</FieldDescription>
                </FieldContent>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { CheckboxPage };
