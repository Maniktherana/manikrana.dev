import { createFileRoute } from "@tanstack/react-router";
import { HomeBreadcrumb, BreadcrumbSeparator, PageHeader } from "@/components/page-header";
import { WorkGrid } from "@/components/work/grid";
import { work } from "@/components/work/registry";

export const Route = createFileRoute("/lab/")({
  head: () => ({
    meta: [{ title: "Lab · Manik Rana" }, { property: "og:title", content: "Lab · Manik Rana" }],
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
          Lab
        </span>
      </PageHeader>

      <div className="mx-auto mt-8 w-[calc(100%-40px)] max-w-reading">
        <h1 className="sr-only">Lab</h1>
        <h2
          id="selected-work"
          className="heading-rule mb-6 scroll-mt-16 text-lg leading-tight font-medium"
        >
          <span className="flex items-baseline gap-2">
            Lab <span className="text-base font-normal text-muted-foreground">{work.length}</span>
          </span>
        </h2>
      </div>
      <WorkGrid list="work" />
    </main>
  );
}
