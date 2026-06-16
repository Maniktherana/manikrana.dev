import { ChevronDownIcon, MoreHorizontalIcon, PlusIcon, XIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";

function ButtonGroupPage() {
  return (
    <ComponentPageShell title="Button Group">
      <ComponentDemoBand label="COMPONENT BACKGROUND · 28PX">
        <ButtonGroup>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline" size="icon" aria-label="Clear">
            <XIcon />
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline" size="icon" aria-label="More">
            <MoreHorizontalIcon />
          </Button>
        </ButtonGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="BASE BACKGROUND · 28PX">
        <ButtonGroup className="medusa-button-group-base">
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline" disabled>
            Label
          </Button>
          <Button type="button" variant="outline" size="icon" aria-label="Open">
            <ChevronDownIcon />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="medusa-button-group-base">
          <Button type="button" variant="outline" size="icon" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline">
            Label
          </Button>
          <Button type="button" variant="outline" size="icon" aria-label="More">
            <MoreHorizontalIcon />
          </Button>
        </ButtonGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="COMPACT · 20PX">
        <ButtonGroup className="medusa-button-group-compact">
          <Button type="button" variant="outline" size="xs">
            Label
          </Button>
          <Button type="button" variant="outline" size="xs">
            Label
          </Button>
          <Button type="button" variant="outline" size="icon-xs" aria-label="Clear">
            <XIcon />
          </Button>
        </ButtonGroup>

        <ButtonGroup className="medusa-button-group-compact medusa-button-group-base">
          <Button type="button" variant="outline" size="xs">
            Label
          </Button>
          <Button type="button" variant="outline" size="xs">
            Label
          </Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>Slot</ButtonGroupText>
          <Button type="button" variant="outline" size="icon-xs" aria-label="Open">
            <ChevronDownIcon />
          </Button>
        </ButtonGroup>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { ButtonGroupPage };
