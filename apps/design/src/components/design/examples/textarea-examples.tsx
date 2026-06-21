import { type ComponentType } from "react";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

const textareaPreviewTitles: Record<string, string> = {
  "textarea-demo": "Textarea Demo",
  "textarea-with-label": "Textarea With Label",
  "textarea-disabled": "Textarea Disabled",
  "textarea-invalid": "Textarea Invalid",
  "textarea-resize": "Textarea Resize",
};

function TextareaDemo() {
  return (
    <div className="w-full max-w-sm">
      <Textarea placeholder="Write a note..." />
    </div>
  );
}

function TextareaWithLabel() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="textarea-with-label">Description</FieldLabel>
      <Textarea id="textarea-with-label" placeholder="Add a short description..." />
      <FieldDescription>Keep it concise and readable.</FieldDescription>
    </Field>
  );
}

function TextareaDisabled() {
  return (
    <div className="w-full max-w-sm">
      <Textarea placeholder="Disabled" disabled />
    </div>
  );
}

function TextareaInvalid() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="textarea-invalid">Message</FieldLabel>
      <Textarea id="textarea-invalid" aria-invalid defaultValue="Too short" />
      <FieldDescription>This field needs a little more detail.</FieldDescription>
    </Field>
  );
}

function TextareaResize() {
  return (
    <div className="w-full max-w-sm">
      <Textarea className="min-h-28" placeholder="Resize from the lower corner..." />
    </div>
  );
}

const textareaPreviews: Record<string, ComponentType> = {
  "textarea-demo": TextareaDemo,
  "textarea-with-label": TextareaWithLabel,
  "textarea-disabled": TextareaDisabled,
  "textarea-invalid": TextareaInvalid,
  "textarea-resize": TextareaResize,
};

function renderTextareaPreview(name: string) {
  const Preview = textareaPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderTextareaPreview, textareaPreviewTitles };
