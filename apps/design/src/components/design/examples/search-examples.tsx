import type * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

const searchPreviewTitles: Record<string, string> = {
  "search-demo": "Input Group",
  "search-small": "Input Group Small",
  "search-rounded": "Input Group Rounded",
  "search-state": "Input Group State",
};

function SearchDemo() {
  return (
    <InputGroup
      variant="component"
      className="w-[280px] gap-2 px-2 *:data-[slot=input-group-addon]:px-0 *:data-[slot=input-group-control]:px-0"
    >
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search products" />
      <InputGroupAddon align="inline-end">
        <Kbd className="h-[17px] min-w-0 px-1">
          ⌘K
        </Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}

function SearchSmall() {
  return (
    <InputGroup
      size="sm"
      variant="component"
      className="w-[240px] gap-2 px-2 *:data-[slot=input-group-addon]:px-0 *:data-[slot=input-group-control]:px-0"
    >
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search" />
    </InputGroup>
  );
}

function SearchRounded() {
  return (
    <InputGroup
      radius="rounded"
      variant="component"
      className="w-[280px] gap-2 px-2 *:data-[slot=input-group-addon]:px-0 *:data-[slot=input-group-control]:px-0"
    >
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search customers" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Clear search">
          <XIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

function SearchState() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <InputGroup
        variant="muted"
        className="gap-2 px-2 *:data-[slot=input-group-addon]:px-0 *:data-[slot=input-group-control]:px-0"
      >
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Muted search" />
      </InputGroup>
      <InputGroup
        className="gap-2 px-2 *:data-[slot=input-group-addon]:px-0 *:data-[slot=input-group-control]:px-0"
      >
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput aria-invalid placeholder="Invalid search" />
      </InputGroup>
      <InputGroup
        data-disabled
        className="gap-2 px-2 *:data-[slot=input-group-addon]:px-0 *:data-[slot=input-group-control]:px-0"
      >
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput disabled placeholder="Disabled search" />
        <InputGroupAddon align="inline-end">
          <Button disabled variant="ghost" size="icon-xs" aria-label="Disabled clear">
            <XIcon />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

const searchPreviews: Record<string, React.ComponentType> = {
  "search-demo": SearchDemo,
  "search-small": SearchSmall,
  "search-rounded": SearchRounded,
  "search-state": SearchState,
};

function renderSearchPreview(name: string) {
  const Preview = searchPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderSearchPreview, searchPreviewTitles };
