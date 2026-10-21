import { Badge as BadgeComponent } from "@manikrana/ui/components/ui/badge";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Row, Section, Showcase } from "../showcase";

type Variant = NonNullable<ComponentProps<typeof BadgeComponent>["variant"]>;

const neutral = ["default", "secondary"] as const satisfies readonly Variant[];
const tints = ["green", "amber", "red"] as const satisfies readonly Variant[];
const groups = [
  { label: "Neutral", variants: neutral },
  { label: "Tinted", variants: tints },
] as const;
const iconVariants = ["default", "secondary", "green"] as const satisfies readonly Variant[];
const iconContents: { label: string; children: ReactNode }[] = [
  {
    label: "Leading",
    children: (
      <>
        <BadgeCheck data-icon="inline-start" />
        Verified
      </>
    ),
  },
  {
    label: "Trailing",
    children: (
      <>
        Docs
        <ArrowUpRight data-icon="inline-end" />
      </>
    ),
  },
];

const meta = {
  title: "Primitives/Badge",
  component: BadgeComponent,
  args: { children: "Badge", variant: "default", bordered: false },
  argTypes: {
    variant: { control: "select", options: [...neutral, ...tints] },
  },
} satisfies Meta<typeof BadgeComponent>;

export default meta;

export const Badge: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Badge"
      description="Small static pills: a selected-strength neutral, the resting control fill and a tint per hue. Any of them can be bordered."
    >
      <Section title="Playground">
        <Row>
          <BadgeComponent {...args} />
        </Row>
      </Section>
      <Section title="Variants">
        {groups.map(({ label, variants }) =>
          [false, true].map((bordered) => (
            <Row key={`${label}-${bordered}`} label={bordered ? "Bordered" : label}>
              {variants.map((variant) => (
                <BadgeComponent key={variant} variant={variant} bordered={bordered}>
                  {variant}
                </BadgeComponent>
              ))}
            </Row>
          )),
        )}
      </Section>
      <Section title="With icons">
        {iconContents.map(({ label, children }) => (
          <Row key={label} label={label}>
            {iconVariants.map((variant) => (
              <BadgeComponent key={variant} variant={variant}>
                {children}
              </BadgeComponent>
            ))}
          </Row>
        ))}
      </Section>
    </Showcase>
  ),
};
