import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Copy } from "lucide-react";
import { IconSwap as IconSwapComponent } from "@manikrana/ui/components/motion/icon-swap";
import { Button } from "@manikrana/ui/components/ui/button";
import { Row, Section, Showcase } from "../showcase";

function Example() {
  const [copied, setCopied] = useState(false);
  return (
    <Row>
      <Button
        variant="secondary"
        onClick={() => setCopied(!copied)}
        aria-label={copied ? "Reset copy state" : "Show copied state"}
      >
        <IconSwapComponent
          state={copied ? "b" : "a"}
          className="size-4"
          a={<Copy className="size-4" />}
          b={<Check className="size-4" />}
        />
        {copied ? "Copied" : "Copy"}
      </Button>
    </Row>
  );
}
const meta = { title: "Motion/IconSwap", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const IconSwap: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="IconSwap"
      description="Icons crossfade with blur and scale in a fixed slot over 250ms. Reduced motion swaps them immediately."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
