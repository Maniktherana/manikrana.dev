import type * as React from "react";
import { ArrowUpIcon } from "lucide-react";

import { Kbd, KbdGroup } from "@/components/ui/kbd";

const kbdPreviewTitles: Record<string, string> = {
  "kbd-demo": "Kbd",
  "kbd-background": "Kbd Background",
  "kbd-group": "Kbd Group",
  "kbd-icon": "Kbd Icon",
};

function KbdDemo() {
  return (
    <KbdGroup>
      <Kbd>Cmd</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  );
}

function KbdBackground() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Kbd background="field">Esc</Kbd>
      <Kbd background="component">Tab</Kbd>
      <Kbd background="contrast">Enter</Kbd>
    </div>
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

const kbdPreviews: Record<string, React.ComponentType> = {
  "kbd-demo": KbdDemo,
  "kbd-background": KbdBackground,
  "kbd-group": KbdGroupDemo,
  "kbd-icon": KbdIcon,
};

function renderKbdPreview(name: string) {
  const Preview = kbdPreviews[name];

  return Preview ? <Preview /> : null;
}

export { kbdPreviewTitles, renderKbdPreview };
