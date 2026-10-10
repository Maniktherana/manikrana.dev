import { Input as InputComponent } from "@manikrana/ui/components/ui/input";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Row, Section, Showcase } from "../showcase";

const states = [
  { label: "Placeholder", props: {} },
  { label: "Value", props: { defaultValue: "Toggle group" } },
  { label: "Disabled", props: { disabled: true, defaultValue: "Toggle group" } },
  { label: "Invalid", props: { "aria-invalid": true, defaultValue: "Toggle grop" } },
] satisfies { label: string; props: ComponentProps<typeof InputComponent> }[];

const meta = {
  title: "Primitives/Input",
  component: InputComponent,
  args: {
    placeholder: "Search components",
    "aria-label": "Search components",
    bordered: false,
    disabled: false,
    "aria-invalid": false,
  },
} satisfies Meta<typeof InputComponent>;

export default meta;

export const Input: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Input"
      description="A 36px pill on the control fill with its text centered on the pill. It has no edge by default, like transitions.dev's search."
    >
      <Section title="Playground">
        <Row>
          <InputComponent className="w-72" {...args} />
        </Row>
      </Section>
      <Section title="Edge">
        {[false, true].map((bordered) => (
          <Row key={String(bordered)} label={bordered ? "Bordered" : "Flat"}>
            <InputComponent
              className="w-72"
              bordered={bordered}
              placeholder="Search components"
              aria-label="Search components"
            />
          </Row>
        ))}
      </Section>
      <Section title="States">
        {states.map(({ label, props }) => (
          <Row key={label} label={label}>
            <InputComponent
              className="w-72"
              placeholder="Search components"
              aria-label="Search components"
              {...props}
            />
          </Row>
        ))}
      </Section>
    </Showcase>
  ),
};
