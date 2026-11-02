import { createFileRoute } from "@tanstack/react-router";
import { HomeBreadcrumb, BreadcrumbSeparator, PageHeader } from "@/components/page-header";
import { WorkGrid } from "@/components/work/grid";
import { work } from "@/components/work/registry";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [{ title: "Work · Manik Rana" }, { property: "og:title", content: "Work · Manik Rana" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <main id="main-content" className="@container">
      <PageHeader className="mx-auto w-[calc(100%-40px)] max-w-stage">
        <HomeBreadcrumb />
        <BreadcrumbSeparator />
        <span aria-current="page" className="truncate">
          Work
        </span>
      </PageHeader>

      <div className="mx-auto mt-8 w-[calc(100%-40px)] max-w-reading">
        <h1 className="sr-only">Work</h1>
        <h2
          id="selected-work"
          className="mb-6 flex scroll-mt-16 items-baseline gap-2 border-b border-separator pb-6 text-lg leading-tight font-semibold"
        >
          Lab <span className="text-base font-normal text-muted-foreground">{work.length}</span>
        </h2>
      </div>
      <WorkGrid list="work" />
    </main>
  );
}
