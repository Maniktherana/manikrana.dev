import type * as React from "react";
import { ArchiveIcon, DownloadIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";

import { CommandBar, CommandBarAction } from "@/components/ui/command";

const commandbarPreviewTitles: Record<string, string> = {
  "commandbar-demo": "Commandbar",
  "commandbar-edge": "Commandbar Edge",
  "commandbar-icons": "Commandbar Icons",
};

function CommandbarDemo() {
  return (
    <CommandBar selectedLabel="3 selected">
      <CommandBarAction shortcuts={["⌘", "A"]}>Archive</CommandBarAction>
      <CommandBarAction shortcuts={["⌘", "E"]}>Export</CommandBarAction>
    </CommandBar>
  );
}

function CommandbarEdge() {
  return (
    <CommandBar selectedLabel="1 selected">
      <CommandBarAction shortcuts={["⌘", "D"]}>Duplicate</CommandBarAction>
      <CommandBarAction shortcuts={["⌫"]} edge>
        Delete
      </CommandBarAction>
    </CommandBar>
  );
}

function CommandbarIcons() {
  return (
    <CommandBar selectedLabel="4 selected">
      <CommandBarAction shortcuts={["A"]}>
        <ArchiveIcon aria-hidden="true" />
        Archive
      </CommandBarAction>
      <CommandBarAction shortcuts={["E"]}>
        <DownloadIcon aria-hidden="true" />
        Export
      </CommandBarAction>
      <CommandBarAction shortcuts={["⌫"]}>
        <Trash2Icon aria-hidden="true" />
        Delete
      </CommandBarAction>
      <CommandBarAction aria-label="More actions" shortcuts={[]} edge>
        <MoreHorizontalIcon aria-hidden="true" />
      </CommandBarAction>
    </CommandBar>
  );
}

const commandbarPreviews: Record<string, React.ComponentType> = {
  "commandbar-demo": CommandbarDemo,
  "commandbar-edge": CommandbarEdge,
  "commandbar-icons": CommandbarIcons,
};

function renderCommandbarPreview(name: string) {
  const Preview = commandbarPreviews[name];

  return Preview ? <Preview /> : null;
}

export { commandbarPreviewTitles, renderCommandbarPreview };
