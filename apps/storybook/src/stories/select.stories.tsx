import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select as SelectComponent,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@manikrana/ui/components/ui/select";
import { Row, Section, Showcase } from "../showcase";

const items = [
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Research", value: "research" },
  { label: "Operations", value: "operations" },
];
const manyItems = Array.from({ length: 30 }, (_, i) => ({
  label: `Option ${i + 1}`,
  value: String(i + 1),
}));
const meta = {
  title: "Primitives/Select",
  component: SelectTrigger,
  args: { size: "default", bordered: false, disabled: false },
  argTypes: { size: { control: "inline-radio", options: ["sm", "default"] } },
} satisfies Meta<typeof SelectTrigger>;
export default meta;

export const Select: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Select"
      description="A pill trigger and a popover with a persistent selected fill and small dot. The anchored fade and scale opens in 250ms and closes in 150ms, with a subtler exit."
    >
      <Section title="Playground">
        <Row>
          <SelectComponent items={items} defaultValue="engineering">
            <SelectTrigger {...args} className="w-56" aria-label="Team">
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent matchTriggerWidth>
              {items.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  disabled={item.value === "operations"}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectComponent>
        </Row>
      </Section>
      <Section title="States">
        <Row label="Empty">
          <SelectComponent items={items}>
            <SelectTrigger className="w-56" aria-label="Empty team">
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectComponent>
        </Row>
        <Row label="Disabled">
          <SelectComponent items={items} defaultValue="design" disabled>
            <SelectTrigger className="w-56" aria-label="Disabled team">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectComponent>
        </Row>
      </Section>
      <Section title="Groups">
        <Row>
          <SelectComponent items={items} defaultValue="design">
            <SelectTrigger className="w-56" aria-label="Grouped team">
              <SelectValue />
            </SelectTrigger>
            <SelectContent matchTriggerWidth>
              <SelectGroup>
                <SelectLabel>Product</SelectLabel>
                {items.slice(0, 2).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Operations</SelectLabel>
                {items.slice(2).map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </SelectComponent>
        </Row>
      </Section>
      <Section title="Scrolling">
        <Row>
          <SelectComponent items={manyItems} defaultValue="1">
            <SelectTrigger className="w-56" aria-label="Long list">
              <SelectValue />
            </SelectTrigger>
            <SelectContent matchTriggerWidth>
              {manyItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectComponent>
        </Row>
      </Section>
    </Showcase>
  ),
};
