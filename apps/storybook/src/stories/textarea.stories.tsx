import { Textarea as TextareaComponent } from "@manikrana/ui/components/ui/textarea";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Row, Section, Showcase } from "../showcase";

const value = "Filter chips that lift on hover and stay lifted while pressed.";

const states = [
  { label: "Placeholder", props: {} },
  { label: "Value", props: { defaultValue: value } },
  { label: "Disabled", props: { disabled: true, defaultValue: value } },
  { label: "Invalid", props: { "aria-invalid": true, defaultValue: "Too short" } },
] satisfies { label: string; props: ComponentProps<typeof TextareaComponent> }[];

const meta = {
  title: "Primitives/Textarea",
  component: TextareaComponent,
  args: {
    placeholder: "Describe the component",
    "aria-label": "Description",
    bordered: false,
    disabled: false,
    "aria-invalid": false,
  },
} satisfies Meta<typeof TextareaComponent>;

export default meta;

export const Textarea: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Textarea"
      description="The input's fill and states on a stage-radius rectangle that grows with its text."
    >
      <Section title="Playground">
        <Row>
          <TextareaComponent className="w-80" {...args} />
        </Row>
      </Section>
      <Section title="Edge">
        {[false, true].map((bordered) => (
          <Row key={String(bordered)} label={bordered ? "Bordered" : "Flat"}>
            <TextareaComponent
              className="w-80"
              bordered={bordered}
              placeholder="Describe the component"
              aria-label="Description"
            />
          </Row>
        ))}
      </Section>
      <Section title="States">
        {states.map(({ label, props }) => (
          <Row key={label} label={label}>
            <TextareaComponent
              className="w-80"
              placeholder="Describe the component"
              aria-label="Description"
              {...props}
            />
          </Row>
        ))}
      </Section>
    </Showcase>
  ),
};
