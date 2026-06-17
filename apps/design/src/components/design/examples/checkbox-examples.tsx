import type { ComponentType } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

const checkboxPreviewTitles: Record<string, string> = {
  "checkbox-demo": "Checkbox Demo",
  "checkbox-description": "Checkbox Description",
  "checkbox-group": "Checkbox Group",
  "checkbox-choice-card": "Checkbox Choice Card",
  "checkbox-indeterminate": "Checkbox Indeterminate",
  "checkbox-disabled": "Checkbox Disabled",
  "checkbox-invalid": "Checkbox Invalid",
};

function CheckboxDemo() {
  return (
    <Field orientation="horizontal" className="max-w-sm">
      <Checkbox id="checkbox-demo-terms" defaultChecked />
      <FieldLabel htmlFor="checkbox-demo-terms">Accept terms and conditions</FieldLabel>
    </Field>
  );
}

function CheckboxDescription() {
  return (
    <Field orientation="horizontal" className="max-w-md">
      <Checkbox id="checkbox-desc-newsletter" defaultChecked />
      <FieldContent>
        <FieldLabel htmlFor="checkbox-desc-newsletter">Subscribe to the newsletter</FieldLabel>
        <FieldDescription>Get product updates and release notes once a month.</FieldDescription>
      </FieldContent>
    </Field>
  );
}

function CheckboxGroup() {
  return (
    <FieldSet className="max-w-md">
      <FieldLegend>Email notifications</FieldLegend>
      <FieldDescription>Choose what you want to hear about.</FieldDescription>
      <Field orientation="horizontal">
        <Checkbox id="checkbox-group-orders" defaultChecked />
        <FieldLabel htmlFor="checkbox-group-orders">Order updates</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="checkbox-group-marketing" />
        <FieldLabel htmlFor="checkbox-group-marketing">Marketing emails</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="checkbox-group-security" defaultChecked />
        <FieldLabel htmlFor="checkbox-group-security">Security alerts</FieldLabel>
      </Field>
    </FieldSet>
  );
}

function CheckboxChoiceCard() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FieldLabel htmlFor="checkbox-card-standard">
        <Field orientation="horizontal">
          <Checkbox id="checkbox-card-standard" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-card-standard">Standard delivery</FieldLabel>
            <FieldDescription>Arrives in 3-5 business days. Free of charge.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="checkbox-card-priority">
        <Field orientation="horizontal">
          <Checkbox id="checkbox-card-priority" />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-card-priority">Priority delivery</FieldLabel>
            <FieldDescription>Arrives in 1-2 business days. $12.00.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
  );
}

function CheckboxIndeterminate() {
  return (
    <Field orientation="horizontal" className="max-w-sm">
      <Checkbox id="checkbox-indeterminate-all" indeterminate />
      <FieldLabel htmlFor="checkbox-indeterminate-all">Select all items</FieldLabel>
    </Field>
  );
}

function CheckboxDisabled() {
  return (
    <div className="flex flex-col gap-3">
      <Field orientation="horizontal" data-disabled>
        <Checkbox id="checkbox-disabled-on" defaultChecked disabled />
        <FieldLabel htmlFor="checkbox-disabled-on">Checked and disabled</FieldLabel>
      </Field>
      <Field orientation="horizontal" data-disabled>
        <Checkbox id="checkbox-disabled-off" disabled />
        <FieldLabel htmlFor="checkbox-disabled-off">Unchecked and disabled</FieldLabel>
      </Field>
    </div>
  );
}

function CheckboxInvalid() {
  return (
    <Field orientation="horizontal" data-invalid className="max-w-md">
      <Checkbox id="checkbox-invalid-terms" aria-invalid />
      <FieldContent>
        <FieldLabel htmlFor="checkbox-invalid-terms">Accept terms and conditions</FieldLabel>
        <FieldError>You must accept before continuing.</FieldError>
      </FieldContent>
    </Field>
  );
}

const checkboxPreviews: Record<string, ComponentType> = {
  "checkbox-demo": CheckboxDemo,
  "checkbox-description": CheckboxDescription,
  "checkbox-group": CheckboxGroup,
  "checkbox-choice-card": CheckboxChoiceCard,
  "checkbox-indeterminate": CheckboxIndeterminate,
  "checkbox-disabled": CheckboxDisabled,
  "checkbox-invalid": CheckboxInvalid,
};

function renderCheckboxPreview(name: string) {
  const Preview = checkboxPreviews[name];

  return Preview ? <Preview /> : null;
}

export { checkboxPreviewTitles, renderCheckboxPreview };
