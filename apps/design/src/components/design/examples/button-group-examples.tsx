import { useState, type ComponentType } from "react";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  AudioLinesIcon,
  BotIcon,
  CalendarPlusIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CopyIcon,
  ListFilterIcon,
  MailCheckIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  TagIcon,
  Trash2Icon,
  TrashIcon,
  UserRoundXIcon,
  VolumeOffIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Group, GroupSeparator, GroupText } from "@/components/ui/group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const buttonGroupPreviewTitles: Record<string, string> = {
  "button-group-demo": "Button Group Demo",
  "button-group-orientation": "Button Group Orientation",
  "button-group-size": "Button Group Size",
  "button-group-nested": "Button Group Nested",
  "button-group-separator": "Button Group Separator",
  "button-group-text": "Button Group Text",
  "button-group-split": "Button Group Split",
  "button-group-input": "Button Group Input",
  "button-group-input-group": "Button Group Input Group",
  "button-group-dropdown": "Button Group Dropdown",
  "button-group-select": "Button Group Select",
  "button-group-popover": "Button Group Popover",
  "button-group-rtl": "Button Group RTL",
};

function ButtonGroupDemo() {
  return (
    <Group variant="toolbar">
      <Group variant="base" className="hidden sm:flex">
        <Button type="button" variant="outline" size="icon" aria-label="Go back">
          <ArrowLeftIcon />
        </Button>
      </Group>
      <Group variant="base">
        <Button type="button" variant="outline">
          Archive
        </Button>
        <Button type="button" variant="outline">
          Report
        </Button>
      </Group>
      <Group variant="base">
        <Button type="button" variant="outline">
          Snooze
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline" size="icon" aria-label="More options" />
            }
          >
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <MailCheckIcon />
                Mark as Read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArchiveIcon />
                Archive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <ClockIcon />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CalendarPlusIcon />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ListFilterIcon />
                Add to List
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TagIcon />
                Label As...
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </Group>
    </Group>
  );
}

function ButtonGroupOrientation() {
  return (
    <Group variant="base" orientation="vertical" aria-label="Media controls" className="h-fit">
      <Button type="button" variant="outline" size="icon" aria-label="Increase">
        <PlusIcon />
      </Button>
      <Button type="button" variant="outline" size="icon" aria-label="Decrease">
        <MinusIcon />
      </Button>
    </Group>
  );
}

function ButtonGroupSize() {
  return (
    <div className="flex flex-col items-start gap-8">
      <Group variant="base" size="compact">
        <Button type="button" variant="outline">
          Compact
        </Button>
        <Button type="button" variant="outline">
          Button
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </Group>
      <Group variant="base">
        <Button type="button" variant="outline">
          Default
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </Group>
    </div>
  );
}

function ButtonGroupNested() {
  return (
    <Group variant="toolbar">
      <Group variant="base">
        <Button type="button" variant="outline" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </Group>
      <Group variant="base">
        <InputGroup>
          <InputGroupInput placeholder="Send a message..." />
          <Tooltip>
            <TooltipTrigger render={<InputGroupAddon align="inline-end" className="w-7 px-0" />}>
              <AudioLinesIcon />
            </TooltipTrigger>
            <TooltipContent>Voice mode</TooltipContent>
          </Tooltip>
        </InputGroup>
      </Group>
    </Group>
  );
}

function GroupSeparatorDemo() {
  return (
    <Group variant="base">
      <Button type="button" variant="outline" size="sm">
        Copy
      </Button>
      <GroupSeparator />
      <Button type="button" variant="outline" size="sm">
        Paste
      </Button>
    </Group>
  );
}

function GroupTextDemo() {
  return (
    <Group variant="base" size="compact">
      <GroupText>Status</GroupText>
      <Button type="button" variant="outline">
        Published
      </Button>
      <Button type="button" variant="outline" size="icon" aria-label="More options">
        <MoreHorizontalIcon />
      </Button>
    </Group>
  );
}

function ButtonGroupSplit() {
  return (
    <Group variant="base">
      <Button type="button" variant="outline">
        Button
      </Button>
      <GroupSeparator />
      <Button type="button" size="icon" variant="outline" aria-label="Add">
        <PlusIcon />
      </Button>
    </Group>
  );
}

function ButtonGroupInput() {
  return (
    <Group variant="base">
      <Input placeholder="Search..." />
      <Button type="button" variant="outline" size="icon" aria-label="Search">
        <SearchIcon />
      </Button>
    </Group>
  );
}

