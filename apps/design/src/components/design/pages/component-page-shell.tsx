import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon, ComponentIcon } from "lucide-react";

import { componentCatalog } from "@/components/design/component-catalog";
import { ThemeToggle } from "@/components/design/theme-toggle";

function ComponentPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  const componentIndex = componentCatalog.findIndex((component) => component.title === title);
  const previousComponent = componentIndex > 0 ? componentCatalog[componentIndex - 1] : undefined;
  const nextComponent =
    componentIndex >= 0 && componentIndex < componentCatalog.length - 1
      ? componentCatalog[componentIndex + 1]
      : undefined;

  return (
    <main data-medusa className="overflow-x-auto">
      <div className="medusa-shell medusa-figma-page">
        <section className="medusa-band">
          <div className="medusa-band-inner medusa-filebar">
            <div className="flex items-center gap-2">
              <ComponentIcon className="size-[15px]" />
              <span className="medusa-compact-plus">Components</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{title}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="medusa-figma-icon">@</span>
              <ComponentIcon className="size-[15px]" />
              <ComponentIcon className="size-[15px]" />
              <span className="medusa-figma-icon">o</span>
              <span>Medusa UI</span>
              <ThemeToggle />
            </div>
          </div>
        </section>

        <section className="medusa-band medusa-figma-header-band">
          <div className="medusa-band-inner">
            <h1>{title}</h1>
          </div>
        </section>

        {children}

        <section className="medusa-band">
          <div className="medusa-band-inner medusa-figma-items-inner">
            <p className="medusa-code-label">Catalog Navigation</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {previousComponent ? (
                <Link
                  to="/components/$componentId"
                  params={{ componentId: previousComponent.id }}
                  className="medusa-raised group flex min-h-20 items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
                >
                  <ArrowLeftIcon className="text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                  <span className="min-w-0">
                    <span className="medusa-code-label block">Previous</span>
                    <span className="medusa-small-plus mt-1 block">{previousComponent.title}</span>
                  </span>
                </Link>
              ) : (
                <div className="medusa-raised flex min-h-20 items-center gap-4 p-4 opacity-60">
                  <ArrowLeftIcon className="text-muted-foreground" />
                  <span>
                    <span className="medusa-code-label block">Previous</span>
                    <span className="medusa-small mt-1 block">Start of catalog</span>
                  </span>
                </div>
              )}

              {nextComponent ? (
                <Link
                  to="/components/$componentId"
                  params={{ componentId: nextComponent.id }}
                  className="medusa-raised group flex min-h-20 items-center justify-between gap-4 p-4 text-right transition-transform hover:-translate-y-0.5"
                >
                  <span className="min-w-0">
                    <span className="medusa-code-label block">Next</span>
                    <span className="medusa-small-plus mt-1 block">{nextComponent.title}</span>
                  </span>
                  <ArrowRightIcon className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <div className="medusa-raised flex min-h-20 items-center justify-between gap-4 p-4 text-right opacity-60">
                  <span>
                    <span className="medusa-code-label block">Next</span>
                    <span className="medusa-small mt-1 block">End of catalog</span>
                  </span>
                  <ArrowRightIcon className="text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="medusa-band medusa-figma-footer-band">
          <div className="medusa-band-inner" />
        </section>
      </div>
    </main>
  );
}

function ComponentDemoBand({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="medusa-band">
      <div className="medusa-band-inner medusa-figma-items-inner">
        <p className="medusa-code-label">{label}</p>
        <div className={className ?? "mt-8 flex flex-wrap items-start gap-8"}>{children}</div>
      </div>
    </section>
  );
}

export { ComponentDemoBand, ComponentPageShell };
