import { Button as ButtonComponent } from "@manikrana/ui/components/ui/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Plus } from "lucide-react";
import type { ComponentProps } from "react";
import { Row, Section, Showcase } from "../showcase";

type Variant = NonNullable<ComponentProps<typeof ButtonComponent>["variant"]>;

const neutral = ["default", "secondary", "ghost"] as const satisfies readonly Variant[];
const tints = ["green", "amber", "red"] as const satisfies readonly Variant[];
const sizes = ["sm", "default", "lg"] as const;
const iconSizes = ["icon-sm", "icon", "icon-lg"] as const;

const meta = {
  title: "Primitives/Button",
  component: ButtonComponent,
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    bordered: false,
    static: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "select", options: [...neutral, ...tints] },
    size: { control: "select", options: [...sizes, ...iconSizes] },
  },
} satisfies Meta<typeof ButtonComponent>;

export default meta;

export const Button: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Button"
      description="Pills sized like transitions.dev's controls: one primary per view, a flat fill, a ghost and a tint per hue. Any of them can be bordered."
    >
      <Section title="Playground">
        <Row>
          <ButtonComponent {...args} />
        </Row>
      </Section>
      <Section title="Variants">
        {[false, true].map((bordered) => (
          <Row key={`neutral-${bordered}`} label={bordered ? "Bordered" : "Neutral"}>
            {neutral.map((variant) => (
              <ButtonComponent key={variant} variant={variant} bordered={bordered}>
                {variant === "default" ? "Primary" : variant}
              </ButtonComponent>
            ))}
          </Row>
        ))}
        {[false, true].map((bordered) => (
          <Row key={`tint-${bordered}`} label={bordered ? "Bordered" : "Tinted"}>
            {tints.map((variant) => (
              <ButtonComponent key={variant} variant={variant} bordered={bordered}>
                {variant}
              </ButtonComponent>
            ))}
          </Row>
        ))}
      </Section>
      <Section title="Sizes">
        {neutral.map((variant) => (
          <Row key={variant} label={variant}>
            {sizes.map((size) => (
              <ButtonComponent key={size} variant={variant} size={size}>
                {size}
              </ButtonComponent>
            ))}
          </Row>
        ))}
      </Section>
      <Section title="With icons">
        <Row label="Leading">
          {neutral.map((variant) => (
            <ButtonComponent key={variant} variant={variant}>
              <Plus data-icon="inline-start" />
              New
            </ButtonComponent>
          ))}
        </Row>
        <Row label="Trailing">
          {neutral.map((variant) => (
            <ButtonComponent key={variant} variant={variant}>
              Next
              <ArrowRight data-icon="inline-end" />
            </ButtonComponent>
          ))}
        </Row>
        <Row label="Icon only">
          {iconSizes.map((size) => (
            <ButtonComponent key={size} variant="secondary" size={size} aria-label="Add">
              <Plus />
            </ButtonComponent>
          ))}
          {iconSizes.map((size) => (
            <ButtonComponent key={size} variant="ghost" size={size} aria-label="Add">
              <Plus />
            </ButtonComponent>
          ))}
        </Row>
      </Section>
      <Section title="States">
        <Row label="Disabled">
          {neutral.map((variant) => (
            <ButtonComponent key={variant} variant={variant} disabled>
              Disabled
            </ButtonComponent>
          ))}
        </Row>
        <Row label="Invalid">
          {neutral.map((variant) => (
            <ButtonComponent key={variant} variant={variant} aria-invalid>
              Invalid
            </ButtonComponent>
          ))}
        </Row>
      </Section>
    </Showcase>
  ),
};