function ButtonGroupInputGroup() {
  return (
    <Group variant="toolbar" className="[--radius:9999rem]">
      <Group variant="base">
        <Button type="button" variant="outline" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </Group>
      <Group variant="base">
        <InputGroup>
          <InputGroupInput placeholder="Send a message..." />
          <InputGroupAddon align="inline-end" className="p-0">
            <InputGroupButton
              aria-label="Voice mode"
              size="icon-xs"
              className="size-7! rounded-none!"
            >
              <AudioLinesIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Group>
    </Group>
  );
}

function ButtonGroupDropdown() {
  return (
    <Group variant="base">
      <Button type="button" variant="outline">
        Follow
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="icon" aria-label="Open follow actions" />
          }
        >
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <VolumeOffIcon />
              Mute Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CheckIcon />
              Mark as Read
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserRoundXIcon />
              Block User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ShareIcon />
              Share Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CopyIcon />
              Copy Conversation
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">
              <TrashIcon />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </Group>
  );
}

const currencies = [
  { label: "US Dollar", value: "$" },
  { label: "Euro", value: "€" },
  { label: "British Pound", value: "£" },
];

function ButtonGroupSelect() {
  const [currency, setCurrency] = useState("$");

  return (
    <Group variant="toolbar">
      <Group variant="base">
        <Select
          items={currencies}
          value={currency}
          onValueChange={(value) => setCurrency(value as string)}
        >
          <SelectTrigger className="w-[72px] font-mono">{currency}</SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              {currencies.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.value} <span className="text-muted-foreground">{item.label}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input placeholder="10.00" pattern="[0-9]*" />
      </Group>
      <Group variant="base">
        <Button type="button" aria-label="Send" size="icon" variant="outline">
          <ArrowRightIcon />
        </Button>
      </Group>
    </Group>
  );
}

function ButtonGroupPopover() {
  return (
    <Group variant="base">
      <Button type="button" variant="outline">
        <BotIcon data-icon="inline-start" />
        Copilot
      </Button>
      <Popover>
        <PopoverTrigger
          render={<Button type="button" variant="outline" size="icon" aria-label="Open popover" />}
        >
          <ChevronDownIcon />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="mb-3">
            <p className="text-[13px] leading-[1.6] font-medium text-foreground">
              Start a new task with Copilot
            </p>
            <p className="mt-1 text-[13px] leading-[1.6] text-secondary-foreground">
              Describe your task in natural language.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="button-group-task" className="sr-only">
              Task Description
            </FieldLabel>
            <Textarea id="button-group-task" placeholder="I need to..." className="resize-none" />
            <FieldDescription>Copilot will open a pull request for review.</FieldDescription>
          </Field>
        </PopoverContent>
      </Popover>
    </Group>
  );
}

function ButtonGroupRtl() {
  return (
    <div dir="rtl">
      <Group variant="toolbar">
        <Group variant="base">
          <Button type="button" variant="outline">
            Archive
          </Button>
          <Button type="button" variant="outline">
            Report
          </Button>
        </Group>
        <Group variant="base">
          <Button type="button" variant="outline">
            Snooze
          </Button>
          <Button type="button" variant="outline" size="icon" aria-label="More options">
            <MoreHorizontalIcon />
          </Button>
        </Group>
      </Group>
    </div>
  );
}

const buttonGroupPreviews: Record<string, ComponentType> = {
  "button-group-demo": ButtonGroupDemo,
  "button-group-orientation": ButtonGroupOrientation,
  "button-group-size": ButtonGroupSize,
  "button-group-nested": ButtonGroupNested,
  "button-group-separator": GroupSeparatorDemo,
  "button-group-text": GroupTextDemo,
  "button-group-split": ButtonGroupSplit,
  "button-group-input": ButtonGroupInput,
  "button-group-input-group": ButtonGroupInputGroup,
  "button-group-dropdown": ButtonGroupDropdown,
  "button-group-select": ButtonGroupSelect,
  "button-group-popover": ButtonGroupPopover,
  "button-group-rtl": ButtonGroupRtl,
};

function renderButtonGroupPreview(name: string) {
  const Preview = buttonGroupPreviews[name];

  return Preview ? <Preview /> : null;
}

export { buttonGroupPreviewTitles, renderButtonGroupPreview };
