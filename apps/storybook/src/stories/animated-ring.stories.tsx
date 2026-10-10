import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedRing as AnimatedRingComponent } from "@manikrana/ui/components/animated-ring";
import { Avatar, AvatarFallback, AvatarImage } from "@manikrana/ui/components/ui/avatar";
import { Sparkles } from "lucide-react";
import { Row, Section, Showcase } from "../showcase";

const meta = { title: "Primitives/AnimatedRing", component: AnimatedRingComponent } satisfies Meta<
  typeof AnimatedRingComponent
>;
export default meta;
export const AnimatedRing: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="AnimatedRing"
      description="A separate circular ring with a 4-second light and a 3px gap. It can surround any circular content."
    >
      <Section title="Avatar">
        <Row>
          <AnimatedRingComponent className="size-12" {...args}>
            <Avatar className="size-full">
              <AvatarImage src="/manik.png" alt="Manik Rana" />
              <AvatarFallback>MR</AvatarFallback>
            </Avatar>
          </AnimatedRingComponent>
        </Row>
      </Section>
      <Section title="Other content">
        <Row>
          <AnimatedRingComponent className="size-12">
            <div className="grid size-full place-items-center rounded-full bg-control text-control-foreground">
              <Sparkles className="size-4" aria-label="Sparkles" />
            </div>
          </AnimatedRingComponent>
        </Row>
      </Section>
    </Showcase>
  ),
};
