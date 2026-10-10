import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatePresence } from "motion/react";
import { PresenceFade as PresenceFadeComponent } from "@manikrana/ui/components/motion/presence-fade";
import { Button } from "@manikrana/ui/components/ui/button";
import { Row, Section, Showcase } from "../showcase";

function Example() {
  const [extra, setExtra] = useState(true);
  return (
    <Row>
      <div className="relative flex items-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {extra && (
            <PresenceFadeComponent key="docs">
              <Button variant="secondary">Docs</Button>
            </PresenceFadeComponent>
          )}
          <PresenceFadeComponent key="source">
            <Button variant="secondary">Source</Button>
          </PresenceFadeComponent>
        </AnimatePresence>
        <Button onClick={() => setExtra(!extra)}>{extra ? "Remove docs" : "Add docs"}</Button>
      </div>
    </Row>
  );
}
const meta = { title: "Motion/PresenceFade", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const PresenceFade: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="PresenceFade"
      description="Keyed children of AnimatePresence fade in and out over 200ms where they stand. Children that stay keep their key and never animate."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
