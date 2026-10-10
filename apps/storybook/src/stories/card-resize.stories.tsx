import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardResize as CardResizeComponent } from "@manikrana/ui/components/motion/card-resize";
import { Button } from "@manikrana/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@manikrana/ui/components/ui/card";
import { Section, Showcase } from "../showcase";

function Example() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex flex-col items-start gap-6">
      <Button
        variant="secondary"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="resize-example"
      >
        {expanded ? "Shrink card" : "Expand card"}
      </Button>
      <div className="flex min-h-72 w-full max-w-md items-start">
        <CardResizeComponent
          id="resize-example"
          width={expanded ? "100%" : "70%"}
          height={expanded ? 280 : 180}
          className="rounded-card"
        >
          <Card className="size-full">
            <CardHeader>
              <CardTitle>Project overview</CardTitle>
              <CardDescription>The surface follows its new dimensions.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Content keeps its natural size as the card expands or contracts.
            </CardContent>
          </Card>
        </CardResizeComponent>
      </div>
    </div>
  );
}

const meta = { title: "Motion/CardResize", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const CardResize: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="CardResize"
      description="Width and height tween over 300ms. Reduced motion applies the new dimensions immediately."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
