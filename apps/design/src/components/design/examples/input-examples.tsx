import { type ComponentType } from "react";
import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const inputPreviewTitles: Record<string, string> = {
  "input-demo": "Input Demo",
  "input-sizes": "Input Sizes",
  "input-radius": "Input Radius",
  "input-disabled": "Input Disabled",
  "input-invalid": "Input Invalid",
  "input-file": "Input File",
  "input-with-label": "Input With Label",
  "input-button-group": "Input Button Group",
  "input-group": "Input Group",
};

function InputDemo() {
  return (
    <div className="w-full max-w-72">
      <Input type="email" placeholder="Email" />
    </div>
  );
}

function InputSizes() {
  return (
    <div className="flex w-full max-w-72 flex-col gap-4">
      <Input controlSize="default" placeholder="Default" />
      <Input controlSize="sm" placeholder="Small" />
    </div>
  );
}

function InputRadius() {
  return (
    <div className="flex w-full max-w-72 flex-col gap-4">
      <Input radius="squared" placeholder="Squared" />
      <Input radius="rounded" placeholder="Rounded" />
    </div>
  );
}

function InputDisabled() {
  return (
    <div className="w-full max-w-72">
      <Input placeholder="Disabled" disabled />
    </div>
  );
}

function InputInvalid() {
  return (
    <div className="w-full max-w-72">
      <Input placeholder="Email" aria-invalid defaultValue="not-an-email" />
    </div>
  );
}

function InputFile() {
  return (
    <div className="w-full max-w-72">
      <Input type="file" />
    </div>
  );
}

function InputWithLabel() {
  return (
    <Field className="w-full max-w-72">
      <FieldLabel htmlFor="input-with-label-email">Email</FieldLabel>
      <Input id="input-with-label-email" type="email" placeholder="you@example.com" />
      <FieldDescription>We will never share your email address.</FieldDescription>
    </Field>
  );
}

function InputButtonGroup() {
  return (
    <ButtonGroup variant="base" className="w-full max-w-72">
      <Input placeholder="Search..." />
      <Button type="button" variant="outline" size="icon" aria-label="Search">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
}

function InputGroupDemo() {
  return (
    <InputGroup className="w-full max-w-72">
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  );
}

const inputPreviews: Record<string, ComponentType> = {
  "input-demo": InputDemo,
  "input-sizes": InputSizes,
  "input-radius": InputRadius,
  "input-disabled": InputDisabled,
  "input-invalid": InputInvalid,
  "input-file": InputFile,
  "input-with-label": InputWithLabel,
  "input-button-group": InputButtonGroup,
  "input-group": InputGroupDemo,
};

function renderInputPreview(name: string) {
  const Preview = inputPreviews[name];

  return Preview ? <Preview /> : null;
}

export { inputPreviewTitles, renderInputPreview };
