"use client";

import { useState } from "react";
import {
  ArchiveIcon,
  CreditCardIcon,
  FileTextIcon,
  type LucideIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  TruckIcon,
  UserPlusIcon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import {
  Command,
  CommandBar,
  CommandBarAction,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type CommandAction = {
  value: string;
  label: string;
  shortcut: string;
  icon: LucideIcon;
};

const orderActions: CommandAction[] = [
  {
    value: "open order",
    label: "Open order",
    shortcut: "O",
    icon: PackageIcon,
  },
  {
    value: "create return",
    label: "Create return",
    shortcut: "R",
    icon: ArchiveIcon,
  },
  {
    value: "track shipment",
    label: "Track shipment",
    shortcut: "T",
    icon: TruckIcon,
  },
];

const storeActions: CommandAction[] = [
  {
    value: "capture payment",
    label: "Capture payment",
    shortcut: "P",
    icon: CreditCardIcon,
  },
  {
    value: "invite operator",
    label: "Invite operator",
    shortcut: "I",
    icon: UserPlusIcon,
  },
  {
    value: "open settings",
    label: "Open settings",
    shortcut: "S",
    icon: SettingsIcon,
  },
];

const reportActions: CommandAction[] = [
  {
    value: "download invoices",
    label: "Download invoices",
    shortcut: "D",
    icon: FileTextIcon,
  },
  {
    value: "search products",
    label: "Search products",
    shortcut: "F",
    icon: SearchIcon,
  },
];

function CommandActionItem({ action }: { action: CommandAction }) {
  const Icon = action.icon;

  return (
    <CommandItem value={action.value}>
      <Icon />
      <span>{action.label}</span>
      <CommandShortcut>{action.shortcut}</CommandShortcut>
    </CommandItem>
  );
}

function CommandbarPage() {
  const [emptySearch, setEmptySearch] = useState("chargeback");

  return (
    <ComponentPageShell title="Commandbar">
      <ComponentDemoBand label="COMMANDBAR" className="mt-8 flex w-full items-center">
        <CommandBar>
          <CommandBarAction>Action</CommandBarAction>
          <span aria-hidden="true" className="medusa-commandbar-divider" />
          <CommandBarAction edge>Action</CommandBarAction>
        </CommandBar>
      </ComponentDemoBand>

      <ComponentDemoBand label="INLINE COMMAND BAR" className="mt-8 w-full max-w-xl">
        <Command className="w-full">
          <CommandInput placeholder="Search orders, customers, or actions..." />
          <CommandList>
            <CommandEmpty>No command found.</CommandEmpty>
            <CommandGroup heading="Orders">
              {orderActions.map((action) => (
                <CommandActionItem key={action.value} action={action} />
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Store">
              {storeActions.map((action) => (
                <CommandActionItem key={action.value} action={action} />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </ComponentDemoBand>

      <ComponentDemoBand label="GROUPED COMMAND LIST" className="mt-8 w-full max-w-xl">
        <Command className="w-full">
          <CommandInput placeholder="Find operational shortcuts..." />
          <CommandList>
            <CommandEmpty>No command found.</CommandEmpty>
            <CommandGroup heading="Orders">
              {orderActions.slice(0, 2).map((action) => (
                <CommandActionItem key={action.value} action={action} />
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Reports">
              {reportActions.map((action) => (
                <CommandActionItem key={action.value} action={action} />
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Store">
              {storeActions.slice(1).map((action) => (
                <CommandActionItem key={action.value} action={action} />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </ComponentDemoBand>

      <ComponentDemoBand label="EMPTY SEARCH STATE" className="mt-8 w-full max-w-xl">
        <Command className="w-full">
          <CommandInput
            value={emptySearch}
            onValueChange={setEmptySearch}
            placeholder="Search commands..."
          />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            <CommandGroup heading="Reports">
              {reportActions.map((action) => (
                <CommandActionItem key={action.value} action={action} />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { CommandbarPage };
