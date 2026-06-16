import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const paymentCadences = [
  {
    id: "radio-cadence-daily",
    value: "daily",
    label: "Daily",
    description: "Release captured payouts every business day.",
  },
  {
    id: "radio-cadence-weekly",
    value: "weekly",
    label: "Weekly",
    description: "Batch payouts each Friday after reconciliation.",
  },
  {
    id: "radio-cadence-monthly",
    value: "monthly",
    label: "Monthly",
    description: "Hold funds until the monthly finance close.",
  },
] as const;

const shippingSpeeds = [
  {
    id: "radio-speed-standard",
    value: "standard",
    label: "Standard",
    description: "Pack with the regular fulfillment queue.",
    disabled: false,
  },
  {
    id: "radio-speed-priority",
    value: "priority",
    label: "Priority",
    description: "Move orders to the next available packing wave.",
    disabled: false,
  },
  {
    id: "radio-speed-same-day",
    value: "same-day",
    label: "Same day",
    description: "Requires an active local courier connection.",
    disabled: true,
  },
] as const;

function RadioPage() {
  return (
    <ComponentPageShell title="Radio">
      <ComponentDemoBand label="STANDALONE" className="mt-8 flex flex-wrap items-center gap-6">
        <RadioGroup
          defaultValue="checked"
          aria-label="Standalone radio states"
          className="flex w-fit gap-6"
        >
          <RadioGroupItem aria-label="Unchecked radio" value="unchecked" />
          <RadioGroupItem aria-label="Checked radio" value="checked" />
          <RadioGroupItem aria-label="Disabled radio" value="disabled" disabled />
        </RadioGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="BASE BACKGROUND" className="mt-8 flex flex-wrap items-center gap-6">
        <RadioGroup
          defaultValue="checked"
          aria-label="Base radio states"
          className="flex w-fit gap-6"
        >
          <RadioGroupItem
            aria-label="Base unchecked radio"
            className="medusa-radio-base"
            value="unchecked"
          />
          <RadioGroupItem
            aria-label="Base checked radio"
            className="medusa-radio-base"
            value="checked"
          />
        </RadioGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="BASIC GROUP" className="mt-8">
        <FieldSet className="max-w-sm">
          <FieldLegend>Default sales channel</FieldLegend>
          <RadioGroup defaultValue="web" aria-label="Default sales channel">
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-channel-web" value="web" />
              <Label htmlFor="radio-channel-web">Web store</Label>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-channel-marketplace" value="marketplace" />
              <Label htmlFor="radio-channel-marketplace">Marketplace</Label>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-channel-retail" value="retail" />
              <Label htmlFor="radio-channel-retail">Retail POS</Label>
            </Field>
          </RadioGroup>
        </FieldSet>
      </ComponentDemoBand>

      <ComponentDemoBand label="WITH DESCRIPTIONS" className="mt-8">
        <FieldSet className="max-w-md">
          <div>
            <FieldLegend>Payout cadence</FieldLegend>
            <FieldDescription>Choose when captured funds should be released.</FieldDescription>
          </div>

          <RadioGroup defaultValue="weekly" aria-label="Payout cadence">
            {paymentCadences.map((cadence) => (
              <Field key={cadence.value} orientation="horizontal">
                <RadioGroupItem id={cadence.id} value={cadence.value} />
                <FieldContent>
                  <Label htmlFor={cadence.id}>{cadence.label}</Label>
                  <FieldDescription>{cadence.description}</FieldDescription>
                </FieldContent>
              </Field>
            ))}
          </RadioGroup>
        </FieldSet>
      </ComponentDemoBand>

      <ComponentDemoBand label="RADIO LABEL" className="mt-8 flex flex-wrap gap-6">
        <RadioGroup
          defaultValue="checked-card"
          aria-label="Radio label cards"
          className="flex flex-wrap gap-6"
        >
          <Field orientation="horizontal" className="medusa-option-card">
            <RadioGroupItem id="radio-label-bare" value="bare" />
            <FieldContent>
              <Label htmlFor="radio-label-bare">Label</Label>
              <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
            </FieldContent>
          </Field>

          <Field orientation="horizontal" className="medusa-option-card" data-border="true">
            <RadioGroupItem id="radio-label-border" value="border" />
            <FieldContent>
              <Label htmlFor="radio-label-border">Label</Label>
              <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
            </FieldContent>
          </Field>

          <Field
            orientation="horizontal"
            className="medusa-option-card"
            data-border="true"
            data-hover="true"
          >
            <RadioGroupItem id="radio-label-checked" value="checked-card" />
            <FieldContent>
              <Label htmlFor="radio-label-checked">Checked label</Label>
              <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
            </FieldContent>
          </Field>

          <Field
            orientation="horizontal"
            className="medusa-option-card"
            data-border="true"
            data-disabled="true"
          >
            <RadioGroupItem id="radio-label-disabled" value="disabled" disabled />
            <FieldContent>
              <Label htmlFor="radio-label-disabled">Disabled label</Label>
              <FieldDescription>The quick brown fox jumps over a lazy dog.</FieldDescription>
            </FieldContent>
          </Field>
        </RadioGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="DISABLED OPTION" className="mt-8">
        <FieldSet className="max-w-md">
          <div>
            <FieldLegend>Shipping speed</FieldLegend>
            <FieldDescription>
              Unavailable options stay visible but cannot be selected.
            </FieldDescription>
          </div>

          <RadioGroup defaultValue="standard" aria-label="Shipping speed">
            {shippingSpeeds.map((speed) => (
              <Field
                key={speed.value}
                orientation="horizontal"
                data-disabled={speed.disabled ? true : undefined}
              >
                <RadioGroupItem id={speed.id} value={speed.value} disabled={speed.disabled} />
                <FieldContent>
                  <Label htmlFor={speed.id}>{speed.label}</Label>
                  <FieldDescription>{speed.description}</FieldDescription>
                </FieldContent>
              </Field>
            ))}
          </RadioGroup>
        </FieldSet>
      </ComponentDemoBand>

      <ComponentDemoBand label="REQUIRED AND INVALID" className="mt-8">
        <FieldSet className="max-w-md" aria-describedby="radio-region-error">
          <div>
            <FieldLegend>Settlement region</FieldLegend>
            <FieldDescription>Select a region before enabling payouts.</FieldDescription>
          </div>

          <FieldGroup>
            <Field data-invalid>
              <RadioGroup required aria-invalid aria-label="Settlement region">
                <Field orientation="horizontal">
                  <RadioGroupItem id="radio-region-us" value="us" />
                  <Label htmlFor="radio-region-us">United States</Label>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem id="radio-region-eu" value="eu" />
                  <Label htmlFor="radio-region-eu">European Union</Label>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem id="radio-region-in" value="in" />
                  <Label htmlFor="radio-region-in">India</Label>
                </Field>
              </RadioGroup>
              <FieldError id="radio-region-error">
                Choose a settlement region to continue.
              </FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { RadioPage };
