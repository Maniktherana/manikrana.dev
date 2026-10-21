import {
  InputGroup as InputGroupComponent,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@manikrana/ui/components/ui/input-group";
import { Kbd } from "@manikrana/ui/components/ui/kbd";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowUp, Search, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Row, Section, Showcase } from "../showcase";

type InputProps = ComponentProps<typeof InputGroupInput>;

function SearchPill({
  input,
  ...props
}: ComponentProps<typeof InputGroupComponent> & { input?: InputProps }) {
  return (
    <InputGroupComponent className="w-72" {...props}>
      <InputGroupInput placeholder="Search" aria-label="Search components" {...input} />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Kbd>⌘K</Kbd>
      </InputGroupAddon>
    </InputGroupComponent>
  );
}

const addons: { label: string; start?: ReactNode; end?: ReactNode }[] = [
  { label: "Icon", start: <Search /> },
  { label: "Kbd", end: <Kbd>⌘K</Kbd> },
  { label: "Both", start: <Search />, end: <Kbd>⌘K</Kbd> },
  {
    label: "Icon button",
    start: <Search />,
    end: (
      <InputGroupButton size="icon-xs" aria-label="Clear">
        <X />
      </InputGroupButton>
    ),
  },
  { label: "Button", start: <Search />, end: <InputGroupButton>Clear</InputGroupButton> },
];

const states = [
  { label: "Value", input: { defaultValue: "Toggle group" } },
  { label: "Disabled", input: { disabled: true } },
  { label: "Invalid", input: { "aria-invalid": true, defaultValue: "Toggle grop" } },
] satisfies { label: string; input: InputProps }[];

const meta = {
  title: "Primitives/InputGroup",
  component: InputGroupComponent,
  args: { bordered: false },
} satisfies Meta<typeof InputGroupComponent>;

export default meta;

export const InputGroup: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="InputGroup"
      description="The group is the pill and the input inside it is transparent, so icons, shortcuts and buttons share one centered surface."
    >
      <Section title="Playground">
        <Row>
          <SearchPill {...args} />
        </Row>
      </Section>
      <Section title="Edge">
        {[false, true].map((bordered) => (
          <Row key={String(bordered)} label={bordered ? "Bordered" : "Flat"}>
            <SearchPill bordered={bordered} />
          </Row>
        ))}
      </Section>
      <Section title="Addons">
        {addons.map(({ label, start, end }) => (
          <Row key={label} label={label}>
            <InputGroupComponent className="w-72">
              <InputGroupInput placeholder="Search" aria-label="Search components" />
              {start && <InputGroupAddon>{start}</InputGroupAddon>}
              {end && <InputGroupAddon align="inline-end">{end}</InputGroupAddon>}
            </InputGroupComponent>
          </Row>
        ))}
      </Section>
      <Section title="Block addons">
        <Row label="Textarea">
          <InputGroupComponent className="w-80">
            <InputGroupTextarea placeholder="Describe the component" aria-label="Description" />
            <InputGroupAddon align="block-start">
              <InputGroupText>Description</InputGroupText>
            </InputGroupAddon>
            <InputGroupAddon align="block-end">
              <InputGroupText>280 characters left</InputGroupText>
              <InputGroupButton size="sm" className="ml-auto">
                Cancel
              </InputGroupButton>
              <InputGroupButton size="icon-sm" variant="default" aria-label="Send">
                <ArrowUp />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroupComponent>
        </Row>
      </Section>
      <Section title="States">
        {states.map(({ label, input }) => (
          <Row key={label} label={label}>
            <SearchPill input={input} />
          </Row>
        ))}
      </Section>
    </Showcase>
  ),
};
