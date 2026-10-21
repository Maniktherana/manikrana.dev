import { Button } from "@manikrana/ui/components/ui/button";
import { Kbd } from "@manikrana/ui/components/ui/kbd";
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@manikrana/ui/components/ui/tooltip";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Row, Section, Showcase } from "../showcase";

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;

const meta = {
  title: "Primitives/Tooltip",
  component: TooltipContent,
  args: { children: "Copy to clipboard", side: "top", align: "center", sideOffset: 4 },
  argTypes: {
    side: { control: "inline-radio", options: sides },
    align: { control: "inline-radio", options: aligns },
  },
} satisfies Meta<typeof TooltipContent>;

export default meta;

export const Tooltip: StoryObj<typeof meta> = {
  render: (args) => (
    <TooltipProvider>
      <Showcase
        title="Tooltip"
        description="A small popover-lightness label with the raised edge and an arrow, shown on hover or focus."
      >
        <Section title="Playground">
          <Row>
            <div className="py-12">
              <TooltipComponent defaultOpen>
                <TooltipTrigger render={<Button variant="secondary" />}>Copy</TooltipTrigger>
                <TooltipContent {...args} />
              </TooltipComponent>
            </div>
          </Row>
        </Section>
        <Section title="Sides">
          <Row>
            {sides.map((side) => (
              <TooltipComponent key={side}>
                <TooltipTrigger render={<Button variant="secondary" />}>{side}</TooltipTrigger>
                <TooltipContent side={side}>Opens {side}</TooltipContent>
              </TooltipComponent>
            ))}
          </Row>
        </Section>
        <Section title="With kbd">
          <Row>
            <TooltipComponent>
              <TooltipTrigger render={<Button variant="secondary" />}>Search</TooltipTrigger>
              <TooltipContent>
                Search components <Kbd>⌘K</Kbd>
              </TooltipContent>
            </TooltipComponent>
          </Row>
        </Section>
      </Showcase>
    </TooltipProvider>
  ),
};
