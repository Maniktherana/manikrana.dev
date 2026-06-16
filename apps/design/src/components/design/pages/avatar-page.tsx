import { CheckIcon, ClockIcon, MapIcon, PlusIcon } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";

const people = [
  {
    name: "Nora Reeves",
    initials: "NR",
    role: "Inventory lead",
    image: "https://i.pravatar.cc/96?img=11",
  },
  {
    name: "Sam Kim",
    initials: "SK",
    role: "Operations",
    image: "https://i.pravatar.cc/96?img=32",
  },
  {
    name: "Mina Rao",
    initials: "MR",
    role: "Catalog",
    image: "https://i.pravatar.cc/96?img=47",
  },
];

function AvatarPage() {
  return (
    <ComponentPageShell title="Avatar">
      <ComponentDemoBand
        label="IMAGE AND FALLBACK"
        className="mt-8 flex flex-wrap items-start gap-8"
      >
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={people[0].image} alt={people[0].name} />
            <AvatarFallback>{people[0].initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="medusa-small-plus">{people[0].name}</span>
            <span className="medusa-small text-muted-foreground">{people[0].role}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>OS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="medusa-small-plus">Offline store</span>
            <span className="medusa-small text-muted-foreground">Fallback initials</span>
          </div>
        </div>
      </ComponentDemoBand>

      <ComponentDemoBand label="SIZES" className="mt-8 flex flex-wrap items-center gap-5">
        <Avatar size="3xs">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <Avatar size="2xs">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <Avatar size="xs">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarImage src={people[1].image} alt={people[1].name} />
          <AvatarFallback>{people[1].initials}</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={people[1].image} alt={people[1].name} />
          <AvatarFallback>{people[1].initials}</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src={people[1].image} alt={people[1].name} />
          <AvatarFallback>{people[1].initials}</AvatarFallback>
        </Avatar>
        <Avatar size="xl">
          <AvatarImage src={people[1].image} alt={people[1].name} />
          <AvatarFallback>{people[1].initials}</AvatarFallback>
        </Avatar>
      </ComponentDemoBand>

      <ComponentDemoBand label="RADIUS" className="mt-8 flex flex-wrap items-center gap-5">
        <Avatar radius="full">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <Avatar radius="rounded">
          <AvatarFallback>MR</AvatarFallback>
        </Avatar>
        <Avatar radius="full">
          <AvatarImage src={people[2].image} alt={people[2].name} />
          <AvatarFallback>{people[2].initials}</AvatarFallback>
        </Avatar>
        <Avatar radius="rounded">
          <AvatarImage src={people[2].image} alt={people[2].name} />
          <AvatarFallback>{people[2].initials}</AvatarFallback>
        </Avatar>
      </ComponentDemoBand>

      <ComponentDemoBand label="ICON CONTENT" className="mt-8 flex flex-wrap items-center gap-5">
        <Avatar size="xs">
          <AvatarFallback>
            <MapIcon />
          </AvatarFallback>
        </Avatar>
        <Avatar size="sm" radius="rounded">
          <AvatarFallback>
            <MapIcon />
          </AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>
            <MapIcon />
          </AvatarFallback>
        </Avatar>
        <Avatar size="lg" radius="rounded">
          <AvatarFallback>
            <MapIcon />
          </AvatarFallback>
        </Avatar>
        <Avatar size="xl">
          <AvatarFallback>
            <MapIcon />
          </AvatarFallback>
        </Avatar>
      </ComponentDemoBand>

      <ComponentDemoBand label="BADGE STATUS" className="mt-8 flex flex-wrap items-center gap-8">
        <div className="medusa-raised flex items-center gap-3 rounded-lg p-2 pr-3">
          <Avatar>
            <AvatarImage src={people[2].image} alt={people[2].name} />
            <AvatarFallback>{people[2].initials}</AvatarFallback>
            <AvatarBadge>
              <CheckIcon />
            </AvatarBadge>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="medusa-small-plus">{people[2].name}</span>
            <span className="medusa-small text-muted-foreground">Available</span>
          </div>
        </div>

        <div className="medusa-raised flex items-center gap-3 rounded-lg p-2 pr-3">
          <Avatar>
            <AvatarImage src={people[0].image} alt={people[0].name} />
            <AvatarFallback>{people[0].initials}</AvatarFallback>
            <AvatarBadge data-status="away">
              <ClockIcon />
            </AvatarBadge>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="medusa-small-plus">{people[0].name}</span>
            <span className="medusa-small text-muted-foreground">Away</span>
          </div>
        </div>
      </ComponentDemoBand>

      <ComponentDemoBand label="GROUP AND COUNT" className="mt-8 flex flex-wrap items-center gap-8">
        <AvatarGroup>
          {people.map((person) => (
            <Avatar key={person.initials}>
              <AvatarImage src={person.image} alt={person.name} />
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>
            <PlusIcon />8
          </AvatarGroupCount>
        </AvatarGroup>

        <AvatarGroup>
          {people.map((person) => (
            <Avatar key={`${person.initials}-small`} size="sm">
              <AvatarImage src={person.image} alt={person.name} />
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>12</AvatarGroupCount>
        </AvatarGroup>
      </ComponentDemoBand>

      <ComponentDemoBand label="IDENTITY ROW" className="mt-8 flex flex-col gap-2">
        {people.map((person) => (
          <div
            key={person.initials}
            className="medusa-raised flex max-w-sm items-center gap-3 rounded-lg p-2"
          >
            <Avatar size="sm">
              <AvatarImage src={person.image} alt={person.name} />
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="medusa-small-plus truncate">{person.name}</p>
              <p className="medusa-small truncate text-muted-foreground">{person.role}</p>
            </div>
          </div>
        ))}
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { AvatarPage };
