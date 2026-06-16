import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRightIcon, ComponentIcon } from "lucide-react";

import { componentCatalog, featuredComponentIds } from "@/components/design/component-catalog";
import { ComponentMapIcon } from "@/components/design/component-map-icon";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: DesignIndex });

const featured = componentCatalog.filter((component) =>
  featuredComponentIds.includes(component.id),
);

function DesignIndex() {
  return (
    <main data-medusa className="overflow-x-hidden">
      <div className="medusa-shell">
        <section className="medusa-band">
          <div className="medusa-band-inner medusa-filebar">
            <div className="flex items-center gap-2">
              <ComponentIcon />
              <span className="medusa-compact-plus">Components</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">Medusa shadcn Base</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ComponentIcon />
              <span className="hidden sm:inline">Medusa UI</span>
              <ThemeToggle />
            </div>
          </div>
        </section>

        <section className="medusa-band">
          <div className="medusa-band-inner py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <h1 className="max-w-6xl text-[clamp(2.75rem,5vw,5.5rem)]">
                  Medusa UI components mapped to shadcn Base.
                </h1>
                <p className="medusa-small mt-5 max-w-2xl">
                  A separate TanStack Start app for testing actual shadcn Base primitives with a
                  Figma-derived Medusa token layer. The main landing page remains untouched.
                </p>
              </div>
              <div className="medusa-raised p-4">
                <p className="medusa-code-label">Implementation Contract</p>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span>Base UI primitives</span>
                    <Badge variant="secondary">installed</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Medusa CSS layer</span>
                    <Badge variant="secondary">isolated</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Prompt/chat</span>
                    <Badge variant="outline">composed</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="medusa-band">
          <div className="medusa-band-inner py-12">
            <div className="medusa-bento gap-4">
              <article className="medusa-raised col-span-5 row-span-2 flex flex-col justify-between p-5">
                <div>
                  <p className="medusa-code-label">Component Map</p>
                  <h2 className="mt-3">Every requested item is accounted for.</h2>
                  <p className="medusa-small mt-3">
                    Registry primitives stay in `src/components/ui`; Medusa and Prompt Kit inspired
                    compositions live in `src/components/design`.
                  </p>
                </div>
                <Button
                  className="mt-8 w-fit"
                  render={
                    <Link to="/components/$componentId" params={{ componentId: "accordion" }} />
                  }
                >
                  Start with Accordion
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </article>
              {featured.slice(1).map((component, index) => (
                <Link
                  key={component.id}
                  to="/components/$componentId"
                  params={{ componentId: component.id }}
                  className={`medusa-raised group flex min-h-44 flex-col justify-between overflow-hidden p-4 transition-transform hover:-translate-y-0.5 ${
                    index % 2 === 0 ? "col-span-4" : "col-span-3"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <ComponentMapIcon id={component.id} />
                    <Badge variant={component.custom ? "outline" : "secondary"}>
                      {component.custom ? "composed" : "primitive"}
                    </Badge>
                  </div>
                  <div>
                    <h3>{component.title}</h3>
                    <p className="medusa-small mt-1 line-clamp-2">{component.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="medusa-band">
          <div className="medusa-band-inner py-12">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="medusa-code-label">All Components</p>
                <h2 className="mt-3">Primitive mapping</h2>
              </div>
              <Badge variant="outline">{componentCatalog.length} entries</Badge>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {componentCatalog.map((component) => (
                <Link
                  key={component.id}
                  to="/components/$componentId"
                  params={{ componentId: component.id }}
                  className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <ComponentMapIcon id={component.id} />
                  <span className="min-w-0 flex-1">
                    <span className="medusa-small-plus block">{component.title}</span>
                    <span className="medusa-small line-clamp-2">{component.primitive}</span>
                  </span>
                  <ArrowRightIcon className="opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="medusa-band">
          <div className="medusa-band-inner overflow-hidden py-12">
            <div className="medusa-marquee flex w-max gap-8 whitespace-nowrap text-[40px] leading-none font-medium tracking-[-0.04em] text-muted-foreground">
              {[...componentCatalog, ...componentCatalog].map((component, index) => (
                <span key={`${component.id}-${index}`}>{component.title}</span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
