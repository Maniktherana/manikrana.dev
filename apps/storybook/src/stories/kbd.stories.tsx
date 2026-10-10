import { Kbd as KbdComponent, KbdGroup } from "@manikrana/ui/components/ui/kbd";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUp, Command, CornerDownLeft } from "lucide-react";
import { Row, Section, Showcase } from "../showcase";

const keys = ["⌘", "⇧", "⌥", "Ctrl", "Esc", "Tab", "Enter"];

const shortcuts = [
  ["⌘", "K"],
  ["Ctrl", "Shift", "P"],
  ["⇧", "Tab"],
];

const iconKeys = [
  { Icon: Command, label: "Cmd" },
  { Icon: ArrowUp, label: "Shift" },
  { Icon: CornerDownLeft, label: "Enter" },
];

const meta = {
  title: "Primitives/Kbd",
  component: KbdComponent,
  args: { children: "⌘K" },
} satisfies Meta<typeof KbdComponent>;

export default meta;

export const Kbd: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Kbd"
      description="A keyboard key on the control fill, for shortcuts in tooltips, menus and the search pill."
    >
      <Section title="Playground">
        <Row>
          <KbdComponent {...args} />
        </Row>
      </Section>
      <Section title="Keys">
        <Row>
          {keys.map((key) => (
            <KbdComponent key={key}>{key}</KbdComponent>
          ))}
        </Row>
      </Section>
      <Section title="Groups">
        <Row>
          {shortcuts.map((shortcut) => (
            <KbdGroup key={shortcut.join("+")}>
              {shortcut.map((key) => (
                <KbdComponent key={key}>{key}</KbdComponent>
              ))}
            </KbdGroup>
          ))}
        </Row>
      </Section>
      <Section title="With icons">
        <Row>
          {iconKeys.map(({ Icon, label }) => (
            <KbdComponent key={label}>
              <Icon />
              {label}
            </KbdComponent>
          ))}
        </Row>
      </Section>
    </Showcase>
  ),
};
