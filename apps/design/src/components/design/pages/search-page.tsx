"use client";

import { useState } from "react";
import {
  BoxesIcon,
  CogIcon,
  PackagePlusIcon,
  SearchIcon,
  ShoppingCartIcon,
  SparklesIcon,
  TagIcon,
  XIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const searchSections = [
  {
    heading: "Commands",
    items: [
      {
        detail: "Ask anything",
        icon: SparklesIcon,
        label: "Ask Bloom",
        shortcuts: ["⇧", "A"],
        value: "ask bloom",
      },
      {
        detail: "Modal",
        icon: PackagePlusIcon,
        label: "Create product",
        shortcuts: ["C", "P"],
        value: "create product",
      },
    ],
  },
  {
    heading: "Jump to",
    items: [
      {
        detail: "Overview",
        icon: ShoppingCartIcon,
        label: "Orders",
        shortcuts: ["G", "O"],
        value: "orders",
      },
      {
        detail: "Overview",
        icon: TagIcon,
        label: "Products",
        shortcuts: ["G", "P"],
        value: "products",
      },
    ],
  },
  {
    heading: "Settings",
    items: [
      {
        detail: "Settings",
        icon: CogIcon,
        label: "Return Reasons",
        shortcuts: ["G", "R"],
        value: "return reasons",
      },
      {
        detail: "Settings",
        icon: BoxesIcon,
        label: "Sales Channels",
        shortcuts: ["G", "S"],
        value: "sales channels",
      },
    ],
  },
] as const;

function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchValue, setSearchValue] = useState("ORD-1058");

  return (
    <ComponentPageShell title="Search">
      <ComponentDemoBand label="SEARCH MODAL" className="mt-8 w-full">
        <SearchCommandModal query={query} onQueryChange={setQuery} />
      </ComponentDemoBand>

      <ComponentDemoBand label="SEARCH INPUTS" className="mt-8 flex flex-wrap items-start gap-6">
        <SearchField label="Squared field" />
        <SearchField label="Rounded field" radius="rounded" />
        <SearchField label="Component tone" tone="component" value="Orders" filled />
        <SearchField
          label="Small rounded"
          radius="rounded"
          size="small"
          value={searchValue}
          onValueChange={setSearchValue}
          filled
        />
        <SearchField label="Disabled" disabled />
        <SearchField label="Invalid" invalid value="Unknown SKU" filled />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function SearchCommandModal({
  onQueryChange,
  query,
}: {
  onQueryChange: (value: string) => void;
  query: string;
}) {
  return (
    <Command className="h-[480px] w-[640px] max-w-full rounded-xl! p-0 shadow-[var(--shadow-modal)]">
      <CommandInput
        value={query}
        onValueChange={onQueryChange}
        placeholder="Jump to or find something..."
        variant="modal"
      />
      <CommandList className="min-h-0 flex-1 max-h-none p-2">
        <CommandEmpty className="py-10 text-center text-sm text-muted-foreground">
          No results found.
        </CommandEmpty>
        {searchSections.map((section) => (
          <CommandGroup
            key={section.heading}
            heading={section.heading}
            className="p-0 pb-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pt-2 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:text-xs"
          >
            {section.items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                className="h-10 rounded-md px-2 py-0 text-[13px]"
              >
                <item.icon />
                <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                <span className="truncate text-muted-foreground">{item.detail}</span>
                <CommandShortcut className="flex items-center gap-1 tracking-normal">
                  {item.shortcuts.map((shortcut) => (
                    <Kbd key={shortcut}>{shortcut}</Kbd>
                  ))}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-[var(--component)] px-4 py-3 text-xs font-medium text-muted-foreground">
        <span className="mr-auto inline-flex items-center gap-2">
          Navigate
          <KbdGroup>
            <Kbd background="component">↓</Kbd>
            <Kbd background="component">↑</Kbd>
          </KbdGroup>
        </span>
        <span className="inline-flex items-center gap-2">
          Open result
          <Kbd background="component">↵</Kbd>
        </span>
        <span className="h-3 w-px bg-border" aria-hidden="true" />
        <span className="inline-flex items-center gap-2">
          Close
          <Kbd background="component">esc</Kbd>
        </span>
      </div>
    </Command>
  );
}

function SearchField({
  className,
  disabled,
  filled,
  invalid,
  label,
  onValueChange,
  radius = "squared",
  size = "base",
  tone = "field",
  value,
}: {
  className?: string;
  disabled?: boolean;
  filled?: boolean;
  invalid?: boolean;
  label: string;
  onValueChange?: (value: string) => void;
  radius?: "squared" | "rounded";
  size?: "base" | "small";
  tone?: "field" | "component";
  value?: string;
}) {
  const displayValue = filled ? (value ?? "Input") : "";

  return (
    <InputGroup
      aria-label={label}
      className={["medusa-search-input", className ?? ""].join(" ")}
      radius={radius}
      size={size === "small" ? "sm" : "default"}
      variant={tone === "component" ? "component" : "default"}
    >
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        aria-invalid={invalid ? true : undefined}
        disabled={disabled}
        onChange={(event) => onValueChange?.(event.target.value)}
        placeholder="Search"
        readOnly={!onValueChange}
        value={displayValue}
      />
      {filled ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Clear search"
            disabled={disabled}
            onClick={() => onValueChange?.("")}
            size="icon-xs"
          >
            <XIcon aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
      <InputGroupAddon align="inline-end">
        <Kbd>⌘K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { SearchPage };
