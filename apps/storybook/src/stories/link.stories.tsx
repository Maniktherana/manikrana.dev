import { Link as LinkComponent } from "@manikrana/ui/components/ui/link";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Section, Showcase } from "../showcase";

const meta = {
  title: "Primitives/Link",
  component: LinkComponent,
  args: { children: "TurboML", href: "https://turboml.com/" },
} satisfies Meta<typeof LinkComponent>;

export default meta;

export const Link: StoryObj<typeof meta> = {
  render: (args) => (
    <Showcase
      title="Link"
      description="An inline text link: a dim underline that brightens on hover, in a muted paragraph."
    >
      <Section title="Playground">
        <p className="text-sm text-muted-foreground">
          <LinkComponent {...args} target="_blank" rel="noreferrer" />
        </p>
      </Section>
      <Section title="In a paragraph">
        <div className="flex max-w-prose flex-col gap-3 text-sm text-pretty text-muted-foreground">
          <p>
            I'm an engineer at{" "}
            <LinkComponent href="https://turboml.com/" target="_blank" rel="noreferrer">
              TurboML
            </LinkComponent>
            . I build ambitious software with a strong attention to craft, from the systems
            underneath it to the interfaces people actually use.
          </p>
          <p>
            Previously, I worked on{" "}
            <LinkComponent
              href="https://github.com/prometheus/prometheus/issues/14217"
              target="_blank"
              rel="noreferrer"
            >
              Prometheus
            </LinkComponent>{" "}
            through{" "}
            <LinkComponent
              href="https://summerofcode.withgoogle.com/archive/2024/organizations/cncf/"
              target="_blank"
              rel="noreferrer"
            >
              GSoC
            </LinkComponent>
            , where I worked on its OpenMetrics parser.
          </p>
        </div>
      </Section>
    </Showcase>
  ),
};
