import { createFileRoute } from "@tanstack/react-router";
import {
  BreadcrumbLink,
  BreadcrumbSeparator,
  PageHeader,
  useClose,
} from "@/components/page-header";
import { ProjectGrid, WorkGrid } from "@/components/work/grid";
import { components, projects } from "@/components/work/registry";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [{ title: "Work · Manik Rana" }, { property: "og:title", content: "Work · Manik Rana" }],
  }),
  component: WorkPage,
});

const INTO_VIEW = { block: "center", behavior: "instant" } as const;

function WorkPage() {
  const close = useClose({ to: "/", hash: "work-title", hashScrollIntoView: INTO_VIEW });
  return (
    <main id="main-content" className="@container">
      <div className="mx-auto w-[calc(100%-40px)] max-w-stage">
        <PageHeader onClose={close}>
          <BreadcrumbLink to="/" hash="work-title">
            Manik Rana
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <span aria-current="page" className="truncate text-foreground">
            Work
          </span>
        </PageHeader>
      </div>

      <div className="mx-auto mt-8 w-[calc(100%-40px)] max-w-reading">
        <h1 className="mb-6 border-b border-border pb-6 leading-5.5 font-medium">Work</h1>
        <h2 className="mb-4 flex gap-2 leading-5.5 text-muted-foreground">
          Projects <span>{projects.length}</span>
        </h2>
        <ProjectGrid list="work" />
        <h2 id="selected-work" className="mt-12 mb-4 flex gap-2 leading-5.5 text-muted-foreground">
          Selected work <span>{components.length}</span>
        </h2>
      </div>
      <WorkGrid list="work" />
    </main>
  );
}
