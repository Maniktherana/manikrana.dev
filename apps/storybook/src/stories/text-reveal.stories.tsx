import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextReveal as TextRevealComponent } from "@manikrana/ui/components/motion/text-reveal";
import { Button } from "@manikrana/ui/components/ui/button";
import { Row, Section, Showcase } from "../showcase";

function Example() {
  const [run, setRun] = useState(0);
  return (
    <div className="grid gap-4">
      <div key={run} className="grid max-w-sm gap-2">
        <TextRevealComponent as="h3" className="text-base font-medium">
          Message composer
        </TextRevealComponent>
        <TextRevealComponent as="p" index={1} className="text-sm text-muted-foreground">
          A chat composer that starts as a pill and stacks into a card when the text wraps.
        </TextRevealComponent>
        <TextRevealComponent as="p" index={2} className="text-xs text-muted-foreground">
          Uses motion
        </TextRevealComponent>
      </div>
      <Row>
        <Button variant="secondary" onClick={() => setRun((current) => current + 1)}>
          Replay
        </Button>
      </Row>
    </div>
  );
}
const meta = { title: "Motion/TextReveal", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const TextReveal: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="TextReveal"
      description="Text fades in and rises 6px over 280ms when it mounts, each index 40ms after the last. Reduced motion shows it in place."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
