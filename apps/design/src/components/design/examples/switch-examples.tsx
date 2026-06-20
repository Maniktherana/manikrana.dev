"use client";

import * as React from "react";
import { CalendarIcon, InfoIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const switchPreviewTitles: Record<string, string> = {
  switch: "Switch",
  "switch-size": "Switch Size",
  "switch-label": "Switch Label",
  "switch-card": "Switch Card",
  "switch-card-content": "Switch Card Content",
  "switch-disabled": "Switch Disabled",
};

function SwitchDemo() {
  return (
    <div className="flex items-center gap-4">
      <Switch />
      <Switch defaultChecked />
    </div>
  );
}

function SwitchSize() {
  return (
    <div className="flex items-center gap-4">
      <Switch size="sm" defaultChecked />
      <Switch defaultChecked />
    </div>
  );
}

function SwitchText({ hiddenContent }: { hiddenContent?: React.ReactNode }) {
  return (
    <div className={cn("flex min-w-0 flex-col items-start", hiddenContent && "gap-3")}>
      <div className="flex items-center gap-1">
        <span className="text-[13px] leading-[1.6] font-medium text-foreground">Label</span>
        <span className="text-[13px] leading-[1.6] text-muted-foreground">(Optional)</span>
        <InfoIcon aria-hidden="true" className="size-[15px] text-muted-foreground" />
      </div>
      <p className="m-0 text-[13px] leading-[1.6] text-secondary-foreground">
        The quick brown fox jumps over a lazy dog.
      </p>
      {hiddenContent}
    </div>
  );
}

function SwitchLabel() {
  return (
    <div className="flex items-start gap-3">
      <Switch size="sm" />
      <SwitchText />
    </div>
  );
}

function SwitchCard() {
  const [checked, setChecked] = React.useState(false);

  return (
    <div
      className="flex w-[330px] cursor-pointer items-start gap-3 rounded-lg bg-[var(--component)] p-3 shadow-[var(--shadow-card)]"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[data-slot="switch"]')) return;

        setChecked((value) => !value);
      }}
    >
      <Switch checked={checked} onCheckedChange={setChecked} size="sm" className="mt-0" />
      <SwitchText />
    </div>
  );
}

function SwitchCardContent() {
  const [checked, setChecked] = React.useState(true);

  return (
    <div
      className="flex w-[330px] cursor-pointer items-start gap-3 rounded-lg bg-[var(--component)] p-3 shadow-[var(--shadow-card)]"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[data-slot="switch"]')) return;

        setChecked((value) => !value);
      }}
    >
      <Switch checked={checked} onCheckedChange={setChecked} size="sm" className="mt-0" />
      <SwitchText
        hiddenContent={
          <div className="flex h-8 w-full items-center overflow-hidden rounded-[6px] bg-background shadow-[var(--shadow-control)]">
            <div className="flex size-8 shrink-0 items-center justify-center border-r border-border text-muted-foreground">
              <CalendarIcon aria-hidden="true" className="size-[15px]" />
            </div>
            <Input
              aria-label="Date"
              placeholder="DD/MM/YYYY"
              className="h-8 min-h-8 rounded-none bg-transparent shadow-none"
            />
          </div>
        }
      />
    </div>
  );
}

function SwitchDisabled() {
  return (
    <div className="flex items-center gap-4">
      <Switch disabled />
      <Switch disabled defaultChecked />
    </div>
  );
}

const switchPreviews: Record<string, React.ComponentType> = {
  switch: SwitchDemo,
  "switch-size": SwitchSize,
  "switch-label": SwitchLabel,
  "switch-card": SwitchCard,
  "switch-card-content": SwitchCardContent,
  "switch-disabled": SwitchDisabled,
};

function renderSwitchPreview(name: string) {
  const Preview = switchPreviews[name];

  return Preview ? <Preview /> : null;
}

export { renderSwitchPreview, switchPreviewTitles };
