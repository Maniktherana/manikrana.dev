import * as React from "react";
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
    <Field orientation="horizontal" className="w-[min(100%,20rem)]">
      <Checkbox id="checkbox-demo-terms" defaultChecked />
      <FieldLabel htmlFor="checkbox-demo-terms">Accept terms and conditions</FieldLabel>
    </Field>
  );
}

function CheckboxDescription() {
  return (
    <Field orientation="horizontal" className="w-[min(100%,24rem)]">
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
    <FieldSet className="w-[min(100%,24rem)]">
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
    <div className="flex w-[min(100%,24rem)] flex-col gap-3">
      <FieldLabel htmlFor="checkbox-card-release-notes">
        <Field orientation="horizontal">
          <Checkbox id="checkbox-card-release-notes" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-card-release-notes">Release notes</FieldLabel>
            <FieldDescription>Send a concise changelog after every deploy.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
      <FieldLabel htmlFor="checkbox-card-usage-warnings">
        <Field orientation="horizontal">
          <Checkbox id="checkbox-card-usage-warnings" />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-card-usage-warnings">Usage warnings</FieldLabel>
            <FieldDescription>Notify admins before a workspace reaches its limit.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </div>
  );
}

function CheckboxIndeterminate() {
  const [selected, setSelected] = React.useState([true, false]);
  const checkedCount = selected.filter(Boolean).length;
  const allChecked = checkedCount === selected.length;
  const indeterminate = checkedCount > 0 && !allChecked;

  return (
    <FieldSet className="w-[min(100%,20rem)] gap-3">
      <Field orientation="horizontal">
        <Checkbox
          id="checkbox-indeterminate-all"
          checked={allChecked}
          indeterminate={indeterminate}
          onCheckedChange={(checked) => {
            setSelected(selected.map(() => Boolean(checked)));
          }}
        />
        <FieldLabel htmlFor="checkbox-indeterminate-all">Select all items</FieldLabel>
      </Field>
      <div className="flex flex-col gap-2">
        {["Release notes", "Security alerts"].map((label, index) => (
          <Field orientation="horizontal" key={label}>
            <Checkbox
              id={`checkbox-indeterminate-${index}`}
              checked={selected[index]}
              onCheckedChange={(checked) => {
                setSelected((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? Boolean(checked) : value,
                  ),
                );
              }}
            />
            <FieldLabel htmlFor={`checkbox-indeterminate-${index}`}>{label}</FieldLabel>
          </Field>
        ))}
      </div>
    </FieldSet>
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
    <Field orientation="horizontal" data-invalid className="w-[min(100%,24rem)]">
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
