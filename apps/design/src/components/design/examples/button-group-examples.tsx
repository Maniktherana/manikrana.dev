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
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
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
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    <ButtonGroup variant="toolbar">
      <ButtonGroup variant="base" className="hidden sm:flex">
        <Button type="button" variant="secondary" size="icon" aria-label="Go back">
          <ArrowLeftIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="base">
        <Button type="button" variant="secondary">
          Archive
        </Button>
        <Button type="button" variant="secondary">
          Report
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="base">
        <Button type="button" variant="secondary">
          Snooze
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="More options"
              />
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
      </ButtonGroup>
    </ButtonGroup>
  );
}

function ButtonGroupOrientation() {
  return (
    <ButtonGroup
      variant="base"
      orientation="vertical"
      aria-label="Media controls"
      className="h-fit"
    >
      <Button type="button" variant="secondary" size="icon" aria-label="Increase">
        <PlusIcon />
      </Button>
      <Button type="button" variant="secondary" size="icon" aria-label="Decrease">
        <MinusIcon />
      </Button>
    </ButtonGroup>
  );
}

function ButtonGroupSize() {
  return (
    <div className="flex flex-col items-start gap-8">
      <ButtonGroup variant="base" size="compact">
        <Button type="button" variant="secondary">
          Compact
        </Button>
        <Button type="button" variant="secondary">
          Button
        </Button>
        <Button type="button" variant="secondary" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="base">
        <Button type="button" variant="secondary">
          Default
        </Button>
        <Button type="button" variant="secondary" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}

function ButtonGroupNested() {
  return (
    <ButtonGroup variant="toolbar">
      <ButtonGroup variant="base">
        <Button type="button" variant="secondary" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="base">
        <InputGroup>
          <InputGroupInput placeholder="Send a message..." />
          <Tooltip>
            <TooltipTrigger
              render={<InputGroupAddon align="inline-end" className="w-7 px-0" />}
            >
              <AudioLinesIcon />
            </TooltipTrigger>
            <TooltipContent>Voice mode</TooltipContent>
          </Tooltip>
        </InputGroup>
      </ButtonGroup>
    </ButtonGroup>
  );
}

function ButtonGroupSeparatorDemo() {
  return (
    <ButtonGroup variant="base">
      <Button type="button" variant="secondary" size="sm">
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button type="button" variant="secondary" size="sm">
        Paste
      </Button>
    </ButtonGroup>
  );
}

function ButtonGroupTextDemo() {
  return (
    <ButtonGroup variant="base" size="compact">
      <ButtonGroupText>Status</ButtonGroupText>
      <Button type="button" variant="secondary">
        Published
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label="More options"
      >
        <MoreHorizontalIcon />
      </Button>
    </ButtonGroup>
  );
}

function ButtonGroupSplit() {
  return (
    <ButtonGroup variant="base">
      <Button type="button" variant="secondary">
        Button
      </Button>
      <ButtonGroupSeparator />
      <Button type="button" size="icon" variant="secondary" aria-label="Add">
        <PlusIcon />
      </Button>
    </ButtonGroup>
  );
}

function ButtonGroupInput() {
  return (
    <ButtonGroup variant="base">
      <Input placeholder="Search..." />
      <Button type="button" variant="secondary" size="icon" aria-label="Search">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
}

function ButtonGroupInputGroup() {
  return (
    <ButtonGroup variant="toolbar" className="[--radius:9999rem]">
      <ButtonGroup variant="base">
        <Button type="button" variant="secondary" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup variant="base">
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
      </ButtonGroup>
    </ButtonGroup>
  );
}

function ButtonGroupDropdown() {
  return (
    <ButtonGroup variant="base">
      <Button type="button" variant="secondary">
        Follow
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Open follow actions"
            />
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
    </ButtonGroup>
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
    <ButtonGroup variant="toolbar">
      <ButtonGroup variant="base">
        <Select
          items={currencies}
          value={currency}
          onValueChange={(value) => setCurrency(value as string)}
        >
          <SelectTrigger className="w-[72px] font-mono">
            {currency}
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              {currencies.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.value}{" "}
                  <span className="text-muted-foreground">{item.label}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input placeholder="10.00" pattern="[0-9]*" />
      </ButtonGroup>
      <ButtonGroup variant="base">
        <Button type="button" aria-label="Send" size="icon" variant="secondary">
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}

function ButtonGroupPopover() {
  return (
    <ButtonGroup variant="base">
      <Button type="button" variant="secondary">
        <BotIcon data-icon="inline-start" />
        Copilot
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Open popover"
            />
          }
        >
          <ChevronDownIcon />
        </PopoverTrigger>
        <PopoverContent align="end" className="rounded-xl text-sm">
          <PopoverHeader>
            <PopoverTitle>Start a new task with Copilot</PopoverTitle>
            <PopoverDescription>Describe your task in natural language.</PopoverDescription>
          </PopoverHeader>
          <Field>
            <FieldLabel htmlFor="button-group-task" className="sr-only">
              Task Description
            </FieldLabel>
            <Textarea
              id="button-group-task"
              placeholder="I need to..."
              className="resize-none"
            />
            <FieldDescription>Copilot will open a pull request for review.</FieldDescription>
          </Field>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  );
}

function ButtonGroupRtl() {
  return (
    <div dir="rtl">
      <ButtonGroup variant="toolbar">
        <ButtonGroup variant="base">
          <Button type="button" variant="secondary">
            Archive
          </Button>
          <Button type="button" variant="secondary">
            Report
          </Button>
        </ButtonGroup>
        <ButtonGroup variant="base">
          <Button type="button" variant="secondary">
            Snooze
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="More options"
          >
            <MoreHorizontalIcon />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  );
}

const buttonGroupPreviews: Record<string, ComponentType> = {
  "button-group-demo": ButtonGroupDemo,
  "button-group-orientation": ButtonGroupOrientation,
  "button-group-size": ButtonGroupSize,
  "button-group-nested": ButtonGroupNested,
  "button-group-separator": ButtonGroupSeparatorDemo,
  "button-group-text": ButtonGroupTextDemo,
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
