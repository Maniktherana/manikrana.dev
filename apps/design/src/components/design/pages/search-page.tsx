"use client";

import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { CommandBar, CommandBarAction } from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

function SearchPage() {
  const [query, setQuery] = useState("Input");

  return (
    <ComponentPageShell title="Search">
      <ComponentDemoBand label="BASE · SQUARED">
        <SearchField label="Default" />
        <SearchField label="Hover" state="hover" />
        <SearchField label="Focus" state="focus" />
        <SearchField label="Filled" value={query} onValueChange={setQuery} filled />
        <SearchField label="Disabled" disabled />
        <SearchField label="Error" state="error" filled value="Input" />
      </ComponentDemoBand>

      <ComponentDemoBand label="COMPONENT · SQUARED">
        <SearchField label="Default" tone="component" />
        <SearchField label="Hover" tone="component" state="hover" />
        <SearchField label="Focus" tone="component" state="focus" />
        <SearchField label="Filled" tone="component" filled value="Input" />
        <SearchField label="Disabled" tone="component" disabled />
        <SearchField label="Error" tone="component" state="error" filled value="Input" />
      </ComponentDemoBand>

      <ComponentDemoBand label="ROUNDED">
        <SearchField label="Base rounded" radius="rounded" />
        <SearchField label="Base component rounded" tone="component" radius="rounded" />
        <SearchField label="Small rounded" radius="rounded" size="small" />
        <SearchField
          label="Small component rounded"
          tone="component"
          radius="rounded"
          size="small"
        />
      </ComponentDemoBand>

      <ComponentDemoBand label="SMALL · 28PX">
        <SearchField label="Small default" size="small" />
        <SearchField label="Small hover" size="small" state="hover" />
        <SearchField label="Small focus" size="small" state="focus" />
        <SearchField label="Small error" size="small" state="error" filled value="Input" />
      </ComponentDemoBand>

      <ComponentDemoBand label="SEARCH MODAL">
        <div className="medusa-raised flex w-[640px] max-w-full flex-col gap-3 p-4">
          <SearchField
            label="Modal input"
            className="w-full"
            value={query}
            onValueChange={setQuery}
          />
          <div className="flex flex-col gap-1">
            <SearchResult title="Orders" detail="Search orders, fulfillments, and returns" />
            <SearchResult title="Products" detail="Find variants, inventory, and pricing" active />
            <SearchResult title="Customers" detail="Open profiles and account activity" />
          </div>
          <CommandBar>
            <CommandBarAction>
              Open
              <Kbd>Enter</Kbd>
            </CommandBarAction>
            <CommandBarAction>
              Close
              <Kbd>Esc</Kbd>
            </CommandBarAction>
          </CommandBar>
        </div>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

function SearchField({
  className,
  disabled,
  filled,
  label,
  onValueChange,
  radius = "squared",
  size = "base",
  state,
  tone = "field",
  value,
}: {
  className?: string;
  disabled?: boolean;
  filled?: boolean;
  label: string;
  onValueChange?: (value: string) => void;
  radius?: "squared" | "rounded";
  size?: "base" | "small";
  state?: "hover" | "focus" | "error";
  tone?: "field" | "component";
  value?: string;
}) {
  const displayValue = filled ? (value ?? "Input") : "";

  return (
    <InputGroup
      aria-label={label}
      className={[
        "medusa-search-input",
        tone === "component" ? "medusa-search-component" : "",
        radius === "rounded" ? "medusa-search-rounded" : "",
        size === "small" ? "medusa-search-small" : "",
        state === "hover" ? "medusa-search-hover" : "",
        state === "focus" ? "medusa-search-focus" : "",
        state === "error" ? "medusa-search-error" : "",
        disabled ? "medusa-search-disabled" : "",
        className ?? "",
      ].join(" ")}
    >
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        aria-invalid={state === "error" ? true : undefined}
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
        <Kbd>Cmd K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}

function SearchResult({
  active,
  detail,
  title,
}: {
  active?: boolean;
  detail: string;
  title: string;
}) {
  return (
    <Button
      className="h-auto w-full justify-start px-2 py-2 text-left"
      data-active={active ? "true" : undefined}
      type="button"
      variant="ghost"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="medusa-small-plus">{title}</span>
        <span className="medusa-small truncate text-muted-foreground">{detail}</span>
      </span>
    </Button>
  );
}

export { SearchPage };
