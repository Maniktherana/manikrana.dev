import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, Copy, Minus, Plus } from "lucide-react";
import { Button } from "@manikrana/ui/components/ui/button";
import {
  ButtonGroup as ButtonGroupComponent,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@manikrana/ui/components/ui/button-group";
import { Input } from "@manikrana/ui/components/ui/input";
import { Row, Section, Showcase } from "../showcase";

const meta = {
  title: "Primitives/ButtonGroup",
  component: ButtonGroupComponent,
  args: { orientation: "horizontal" },
  argTypes: { orientation: { control: "inline-radio", options: ["horizontal", "vertical"] } },
} satisfies Meta<typeof ButtonGroupComponent>;
export default meta;

export const ButtonGroup: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="ButtonGroup"
      description="Joined actions on the shared control layers, with a single outer shape."
    >
      <Section title="Playground">
        <Row>
          <ButtonGroupComponent {...args} aria-label="Edit actions">
            <Button variant="secondary">Undo</Button>
            <Button variant="secondary">Redo</Button>
            <Button variant="secondary" disabled>
              Save
            </Button>
          </ButtonGroupComponent>
        </Row>
      </Section>
      <Section title="Split">
        <Row>
          <ButtonGroupComponent aria-label="Publish actions">
            <Button>Publish</Button>
            <ButtonGroupSeparator />
            <Button size="icon" aria-label="More publish options">
              <ChevronDown />
            </Button>
          </ButtonGroupComponent>
        </Row>
      </Section>
      <Section title="Text and icons">
        <Row>
          <ButtonGroupComponent aria-label="Zoom controls">
            <Button variant="secondary" size="icon" aria-label="Zoom out">
              <Minus />
            </Button>
            <ButtonGroupText>100%</ButtonGroupText>
            <Button variant="secondary" size="icon" aria-label="Zoom in">
              <Plus />
            </Button>
          </ButtonGroupComponent>
        </Row>
      </Section>
      <Section title="Input">
        <Row>
          <ButtonGroupComponent aria-label="Share link">
            <Input className="w-56" defaultValue="manikrana.dev" aria-label="Share URL" readOnly />
            <Button variant="secondary" aria-label="Copy link">
              <Copy />
              Copy
            </Button>
          </ButtonGroupComponent>
        </Row>
      </Section>
      <Section title="Vertical">
        <Row>
          <ButtonGroupComponent orientation="vertical" aria-label="Document actions">
            <Button variant="secondary">Open</Button>
            <ButtonGroupSeparator orientation="horizontal" />
            <Button variant="secondary">Duplicate</Button>
            <Button variant="secondary" disabled>
              Delete
            </Button>
          </ButtonGroupComponent>
        </Row>
      </Section>
    </Showcase>
  ),
};
