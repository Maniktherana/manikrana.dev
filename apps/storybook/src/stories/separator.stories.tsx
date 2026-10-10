import { Separator as SeparatorComponent } from "@manikrana/ui/components/ui/separator";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment } from "react";
import { Row, Section, Showcase } from "../showcase";

const links = ["Blog", "Docs", "Source"];

const meta = {
  title: "Primitives/Separator",
  component: SeparatorComponent,
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof SeparatorComponent>;

export default meta;

export const Separator: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Separator"
      description="A 1px line on the translucent control-hover layer, horizontal or vertical."
    >
      <Section title="Playground">
        <Row>
          <div className="flex h-20 w-64 items-center justify-center">
            <SeparatorComponent {...args} />
          </div>
        </Row>
      </Section>
      <Section title="Horizontal">
        <div className="w-72 text-sm">
          <p className="text-foreground">@manikrana/ui</p>
          <p className="text-muted-foreground">Primitives for a pure black page.</p>
          <SeparatorComponent className="my-4" />
          <p className="text-muted-foreground">Edges are shadows, never borders.</p>
        </div>
      </Section>
      <Section title="Vertical">
        <div className="flex h-5 items-center gap-4 text-sm text-muted-foreground">
          {links.map((link, index) => (
            <Fragment key={link}>
              {index > 0 && <SeparatorComponent orientation="vertical" />}
              <span>{link}</span>
            </Fragment>
          ))}
        </div>
      </Section>
    </Showcase>
  ),
};
