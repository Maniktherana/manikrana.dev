import { AgentsimsProjectPreview, GustProjectPreview } from "@/routes/-components/project-previews";
import { projects } from "@/components/work/registry";

const previews = {
  agentsims: AgentsimsProjectPreview,
  gust: GustProjectPreview,
};

export function ProjectList() {
  return (
    <ul>
      {projects.map((project) => {
        const Preview = previews[project.slug];
        return (
          <li key={project.slug}>
            <a
              href={project.links[0].href}
              target="_blank"
              rel="noreferrer"
              className="row-link flex items-center gap-4 py-3"
            >
              <div
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-lg bg-plot p-1 shadow-canvas"
              >
                <Preview />
              </div>
              <span className="min-w-0">
                <span className="block leading-5.5 font-medium">{project.title}</span>
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
