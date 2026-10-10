import { Avatar, AvatarImage } from "@manikrana/ui/components/ui/avatar";
import { Button } from "@manikrana/ui/components/ui/button";
import {
  ItemActions,
  Item as ItemComponent,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@manikrana/ui/components/ui/item";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis, Mic } from "lucide-react";
import { type ComponentProps, Fragment } from "react";
import { Row, Section, Showcase } from "../showcase";

type Size = NonNullable<ComponentProps<typeof ItemComponent>["size"]>;

const sizes = ["default", "sm", "xs"] as const satisfies readonly Size[];

const repository = "https://github.com/Maniktherana/talks/tree/main";

// The talks from the site. Their thumbnails are 112 × 70, so a talk row sets
// the image media size and keeps the default row size.
const talks = [
  {
    id: "prometheus",
    folder: "prometheus-parser-talk",
    title: "Go-ing under the hood: the Prometheus parser",
    context: "PyDelhi × PyData Delhi, May 2025",
  },
  {
    id: "observability",
    folder: "observability-talk",
    title: "Intro to Observability",
    context: "FOSS United Delhi, June 2024",
  },
  {
    id: "airflow",
    folder: "airflow-talk",
    title: "Build an ETL pipeline with Apache Airflow",
    context: "FOSS United, Feb 2024 · PyDelhi, Jan 2024",
  },
  {
    id: "rust",
    folder: "first-foray-into-rust-talk",
    title: "My first foray into Rust",
    context: "Rust Delhi, Dec 2023",
  },
];

type Talk = (typeof talks)[number];

/** A talk row: a link to the talk's folder on GitHub. */
function TalkRow({ talk }: { talk: Talk }) {
  return (
    <ItemComponent
      render={
        <a
          href={`${repository}/${talk.folder}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`${talk.title}: slides and code on GitHub`}
        />
      }
    >
      <ItemMedia variant="image" className="h-17.5 w-28">
        <img src={`/talks/${talk.id}-thumb.png`} alt="" width={112} height={70} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{talk.title}</ItemTitle>
        <ItemDescription>{talk.context}</ItemDescription>
      </ItemContent>
    </ItemComponent>
  );
}

/** A link row with a square image, for the playground and sizes. */
function ProfileRow({ size }: { size?: Size | null }) {
  return (
    <ItemComponent
      size={size}
      className="max-w-md flex-1"
      render={
        <a
          href="https://github.com/Maniktherana"
          target="_blank"
          rel="noreferrer"
          aria-label="Manik Rana on GitHub"
        />
      }
    >
      <ItemMedia variant="image">
        <img src="/manik.png" alt="" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Manik Rana</ItemTitle>
        <ItemDescription>Talks, slides and code on GitHub</ItemDescription>
      </ItemContent>
    </ItemComponent>
  );
}

const meta = {
  title: "Primitives/Item",
  component: ItemComponent,
  args: { size: "default" },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
  },
} satisfies Meta<typeof ItemComponent>;

export default meta;

export const Item: StoryObj<typeof meta> = {
  render: ({ size }) => (
    <Showcase
      title="Item"
      description="A row of media, a title and a description, like the site's talk list. Link rows fill on hover and focus."
    >
      <Section title="Playground">
        <ProfileRow size={size} />
      </Section>
      <Section title="Talks">
        {/* Bleed the rows so the thumbnails align with the heading. */}
        <ItemGroup className="-mx-3 max-w-xl">
          {talks.map((talk) => (
            <li key={talk.id}>
              <TalkRow talk={talk} />
            </li>
          ))}
        </ItemGroup>
      </Section>
      <Section title="Sizes">
        {sizes.map((size) => (
          <Row key={size} label={size}>
            <ProfileRow size={size} />
          </Row>
        ))}
      </Section>
      <Section title="Media">
        <Row label="icon">
          <ItemComponent className="max-w-md flex-1">
            <ItemMedia variant="icon">
              <Mic />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Talks</ItemTitle>
              <ItemDescription>Four talks since 2023</ItemDescription>
            </ItemContent>
          </ItemComponent>
        </Row>
        <Row label="default">
          <ItemComponent className="max-w-md flex-1">
            <ItemMedia>
              <Avatar>
                <AvatarImage src="/manik.png" alt="" />
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Manik Rana</ItemTitle>
              <ItemDescription>Any element, such as an avatar</ItemDescription>
            </ItemContent>
          </ItemComponent>
        </Row>
        <Row label="image">
          <ItemComponent className="max-w-md flex-1">
            <ItemMedia variant="image">
              <img src="/talks/rust-thumb.png" alt="" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>My first foray into Rust</ItemTitle>
              <ItemDescription>Rust Delhi, Dec 2023</ItemDescription>
            </ItemContent>
          </ItemComponent>
        </Row>
      </Section>
      <Section title="Actions, header and footer">
        <ItemComponent className="max-w-md">
          <ItemHeader>
            <span className="text-xs text-muted-foreground">Latest talk</span>
            <span className="text-xs text-muted-foreground">May 2025</span>
          </ItemHeader>
          <ItemContent>
            <ItemTitle>{talks[0].title}</ItemTitle>
            <ItemDescription>{talks[0].context}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="icon-sm" aria-label="More options">
              <Ellipsis />
            </Button>
          </ItemActions>
          <ItemFooter>
            <span className="text-xs text-muted-foreground">Slides and code</span>
          </ItemFooter>
        </ItemComponent>
      </Section>
      <Section title="Separated">
        <ItemGroup className="-mx-3 max-w-xl">
          {talks.map((talk, index) => (
            <Fragment key={talk.id}>
              {index > 0 && <ItemSeparator />}
              <li>
                <TalkRow talk={talk} />
              </li>
            </Fragment>
          ))}
        </ItemGroup>
      </Section>
    </Showcase>
  ),
};
