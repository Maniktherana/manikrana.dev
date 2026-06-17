import type { ComponentType } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const selectPreviewTitles: Record<string, string> = {
  select: "Select",
  "select-demo": "Select Demo",
  "select-width": "Select Width",
  "select-group": "Select Group",
  "select-size": "Select Size",
};

function SelectDemo() {
  return (
    <Select defaultValue="us">
      <SelectTrigger>
        <SelectValue placeholder="Choose region" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="in">India</SelectItem>
          <SelectItem value="eu">European Union</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SelectWidth() {
  return (
    <Select defaultValue="starter">
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Choose plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="growth">Growth</SelectItem>
          <SelectItem value="enterprise">Enterprise commerce operations platform</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SelectGroupDemo() {
  return (
    <Select defaultValue="draft">
      <SelectTrigger>
        <SelectValue placeholder="Choose status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Publishing</SelectLabel>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Archive</SelectLabel>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SelectSize() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select defaultValue="small">
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="small">Small trigger</SelectItem>
          <SelectItem value="medium">Medium trigger</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="default">
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default trigger</SelectItem>
          <SelectItem value="large">Large trigger</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

const selectPreviews: Record<string, ComponentType> = {
  select: SelectDemo,
  "select-demo": SelectDemo,
  "select-width": SelectWidth,
  "select-group": SelectGroupDemo,
  "select-size": SelectSize,
};

function renderSelectPreview(name: string) {
  const Preview = selectPreviews[name];

  return Preview ? <Preview /> : null;
}

export { selectPreviewTitles, renderSelectPreview };
