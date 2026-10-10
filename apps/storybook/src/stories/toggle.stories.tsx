import { Toggle as ToggleComponent } from "@manikrana/ui/components/ui/toggle";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkles } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Row, Section, Showcase } from "../showcase";

const sizes = ["sm", "default", "lg"] as const;
const iconContents: { label: string; children: ReactNode }[] = [
  {
    label: "Leading",
    children: (
      <>
        <Sparkles data-icon="inline-start" />
        Effects
      </>
    ),
  },
  {
    label: "Trailing",
    children: (
      <>
        Effects
        <Sparkles data-icon="inline-end" />
      </>
    ),
  },
];

const states = [
  { name: "Rest", props: {} },
  { name: "Pressed", props: { defaultPressed: true } },
  { name: "Static", props: { static: true } },
  { name: "Disabled", props: { disabled: true } },
  { name: "Disabled pressed", props: { disabled: true, defaultPressed: true } },
] satisfies { name: string; props: ComponentProps<typeof ToggleComponent> }[];

const meta = {
  title: "Primitives/Toggle",
  component: ToggleComponent,
  args: { children: "Effects", size: "default", bordered: true, static: false, disabled: false },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
  },
} satisfies Meta<typeof ToggleComponent>;

export default meta;

export const Toggle: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Toggle"
      description="A filter chip that lifts on hover and stays lifted while pressed. Chips are bordered by default."
    >
      <Section title="Playground">
        <Row>
          <ToggleComponent {...args} />
        </Row>
      </Section>
      <Section title="Edge">
        {[true, false].map((bordered) => (
          <Row key={String(bordered)} label={bordered ? "Bordered" : "Flat"}>
            {[false, true].map((pressed) => (
              <ToggleComponent key={String(pressed)} bordered={bordered} defaultPressed={pressed}>
                {pressed ? "Pressed" : "Rest"}
              </ToggleComponent>
            ))}
          </Row>
        ))}
      </Section>
      <Section title="Sizes">
        {sizes.map((size) => (
          <Row key={size} label={size}>
            {[false, true].map((pressed) => (
              <ToggleComponent key={String(pressed)} size={size} defaultPressed={pressed}>
                {pressed ? "Pressed" : "Rest"}
              </ToggleComponent>
            ))}
            <ToggleComponent size={size}>
              <Sparkles data-icon="inline-start" />
              Effects
            </ToggleComponent>
          </Row>
        ))}
      </Section>
      <Section title="With icons">
        {iconContents.map(({ label, children }) => (
          <Row key={label} label={label}>
            {[false, true].map((pressed) => (
              <ToggleComponent key={String(pressed)} defaultPressed={pressed}>
                {children}
              </ToggleComponent>
            ))}
          </Row>
        ))}
      </Section>
      <Section title="States">
        <Row>
          {states.map(({ name, props }) => (
            <ToggleComponent key={name} {...props}>
              {name}
            </ToggleComponent>
          ))}
        </Row>
      </Section>
    </Showcase>
  ),
};
