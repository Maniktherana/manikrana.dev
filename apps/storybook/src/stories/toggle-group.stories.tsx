import {
  ToggleGroup as ToggleGroupComponent,
  ToggleGroupItem,
} from "@manikrana/ui/components/ui/toggle-group";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Row, Section, Showcase } from "../showcase";

const filters = ["All", "Essential", "Effects", "Texts", "Pro"] as const;
const sizes = ["sm", "default", "lg"] as const;

type GroupProps = Omit<ComponentProps<typeof ToggleGroupComponent>, "children">;

function Filters(props: GroupProps) {
  return (
    <ToggleGroupComponent aria-label="Filter components" {...props}>
      {filters.map((filter) => (
        <ToggleGroupItem key={filter} value={filter}>
          {filter}
        </ToggleGroupItem>
      ))}
    </ToggleGroupComponent>
  );
}

const selections = [
  { label: "Single", props: { defaultValue: ["All"] } },
  { label: "Multiple", props: { multiple: true, defaultValue: ["Essential", "Effects"] } },
] satisfies { label: string; props: GroupProps }[];

const states = [
  { label: "Disabled", props: { disabled: true, defaultValue: ["All"] } },
  { label: "Static", props: { static: true, defaultValue: ["All"] } },
] satisfies { label: string; props: GroupProps }[];

const meta = {
  title: "Primitives/ToggleGroup",
  component: ToggleGroupComponent,
  args: {
    "aria-label": "Filter components",
    defaultValue: ["All"],
    multiple: false,
    size: "default",
    bordered: true,
    static: false,
    disabled: false,
    orientation: "horizontal",
  },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof ToggleGroupComponent>;

export default meta;

export const ToggleGroup: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="ToggleGroup"
      description="A row of filter chips, 8px apart, like transitions.dev's. Pressing a chip in a single group releases the others."
    >
      <Section title="Playground">
        <Row>
          <Filters {...args} />
        </Row>
      </Section>
      <Section title="Edge">
        {[true, false].map((bordered) => (
          <Row key={String(bordered)} label={bordered ? "Bordered" : "Flat"}>
            <Filters bordered={bordered} defaultValue={["All"]} />
          </Row>
        ))}
      </Section>
      <Section title="Selection">
        {selections.map(({ label, props }) => (
          <Row key={label} label={label}>
            <Filters {...props} />
          </Row>
        ))}
      </Section>
      <Section title="Sizes">
        {sizes.map((size) => (
          <Row key={size} label={size}>
            <Filters size={size} defaultValue={["All"]} />
          </Row>
        ))}
      </Section>
      <Section title="Orientation">
        <Row label="Vertical">
          <Filters orientation="vertical" defaultValue={["All"]} />
        </Row>
      </Section>
      <Section title="States">
        {states.map(({ label, props }) => (
          <Row key={label} label={label}>
            <Filters {...props} />
          </Row>
        ))}
        <Row label="One disabled">
          <ToggleGroupComponent aria-label="Filter components" defaultValue={["All"]}>
            {filters.map((filter) => (
              <ToggleGroupItem key={filter} value={filter} disabled={filter === "Pro"}>
                {filter}
              </ToggleGroupItem>
            ))}
          </ToggleGroupComponent>
        </Row>
      </Section>
    </Showcase>
  ),
};
