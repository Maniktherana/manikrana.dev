import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BannerStack as BannerStackComponent,
  type BannerStackItem,
} from "@manikrana/ui/components/motion/banner-stack";
import { Button } from "@manikrana/ui/components/ui/button";
import { Row, Section, Showcase } from "../showcase";

function Example() {
  const nextId = useRef(3);
  const [items, setItems] = useState<BannerStackItem[]>([
    { id: "2", title: "Changes saved", description: "Your project is up to date." },
    { id: "1", title: "Build complete", description: "All checks passed." },
  ]);
  return (
    <div className="flex flex-col gap-6">
      <Row>
        <Button
          variant="secondary"
          onClick={() => {
            const id = String(nextId.current++);
            setItems((items) => [
              { id, title: `Update ${id}`, description: "The newest banner stays in front." },
              ...items,
            ]);
          }}
        >
          Add banner
        </Button>
        <Button variant="ghost" onClick={() => setItems([])} disabled={items.length === 0}>
          Clear banners
        </Button>
      </Row>
      <div className="flex min-h-88 w-full max-w-md items-end rounded-stage bg-stage p-6">
        <BannerStackComponent
          items={items}
          onDismiss={(id) => setItems((items) => items.filter((item) => item.id !== id))}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Hover or focus a banner to expand the stack. At most three banners stay visible.
      </p>
    </div>
  );
}
const meta = { title: "Motion/BannerStack", component: Example } satisfies Meta<typeof Example>;
export default meta;
export const BannerStack: StoryObj<typeof meta> = {
  render: () => (
    <Showcase
      title="BannerStack"
      description="Banners rise into a three-layer stack with depth, blur, and a shorter exit. Hover and keyboard focus reveal the full column."
    >
      <Section title="Playground">
        <Example />
      </Section>
    </Showcase>
  ),
};
