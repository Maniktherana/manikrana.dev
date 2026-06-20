import type { ComponentType } from "react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  GitBranchIcon,
  GitForkIcon,
  PlusIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const buttonPreviewTitles: Record<string, string> = {
  button: "Button",
  "button-demo": "Button Demo",
  "button-size": "Button Size",
  "button-default": "Button Default",
  "button-secondary": "Button Secondary",
  "button-outline": "Button Outline",
  "button-ghost": "Button Ghost",
  "button-destructive": "Button Destructive",
  "button-link": "Button Link",
  "button-icon": "Button Icon",
  "button-with-icon": "Button With Icon",
  "button-rounded": "Button Rounded",
  "button-spinner": "Button Spinner",
  "button-render": "Button As Link",
  "button-rtl": "Button RTL",
};

function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button type="button" variant="secondary">
        Button
      </Button>
      <Button type="button" variant="secondary" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}

function ButtonSize() {
  return (
    <div className="flex flex-col items-start gap-8 sm:flex-row">
      <div className="flex items-start gap-2">
        <Button type="button" size="xs" variant="secondary">
          Extra Small
        </Button>
        <Button type="button" size="icon-xs" aria-label="Submit" variant="secondary">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button type="button" size="sm" variant="secondary">
          Small
        </Button>
        <Button type="button" size="icon-sm" aria-label="Submit" variant="secondary">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button type="button" variant="secondary">
          Default
        </Button>
        <Button type="button" size="icon" aria-label="Submit" variant="secondary">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button type="button" variant="secondary" size="lg">
          Large
        </Button>
        <Button type="button" size="icon-lg" aria-label="Submit" variant="secondary">
          <ArrowUpRightIcon />
        </Button>
      </div>
    </div>
  );
}

function ButtonDefault() {
  return <Button type="button">Button</Button>;
}

function ButtonSecondary() {
  return (
    <Button type="button" variant="secondary">
      Secondary
    </Button>
  );
}

function ButtonOutline() {
  return (
    <Button type="button" variant="outline">
      Outline
    </Button>
  );
}

function ButtonGhost() {
  return (
    <Button type="button" variant="ghost">
      Ghost
    </Button>
  );
}

function ButtonDestructive() {
  return (
    <Button type="button" variant="destructive">
      Destructive
    </Button>
  );
}

function ButtonLink() {
  return (
    <Button type="button" variant="link">
      Link
    </Button>
  );
}

function ButtonIcon() {
  return (
    <Button type="button" variant="secondary" size="icon" aria-label="Submit">
      <ArrowUpRightIcon />
    </Button>
  );
}

function ButtonWithIcon() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary">
        <GitBranchIcon data-icon="inline-start" />
        New Branch
      </Button>
      <Button type="button" variant="secondary">
        Fork
        <GitForkIcon data-icon="inline-end" />
      </Button>
    </div>
  );
}

function ButtonRounded() {
  return (
    <div className="flex gap-2">
      <Button type="button" className="rounded-full">
        Get Started
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="rounded-full"
        aria-label="Submit"
      >
        <ArrowUpIcon />
      </Button>
    </div>
  );
}

function ButtonSpinner() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" disabled>
        <Spinner data-icon="inline-start" />
        Generating
      </Button>
      <Button type="button" variant="secondary" disabled>
        Downloading
        <Spinner data-icon="inline-end" />
      </Button>
    </div>
  );
}

function ButtonRender() {
  return (
    <a href="#" className={buttonVariants({ variant: "secondary", size: "sm" })}>
      Login
    </a>
  );
}

function ButtonRtl() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row" dir="rtl">
      <Button type="button" variant="secondary">
        Button
      </Button>
      <Button type="button" variant="destructive">
        Delete
      </Button>
      <Button type="button" variant="secondary">
        Submit
        <ArrowRightIcon className="rtl:rotate-180" data-icon="inline-end" />
      </Button>
      <Button type="button" variant="secondary" size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button type="button" variant="secondary" disabled>
        <Spinner data-icon="inline-start" />
        Loading
      </Button>
    </div>
  );
}

const buttonPreviews: Record<string, ComponentType> = {
  button: ButtonDemo,
  "button-demo": ButtonDemo,
  "button-size": ButtonSize,
  "button-default": ButtonDefault,
  "button-secondary": ButtonSecondary,
  "button-outline": ButtonOutline,
  "button-ghost": ButtonGhost,
  "button-destructive": ButtonDestructive,
  "button-link": ButtonLink,
  "button-icon": ButtonIcon,
  "button-with-icon": ButtonWithIcon,
  "button-rounded": ButtonRounded,
  "button-spinner": ButtonSpinner,
  "button-render": ButtonRender,
  "button-rtl": ButtonRtl,
};

function renderButtonPreview(name: string) {
  const Preview = buttonPreviews[name];

  return Preview ? <Preview /> : null;
}

export { buttonPreviewTitles, renderButtonPreview };
