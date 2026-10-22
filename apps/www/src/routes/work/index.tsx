import { createFileRoute } from "@tanstack/react-router";
import {
  BreadcrumbLink,
  BreadcrumbSeparator,
  PageHeader,
  useClose,
} from "@/components/page-header";
import { ProjectGrid, WorkGrid } from "@/components/work/grid";
import { components, projects } from "@/components/work/registry";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [{ title: "Work · Manik Rana" }, { property: "og:title", content: "Work · Manik Rana" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  const close = useClose({ to: "/" });
  return (
    <main id="main-content" className="@container">
      <PageHeader onClose={close} className="mx-auto w-[calc(100%-40px)] max-w-stage">
        <BreadcrumbLink to="/">Manik Rana</BreadcrumbLink>
        <BreadcrumbSeparator />
        <span aria-current="page" className="truncate">
          Work
        </span>
      </PageHeader>

      <div className="mx-auto mt-8 w-[calc(100%-40px)] max-w-reading">
        <h1 className="sr-only">Work</h1>
        <h2 className="mb-6 flex gap-2 border-b border-border pb-6 leading-5.5 font-medium">
          Projects <span className="text-muted-foreground">{projects.length}</span>
        </h2>
        <ProjectGrid list="work" />
        <h2
          id="selected-work"
          className="mt-18 mb-6 flex scroll-mt-16 gap-2 border-b border-border pb-6 leading-5.5 font-medium min-[641px]:mt-20"
        >
          Selected work <span className="text-muted-foreground">{components.length}</span>
        </h2>
      </div>
      <WorkGrid list="work" />
    </main>
  );
}
