import {
  AvatarBadge,
  Avatar as AvatarComponent,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@manikrana/ui/components/ui/avatar";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { Row, Section, Showcase } from "../showcase";

type Size = NonNullable<ComponentProps<typeof AvatarComponent>["size"]>;

const sizes = ["sm", "default", "lg", "xl"] as const satisfies readonly Size[];

const portrait = { src: "/manik.png", alt: "Manik Rana" };

const people = ["AK", "PS", "RV"];

const meta = {
  title: "Primitives/Avatar",
  component: AvatarComponent,
  args: { size: "xl" },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
  },
} satisfies Meta<typeof AvatarComponent>;

export default meta;

export const Avatar: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Avatar"
      description="A round photo with an initials fallback, optional badge and overlapping groups."
    >
      <Section title="Playground">
        <Row>
          <AvatarComponent {...args}>
            <AvatarImage {...portrait} />
            <AvatarFallback>MR</AvatarFallback>
          </AvatarComponent>
        </Row>
      </Section>
      <Section title="Sizes">
        <Row label="Image">
          {sizes.map((size) => (
            <AvatarComponent key={size} size={size}>
              <AvatarImage {...portrait} />
            </AvatarComponent>
          ))}
        </Row>
        <Row label="Fallback">
          {sizes.map((size) => (
            <AvatarComponent key={size} size={size}>
              <AvatarFallback>MR</AvatarFallback>
            </AvatarComponent>
          ))}
        </Row>
      </Section>
      <Section title="Badge">
        <Row label="Dot">
          {sizes.map((size) => (
            <AvatarComponent key={size} size={size}>
              <AvatarImage {...portrait} />
              <AvatarBadge />
            </AvatarComponent>
          ))}
        </Row>
        <Row label="Icon">
          {sizes.map((size) => (
            <AvatarComponent key={size} size={size}>
              <AvatarImage {...portrait} />
              <AvatarBadge>
                <Check />
              </AvatarBadge>
            </AvatarComponent>
          ))}
        </Row>
      </Section>
      <Section title="Group">
        {sizes.map((size) => (
          <Row key={size} label={size}>
            <AvatarGroup>
              <AvatarComponent size={size}>
                <AvatarImage {...portrait} />
              </AvatarComponent>
              {people.map((initials) => (
                <AvatarComponent key={initials} size={size}>
                  <AvatarFallback>{initials}</AvatarFallback>
                </AvatarComponent>
              ))}
              <AvatarGroupCount>+3</AvatarGroupCount>
            </AvatarGroup>
          </Row>
        ))}
      </Section>
    </Showcase>
  ),
};
