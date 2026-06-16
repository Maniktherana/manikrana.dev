import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  ExternalLinkIcon,
  PlusIcon,
  RefreshCwIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function ButtonPage() {
  return (
    <ComponentPageShell title="Button">
      <ComponentDemoBand label="VARIANTS">
        <Button type="button">Default</Button>
        <Button type="button" variant="secondary">
          Secondary
        </Button>
        <Button type="button" variant="outline">
          Outline
        </Button>
        <Button type="button" variant="ghost">
          Ghost
        </Button>
        <Button type="button" variant="destructive">
          Destructive
        </Button>
        <Button variant="link" render={<a href="https://ui.shadcn.com" aria-label="Open shadcn" />}>
          Link
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="SIZES">
        <Button type="button" size="xs">
          Extra small
        </Button>
        <Button type="button" size="sm">
          Small
        </Button>
        <Button type="button">Default</Button>
        <Button type="button" size="lg">
          Large
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="WITH ICONS">
        <Button type="button">
          <PlusIcon data-icon="inline-start" />
          Create
        </Button>
        <Button type="button" variant="outline">
          Review
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button type="button" variant="secondary">
          <CheckIcon data-icon="inline-start" />
          Confirmed
        </Button>
        <Button type="button" variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="ICON BUTTONS">
        <Button type="button" variant="outline" size="icon-xs" aria-label="Add item">
          <PlusIcon />
        </Button>
        <Button type="button" variant="outline" size="icon-sm" aria-label="Refresh">
          <RefreshCwIcon />
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label="Settings">
          <SettingsIcon />
        </Button>
        <Button type="button" variant="outline" size="icon-lg" aria-label="Open external link">
          <ExternalLinkIcon />
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="LOADING AND DISABLED">
        <Button type="button" disabled>
          <Spinner data-icon="inline-start" />
          Saving
        </Button>
        <Button type="button" variant="outline" disabled>
          Disabled
        </Button>
        <Button type="button" variant="ghost" disabled>
          <SettingsIcon data-icon="inline-start" />
          Unavailable
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="LINK RENDERING">
        <Button render={<Link to="/" aria-label="Open component index" />}>
          Component index
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Button
          variant="outline"
          render={
            <a
              href="https://ui.shadcn.com/docs/components/button"
              target="_blank"
              rel="noreferrer"
              aria-label="Open shadcn button docs"
            />
          }
        >
          shadcn docs
          <ExternalLinkIcon data-icon="inline-end" />
        </Button>
        <Button
          variant="link"
          render={
            <a
              href="https://base-ui.com/react/components/button"
              aria-label="Open Base UI button docs"
            />
          }
        >
          Base UI Button
          <ExternalLinkIcon data-icon="inline-end" />
        </Button>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { ButtonPage };
