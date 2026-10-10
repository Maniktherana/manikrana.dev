import { useEffect, type CSSProperties } from "react";
import { createFileRoute, Link, notFound, useLocation, useRouter } from "@tanstack/react-router";
import { Button, buttonVariants } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CopyButton } from "@/components/copy-button";
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  GithubIcon,
  SparkleIcon,
} from "@/components/icons";
import { CodeView } from "@/work/code-view";
import { componentPrompt } from "@/work/prompt";
import { findWork, neighbours } from "@/work/registry";
import { getSource } from "@/work/source";
import { setTransitionTarget } from "@/work/transition";
import { details, stages } from "@/work/stages";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const item = findWork(params.slug);
    if (!item) throw notFound();
    const source = item.files ? await getSource({ data: item.slug }) : null;
    return { files: source?.files ?? [], dependencies: source?.dependencies };
  },
  head: ({ params }) => {
    const item = findWork(params.slug);
    if (!item) return {};
    return {
      meta: [
        { title: `${item.title} · Manik Rana` },
        { name: "description", content: item.summary },
        { property: "og:title", content: item.title },
        { property: "og:description", content: item.summary },
      ],
    };
  },
  component: WorkPage,
});

const iconLink =
  "flex size-7 items-center justify-center rounded-lg text-control-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-control hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]";

function WorkPage() {
  const { slug } = Route.useParams();
  const { files, dependencies } = Route.useLoaderData();
  const item = findWork(slug)!;
  const Stage = stages[item.slug];
  const Details = details[item.slug];
  const { previous, next } = neighbours(item.slug);
  const fromGrid = useLocation({ select: (location) => location.state.fromGrid });

  // Going back to the grid morphs this stage into its own tile, whichever tile
  // was opened before previous and next moved on.
  useEffect(() => setTransitionTarget(item.slug), [item.slug]);
  useItemKeys(previous.slug, next.slug, fromGrid);
  usePreload(previous.slug, next.slug);

  return (
    <main id="main-content" className="mx-auto w-[calc(100%-40px)] max-w-stage">
      <header className="flex h-16 items-center justify-between gap-4">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-sm"
        >
          <Link
            to="/"
            className="shrink-0 text-control-foreground transition-[color] duration-150 ease-out hover:text-foreground"
          >
            Manik Rana
          </Link>
          <span aria-hidden="true" className="text-muted-foreground">
            /
          </span>
          <span aria-current="page" className="truncate text-foreground">
            {item.title}
          </span>
        </nav>
        <CloseButton fromGrid={fromGrid} />
      </header>

      {/* Shares its view-transition name with the item's tile on the grid. */}
      <div
        style={{ "--work": `work-${item.slug}` } as CSSProperties}
        className="relative h-[clamp(25rem,54svh,30rem)] overflow-hidden rounded-3xl bg-card [view-transition-name:var(--work)] [view-transition-class:work] sm:h-[clamp(27.5rem,64svh,42.5rem)]"
      >
        {Stage && <Stage />}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-1">
        <h1 className="text-xl leading-snug font-medium text-balance">{item.title}</h1>
        <div className="flex items-center gap-2">
          {item.kind === "component" && dependencies && (
            <CopyButton
              label="Copy prompt"
              copiedLabel="Prompt copied"
              icon={<SparkleIcon />}
              value={() => componentPrompt(item, files, dependencies)}
            />
          )}
          {item.links?.map((link) => {
            const github = link.label === "GitHub";
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={github ? `${item.title} on GitHub` : undefined}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "gap-2 rounded-xl font-normal text-control-foreground hover:text-foreground",
                  github ? "ps-2.5 pe-3" : "ps-3 pe-2.5",
                )}
              >
                {github && <GithubIcon />}
                {link.label}
                {!github && <ArrowUpRightIcon className="text-muted-foreground" />}
              </a>
            );
          })}
          <nav aria-label="Work" className="flex items-center gap-1 rounded-xl bg-control p-1">
            <Link
              to="/$slug"
              params={{ slug: previous.slug }}
              state={{ fromGrid }}
              replace
              aria-label={`Previous: ${previous.title}`}
              aria-keyshortcuts="ArrowLeft"
              title={previous.title}
              className={iconLink}
            >
              <ChevronLeftIcon />
            </Link>
            <Link
              to="/$slug"
              params={{ slug: next.slug }}
              state={{ fromGrid }}
              replace
              aria-label={`Next: ${next.title}`}
              aria-keyshortcuts="ArrowRight"
              title={next.title}
              className={iconLink}
            >
              <ChevronRightIcon />
            </Link>
          </nav>
        </div>
      </div>
      <p className="mt-3 max-w-reading px-1 text-pretty text-muted-foreground">{item.summary}</p>
      {item.uses && (
        <dl className="mt-4 flex flex-wrap items-center gap-1.5 px-1 text-xs leading-none">
          <dt className="me-1 text-muted-foreground">Uses</dt>
          {item.uses.map((use) => (
            <dd key={use} className="rounded-md bg-control px-2 py-1 text-control-foreground">
              {use}
            </dd>
          ))}
        </dl>
      )}

      {Details && <Details />}
      {files.length > 0 && (
        <CodeView
          files={files}
          included={item.included}
          notIncluded={item.notIncluded}
          dependencies={item.kind === "component" ? dependencies : undefined}
        />
      )}
    </main>
  );
}

// Keys that belong to whatever has focus: text, sliders, menus and the dev panel.
const OWNS_KEYS =
  'input, textarea, select, [contenteditable], [role="slider"], [role="tablist"], [role="menu"], [role="listbox"], .dialkit-root';

// Escape closes the page like the close button, and the arrow keys step to the
// previous and next item like the arrow buttons.
function useItemKeys(previous: string, next: string, fromGrid?: boolean) {
  const router = useRouter();
  const navigate = Route.useNavigate();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof Element && event.target.closest(OWNS_KEYS)) return;
      if (event.key === "Escape") {
        if (fromGrid) router.history.back();
        else void navigate({ to: "/" });
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const slug = event.key === "ArrowLeft" ? previous : next;
        void navigate({ to: "/$slug", params: { slug }, state: { fromGrid }, replace: true });
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fromGrid, navigate, next, previous, router]);
}

// The arrows and arrow keys step to these items, so their pages load ahead.
function usePreload(previous: string, next: string) {
  const router = useRouter();
  useEffect(() => {
    void router.preloadRoute({ to: "/$slug", params: { slug: previous } });
    void router.preloadRoute({ to: "/$slug", params: { slug: next } });
  }, [previous, next, router]);
}

// Opened from the grid, close steps back to it, so the grid keeps its scroll
// and the stage folds back into its tile. Previous and next replace the entry,
// so back still lands on the grid. Arriving any other way, close opens the grid.
function CloseButton({ fromGrid }: { fromGrid?: boolean }) {
  const router = useRouter();
  const className = "rounded-xl text-control-foreground hover:text-foreground";
  if (fromGrid) {
    return (
      <Button
        variant="secondary"
        size="icon"
        aria-label="Close"
        aria-keyshortcuts="Escape"
        className={className}
        onClick={() => router.history.back()}
      >
        <CloseIcon />
      </Button>
    );
  }
  return (
    <Link
      to="/"
      aria-label="Close"
      aria-keyshortcuts="Escape"
      className={cn(buttonVariants({ variant: "secondary", size: "icon" }), className)}
    >
      <CloseIcon />
    </Link>
  );
}
