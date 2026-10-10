import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextStateSwap as TextStateSwapComponent } from "@manikrana/ui/components/motion/text-state-swap";
import { Button } from "@manikrana/ui/components/ui/button";
import { Row, Section, Showcase } from "../showcase";

const states = ["Ready", "Processing…", "Complete"];
function Example() {
  const [index, setIndex] = useState(0);
  return (
    <Row>
      <Button variant="secondary" onClick={() => setIndex((index + 1) % states.length)}>
        Next state
      </Button>
      <TextStateSwapComponent
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-control-foreground"
      >
        {states[index]}
      </TextStateSwapComponent>
    </Row>
  );
}
const meta = { title: "Motion/TextStateSwap", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const TextStateSwap: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="TextStateSwap"
      description="The old label moves up and fades before the new label enters from below. Each phase takes 150ms."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
