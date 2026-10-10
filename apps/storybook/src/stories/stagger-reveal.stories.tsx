import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  StaggerLine,
  StaggerReveal as StaggerRevealComponent,
} from "@manikrana/ui/components/motion/stagger-reveal";
import { Button } from "@manikrana/ui/components/ui/button";
import { Section, Showcase } from "../showcase";

function Example() {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col items-start gap-6">
      <Button
        variant="secondary"
        aria-expanded={show}
        aria-controls="reveal-example"
        onClick={() => setShow(!show)}
      >
        {show ? "Hide text" : "Reveal text"}
      </Button>
      <StaggerRevealComponent
        id="reveal-example"
        show={show}
        className="flex min-h-28 flex-col gap-2"
      >
        <StaggerLine as="strong" className="text-2xl font-medium">
          Built with care.
        </StaggerLine>
        <StaggerLine as="span" className="text-sm text-muted-foreground">
          Small details make the interface feel coherent.
        </StaggerLine>
      </StaggerRevealComponent>
    </div>
  );
}
const meta = { title: "Motion/StaggerReveal", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const StaggerReveal: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="StaggerReveal"
      description="Lines rise and sharpen over 500ms. Hiding uses one quiet 200ms fade, without reversing the stagger."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
