import { useState, type ComponentType } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  useComboboxAnchor,
} from "@/components/ui/combobox";

const regions = [
  { value: "us", label: "United States" },
  { value: "in", label: "India" },
  { value: "eu", label: "European Union" },
  { value: "au", label: "Australia" },
];

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "scheduled", label: "Scheduled" },
  { value: "failed", label: "Failed" },
];

const comboboxPreviewTitles: Record<string, string> = {
  combobox: "Combobox",
  "combobox-demo": "Combobox Demo",
  "combobox-width": "Combobox Width",
  "combobox-group": "Combobox Group",
  "combobox-multiple": "Combobox Multiple",
  "combobox-empty": "Combobox Empty",
};

function ComboboxDemo() {
  return (
    <Combobox items={regions} defaultValue={regions[0]}>
      <ComboboxInput placeholder="Search region..." />
      <ComboboxContent>
        <ComboboxEmpty>No regions found.</ComboboxEmpty>
        <ComboboxList>
          {(region: (typeof regions)[number]) => (
            <ComboboxItem key={region.value} value={region}>
              {region.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function ComboboxWidth() {
  return (
    <Combobox items={regions} defaultValue={regions[0]}>
      <ComboboxInput className="w-40" placeholder="Search region..." />
      <ComboboxContent>
        <ComboboxEmpty>No regions found.</ComboboxEmpty>
        <ComboboxList>
          {(region: (typeof regions)[number]) => (
            <ComboboxItem key={region.value} value={region}>
              {region.label === "European Union" ? "European Union commerce region" : region.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function ComboboxGroupDemo() {
  return (
    <Combobox items={statuses} defaultValue={statuses[0]}>
      <ComboboxInput placeholder="Search status..." />
      <ComboboxContent>
        <ComboboxEmpty>No statuses found.</ComboboxEmpty>
        <ComboboxGroup>
          <ComboboxLabel>Publishing</ComboboxLabel>
          <ComboboxList>
            {(status: (typeof statuses)[number]) => (
              <ComboboxItem key={status.value} value={status}>
                {status.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxGroup>
        <ComboboxSeparator />
      </ComboboxContent>
    </Combobox>
  );
}

function ComboboxMultiple() {
  const anchor = useComboboxAnchor();
  const [value, setValue] = useState<(typeof statuses)[number][]>([statuses[0], statuses[1]]);

  return (
    <Combobox
      multiple
      items={statuses}
      value={value}
      onValueChange={setValue}
      isItemEqualToValue={(item, selectedItem) => item.value === selectedItem.value}
    >
      <ComboboxChips ref={anchor}>
        {value.map((status) => (
          <ComboboxChip key={status.value}>{status.label}</ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder={value.length ? "" : "Search status..."} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No statuses found.</ComboboxEmpty>
        <ComboboxList>
          {(status: (typeof statuses)[number]) => (
            <ComboboxItem key={status.value} value={status}>
              {status.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function ComboboxEmptyDemo() {
  return (
    <Combobox items={[]} defaultInputValue="unmatched">
      <ComboboxInput placeholder="Search status..." />
      <ComboboxContent>
        <ComboboxEmpty>No statuses found.</ComboboxEmpty>
        <ComboboxList />
      </ComboboxContent>
    </Combobox>
  );
}

const comboboxPreviews: Record<string, ComponentType> = {
  combobox: ComboboxDemo,
  "combobox-demo": ComboboxDemo,
  "combobox-width": ComboboxWidth,
  "combobox-group": ComboboxGroupDemo,
  "combobox-multiple": ComboboxMultiple,
  "combobox-empty": ComboboxEmptyDemo,
};

function renderComboboxPreview(name: string) {
  const Preview = comboboxPreviews[name];

  return Preview ? <Preview /> : null;
}

export { comboboxPreviewTitles, renderComboboxPreview };
