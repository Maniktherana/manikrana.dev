import type * as React from "react";
import { ArrowUpIcon, SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const kbdPreviewTitles: Record<string, string> = {
  "kbd-demo": "Kbd",
  "kbd-group": "Kbd Group",
  "kbd-icon": "Kbd Icon",
  "kbd-input-group": "Kbd Input Group",
};

function KbdDemo() {
  return (
    <KbdGroup>
      <Kbd>Cmd</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  );
}

function KbdGroupDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <KbdGroup>
        <Kbd>Cmd</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>C</Kbd>
      </KbdGroup>
    </div>
  );
}

function KbdIcon() {
  return (
    <KbdGroup>
      <Kbd>
        <ArrowUpIcon aria-hidden="true" />
      </Kbd>
      <Kbd>J</Kbd>
    </KbdGroup>
  );
}

function KbdInputGroup() {
  return (
    <InputGroup
      variant="component"
      className="w-full max-w-64 gap-2 px-2 *:data-[slot=input-group-addon]:px-0 *:data-[slot=input-group-control]:px-0"
    >
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search" />
      <InputGroupAddon align="inline-end">
        <Kbd className="h-[17px] min-w-0 px-1">⌘K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}

const kbdPreviews: Record<string, React.ComponentType> = {
  "kbd-demo": KbdDemo,
  "kbd-group": KbdGroupDemo,
  "kbd-icon": KbdIcon,
  "kbd-input-group": KbdInputGroup,
};

function renderKbdPreview(name: string) {
  const Preview = kbdPreviews[name];

  return Preview ? <Preview /> : null;
}

export { kbdPreviewTitles, renderKbdPreview };
