import { AgentsimsProjectPreview, GustProjectPreview } from "@/routes/-components/project-previews";
import { projects } from "@/components/work/registry";

const previews = {
  agentsims: AgentsimsProjectPreview,
  gust: GustProjectPreview,
};

export function ProjectList() {
  return (
    <ul className="space-y-1">
      {projects.map((project) => {
        const Preview = previews[project.slug];
        return (
          <li key={project.slug}>
            <a
              href={project.links[0].href}
              target="_blank"
              rel="noreferrer"
              className="group/project flex items-start gap-3 rounded-xl py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div
                aria-hidden="true"
                className="h-12 w-12 shrink-0 rounded-lg bg-plot p-1 shadow-canvas"
              >
                <Preview />
              </div>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 leading-5.5">
                  <span className="font-medium decoration-muted-foreground/50 decoration-1 underline-offset-3 group-hover/project:underline">
                    {project.title}
                  </span>
                </span>
                <span className="mt-1 block leading-5.5 text-muted-foreground">
                  {project.tagline}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
