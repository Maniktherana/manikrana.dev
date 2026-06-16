import { SearchIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const commandHints = [
  {
    label: "Open command menu",
    keys: ["Cmd", "K"],
  },
  {
    label: "Create product",
    keys: ["C"],
  },
  {
    label: "Archive selected order",
    keys: ["Shift", "A"],
  },
  {
    label: "Close panel",
    keys: ["Esc"],
  },
];

function KbdPage() {
  return (
    <ComponentPageShell title="Kbd">
      <ComponentDemoBand label="SINGLE KEY" className="mt-8 flex flex-wrap items-center gap-4">
        <Kbd>Esc</Kbd>
        <Kbd>Tab</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>Space</Kbd>
        <Kbd>/</Kbd>
      </ComponentDemoBand>

      <ComponentDemoBand label="SHORTCUT GROUPS" className="mt-8 flex flex-wrap items-center gap-5">
        <KbdGroup aria-label="Open command menu shortcut">
          <Kbd>Cmd</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup aria-label="Save changes shortcut">
          <Kbd>Cmd</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
        <KbdGroup aria-label="Move to next item shortcut">
          <Kbd>Shift</Kbd>
          <Kbd>Tab</Kbd>
        </KbdGroup>
        <KbdGroup aria-label="Open help shortcut">
          <Kbd>?</Kbd>
        </KbdGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="SURFACES" className="mt-8 flex flex-wrap items-center gap-4">
        <Kbd>⌘</Kbd>
        <Kbd background="component">⌘</Kbd>
        <Kbd background="contrast">⌘</Kbd>
      </ComponentDemoBand>

      <ComponentDemoBand label="COMMAND HINTS" className="mt-8 w-full max-w-xl">
        <div className="divide-y rounded-lg border bg-background">
          {commandHints.map((hint) => (
            <div key={hint.label} className="flex items-center justify-between gap-6 px-3 py-2">
              <span className="text-sm text-foreground">{hint.label}</span>
              <KbdGroup aria-label={`${hint.label} shortcut`}>
                {hint.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </KbdGroup>
            </div>
          ))}
        </div>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="WITH CONTROLS"
        className="mt-8 grid w-full max-w-3xl gap-5 md:grid-cols-2"
      >
        <Field>
          <FieldLabel htmlFor="kbd-search">Search products</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput id="kbd-search" placeholder="Products, orders, customers" />
            <InputGroupAddon align="inline-end">
              <KbdGroup aria-label="Focus search shortcut">
                <Kbd background="component">/</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            Keep the shortcut hint attached to the typeable input.
          </FieldDescription>
        </Field>

        <div className="flex flex-col gap-3">
          <Button type="button" variant="outline" className="justify-between">
            Export orders
            <KbdGroup aria-label="Export orders shortcut">
              <Kbd background="component">Cmd</Kbd>
              <Kbd background="component">E</Kbd>
            </KbdGroup>
          </Button>
          <Input aria-label="Order filter" defaultValue="status:ready" />
        </div>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { KbdPage };
