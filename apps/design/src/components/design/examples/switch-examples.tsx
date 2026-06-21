"use client";

import * as React from "react";

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

function SwitchText({
  description = "Receive a notification when a deployment finishes.",
  details,
  title = "Deploy notifications",
}: {
  description?: string;
  details?: React.ReactNode;
  title?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col items-start", details && "gap-3")}>
      <span className="text-[13px] leading-[1.6] font-medium text-foreground">{title}</span>
      <p className="m-0 text-[13px] leading-[1.6] text-secondary-foreground">
        {description}
      </p>
      {details}
    </div>
  );
}

function SwitchLabel() {
  return (
    <div className="flex items-start gap-3">
      <Switch size="sm" />
      <SwitchText
        description="Send an alert when usage crosses the monthly limit."
        title="Usage alerts"
      />
    </div>
  );
}

function SwitchCard() {
  const [checked, setChecked] = React.useState(false);

  return (
    <div
      className={cn(
        "flex w-[330px] cursor-pointer items-start gap-3 rounded-xl p-3 text-card-foreground shadow-[var(--shadow-card)] transition-colors",
        checked ? "bg-muted" : "bg-card",
      )}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[data-slot="switch"]')) return;

        setChecked((value) => !value);
      }}
    >
      <Switch checked={checked} onCheckedChange={setChecked} size="sm" className="mt-0" />
      <SwitchText
        description="Create a preview URL every time a pull request opens."
        title="Automatic previews"
      />
    </div>
  );
}

function SwitchCardContent() {
  const [checked, setChecked] = React.useState(true);

  return (
    <div
      className={cn(
        "flex w-[330px] cursor-pointer items-start gap-3 rounded-xl p-3 text-card-foreground shadow-[var(--shadow-card)] transition-colors",
        checked ? "bg-muted" : "bg-card",
      )}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('[data-slot="switch"]')) return;

        setChecked((value) => !value);
      }}
    >
      <Switch checked={checked} onCheckedChange={setChecked} size="sm" className="mt-0" />
      <SwitchText
        description="Pause non-critical updates outside of work hours."
        details={
          <div className="grid w-full gap-1 border-t border-border pt-3 text-[13px] leading-[1.6]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Channel</span>
              <span className="font-medium text-foreground">Email + desktop</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Quiet hours</span>
              <span className="font-medium text-foreground">10 PM - 8 AM</span>
            </div>
          </div>
        }
        title="Quiet delivery"
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
