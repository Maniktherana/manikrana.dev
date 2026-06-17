import type { ComponentType } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const radioGroupPreviewTitles: Record<string, string> = {
  "radio-group-demo": "Radio Group Demo",
  "radio-group-description": "Radio Group Description",
  "radio-group-choice-card": "Radio Group Choice Card",
  "radio-group-fieldset": "Radio Group Fieldset",
  "radio-group-disabled": "Radio Group Disabled",
  "radio-group-invalid": "Radio Group Invalid",
};

function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable" className="max-w-sm">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="default" id="radio-demo-default" />
        <Label htmlFor="radio-demo-default">Default</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="comfortable" id="radio-demo-comfortable" />
        <Label htmlFor="radio-demo-comfortable">Comfortable</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="compact" id="radio-demo-compact" />
        <Label htmlFor="radio-demo-compact">Compact</Label>
      </div>
    </RadioGroup>
  );
}

function RadioGroupDescription() {
  return (
    <RadioGroup defaultValue="yearly" className="max-w-md">
      <Field orientation="horizontal">
        <RadioGroupItem value="monthly" id="radio-desc-monthly" />
        <FieldContent>
          <FieldLabel htmlFor="radio-desc-monthly">Monthly</FieldLabel>
          <FieldDescription>$9.99 billed every month.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="yearly" id="radio-desc-yearly" />
        <FieldContent>
          <FieldLabel htmlFor="radio-desc-yearly">Yearly</FieldLabel>
          <FieldDescription>$99.99 billed once a year. Save 16%.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <RadioGroupItem value="lifetime" id="radio-desc-lifetime" />
        <FieldContent>
          <FieldLabel htmlFor="radio-desc-lifetime">Lifetime</FieldLabel>
          <FieldDescription>$299.99 paid once. Yours forever.</FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
  );
}

function RadioGroupChoiceCard() {
  return (
    <RadioGroup defaultValue="standard" className="max-w-md">
      <FieldLabel htmlFor="radio-card-standard">
        <Field orientation="horizontal">
          <RadioGroupItem value="standard" id="radio-card-standard" />
          <FieldContent>
            <FieldLabel htmlFor="radio-card-standard">Standard</FieldLabel>
            <FieldDescription>Delivery in 3-5 business days.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="radio-card-priority">
        <Field orientation="horizontal">
          <RadioGroupItem value="priority" id="radio-card-priority" />
          <FieldContent>
            <FieldLabel htmlFor="radio-card-priority">Priority</FieldLabel>
            <FieldDescription>Delivery in 1-2 business days.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </RadioGroup>
  );
}

function RadioGroupFieldset() {
  return (
    <FieldSet className="max-w-md">
      <FieldLegend>Notifications</FieldLegend>
      <FieldDescription>Choose how you want to be notified.</FieldDescription>
      <RadioGroup defaultValue="all">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="all" id="radio-set-all" />
          <Label htmlFor="radio-set-all">All activity</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="mentions" id="radio-set-mentions" />
          <Label htmlFor="radio-set-mentions">Mentions only</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="none" id="radio-set-none" />
          <Label htmlFor="radio-set-none">Nothing</Label>
        </div>
      </RadioGroup>
    </FieldSet>
  );
}

function RadioGroupDisabled() {
  return (
    <RadioGroup defaultValue="card" disabled className="max-w-sm">
      <div className="flex items-center gap-3">
        <RadioGroupItem value="card" id="radio-disabled-card" />
        <Label htmlFor="radio-disabled-card">Credit card</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="paypal" id="radio-disabled-paypal" />
        <Label htmlFor="radio-disabled-paypal">PayPal</Label>
      </div>
    </RadioGroup>
  );
}

function RadioGroupInvalid() {
  return (
    <Field data-invalid className="max-w-md">
      <FieldSet>
        <FieldLegend>Shipping speed</FieldLegend>
        <RadioGroup>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="standard" id="radio-invalid-standard" aria-invalid />
            <Label htmlFor="radio-invalid-standard">Standard</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="express" id="radio-invalid-express" aria-invalid />
            <Label htmlFor="radio-invalid-express">Express</Label>
          </div>
        </RadioGroup>
      </FieldSet>
      <FieldError>Select a shipping speed to continue.</FieldError>
    </Field>
  );
}

const radioGroupPreviews: Record<string, ComponentType> = {
  "radio-group-demo": RadioGroupDemo,
  "radio-group-description": RadioGroupDescription,
  "radio-group-choice-card": RadioGroupChoiceCard,
  "radio-group-fieldset": RadioGroupFieldset,
  "radio-group-disabled": RadioGroupDisabled,
  "radio-group-invalid": RadioGroupInvalid,
};

function renderRadioGroupPreview(name: string) {
  const Preview = radioGroupPreviews[name];

  return Preview ? <Preview /> : null;
}

export { radioGroupPreviewTitles, renderRadioGroupPreview };
