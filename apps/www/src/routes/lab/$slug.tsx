import { useEffect, useState, type CSSProperties } from "react";
import { Gust } from "@maniktherana/gust";
import { AnimatePresence } from "motion/react";
import { createFileRoute, Link, notFound, useLocation, useRouter } from "@tanstack/react-router";
import { PresenceFade } from "@manikrana/ui/components/motion/presence-fade";
import { IconSwap } from "@manikrana/ui/components/motion/icon-swap";
import { Button, buttonVariants } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { CopyButton } from "@/components/copy-button";
import { BreadcrumbLink, BreadcrumbSeparator, PageHeader } from "@/components/page-header";
import { Link as TextLink } from "@/components/link";
import { play } from "@/lib/sounds";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right";
import { ChevronLeftIcon } from "@/components/icons/chevron-left";
import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { CodeIcon } from "@/components/icons/code";
import { EyeIcon } from "@/components/icons/eye";
import { GithubIcon } from "@/components/icons/github";
import { CodeView } from "@/routes/lab/-components/code-view";
import { componentPrompt } from "@/routes/lab/-components/prompt";
import {
  findWork,
  neighbours,
  plainSummary,
  SUMMARY_LINK,
  type WorkItem,
  type WorkList,
} from "@/components/work/registry";
import { getSource } from "@/components/work/source";
import { setTransitionTarget } from "@/components/work/transition";
import { details, stages } from "@/components/work/stages";

export const Route = createFileRoute("/lab/$slug")({
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
        { name: "description", content: plainSummary(item) },
        { property: "og:title", content: item.title },
        { property: "og:description", content: plainSummary(item) },
      ],
    };
  },
  component: WorkPage,
});

const STEP = { types: ["step"] };

const iconLink =
  "flex size-7 items-center justify-center rounded-lg text-control-foreground transition-[background-color,color,scale] duration-150 ease-out outline-none hover:bg-button-secondary-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]";

function WorkPage() {
  const { slug } = Route.useParams();
  const { files, dependencies } = Route.useLoaderData();
  const item = findWork(slug)!;
  const Stage = stages[item.slug];
  const Details = details[item.slug];
  const { previous, next } = neighbours(item.slug);
  const [grid] = useState(useLocation({ select: (location) => location.state.grid }));
  const close = useClose(item, grid);
  const [codeFor, setCodeFor] = useState<string>();
  const showCode = codeFor === item.slug && files.length > 0;
  const fadeIn =
    useStepped(item.slug) && "motion-safe:animate-in motion-safe:fade-in duration-200 ease-out";

  useEffect(() => setTransitionTarget(item.slug, "work"), [item.slug]);
  useItemKeys(previous.slug, next.slug, grid, close);
  usePreload(previous.slug, next.slug);

  return (
    <main id="main-content" className="mx-auto min-h-svh w-[calc(100%-40px)] max-w-stage">
      <PageHeader>
        <BreadcrumbLink to="/">Manik Rana</BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbLink
          to="/lab"
          hash={item.slug}
          hashScrollIntoView={TILE_INTO_VIEW}
          aria-keyshortcuts="Escape"
          onClick={(event) => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            event.preventDefault();
            close();
          }}
        >
          Lab
        </BreadcrumbLink>
        <BreadcrumbSeparator />
        <Gust motion={{ exitBlur: 2 }} aria-current="page" className="min-w-0">
          {item.title}
        </Gust>
      </PageHeader>

      <div
        data-slot="stage"
        className="@container-size grid h-[clamp(25rem,54svh,30rem)] place-items-center sm:h-[clamp(27.5rem,64svh,42.5rem)]"
      >
        <div
          data-morph
          style={{ "--work": `work-${item.slug}` } as CSSProperties}
          className={cn(
            "relative overflow-hidden rounded-3xl bg-card [view-transition-name:var(--work)] [view-transition-class:work]",
            item.tile === "video" && !showCode
              ? "aspect-video w-[min(100cqw,100cqh*16/9)] rounded-[calc(min(100cqw,100cqh*16/9)/64)]"
              : "size-full",
          )}
        >
          {showCode ? <CodeView key={item.slug} files={files} /> : Stage && <Stage />}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:mt-6">
        <div className="grid gap-x-4 gap-y-5 px-1 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="relative flex flex-wrap items-center justify-end gap-2 sm:col-start-2 sm:row-start-1">
            <AnimatePresence initial={false} mode="popLayout" anchorX="right">
              {files.length > 0 && (
                <PresenceFade key="view-toggle">
                  <ViewToggle
                    code={showCode}
                    onChange={(code) => setCodeFor(code ? item.slug : undefined)}
                  />
                </PresenceFade>
              )}
              {item.kind === "component" && dependencies && (
                <PresenceFade key="copy-prompt">
                  <CopyButton
                    label="Copy prompt"
                    copiedLabel="Prompt copied"
                    sound="success"
                    value={() => componentPrompt(item, files, dependencies)}
                  />
                </PresenceFade>
              )}
              {item.links?.map((link) => {
                const github = link.label === "GitHub";
                return (
                  <PresenceFade
                    as="a"
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={github ? `${item.title} on GitHub` : undefined}
                    title={github ? "GitHub" : undefined}
                    className={cn(
                      buttonVariants({ variant: "resource", size: github ? "icon" : "default" }),
                      !github && "gap-2 ps-3 pe-2.5",
                    )}
                  >
                    {github ? (
                      <GithubIcon />
                    ) : (
                      <>
                        {link.label}
                        <ArrowUpRightIcon className="text-muted-foreground" />
                      </>
                    )}
                  </PresenceFade>
                );
              })}
            </AnimatePresence>
            <nav
              aria-label="Lab"
              className="flex items-center gap-1 rounded-xl bg-button-secondary p-1"
            >
              <Link
                to="/lab/$slug"
                params={{ slug: previous.slug }}
                state={{ grid }}
                replace
                viewTransition={STEP}
                aria-label={`Previous: ${previous.title}`}
                aria-keyshortcuts="ArrowLeft"
                title={previous.title}
                className={iconLink}
              >
                <ChevronLeftIcon />
              </Link>
              <Link
                to="/lab/$slug"
                params={{ slug: next.slug }}
                state={{ grid }}
                replace
                viewTransition={STEP}
                aria-label={`Next: ${next.title}`}
                aria-keyshortcuts="ArrowRight"
                title={next.title}
                className={iconLink}
              >
                <ChevronRightIcon />
              </Link>
            </nav>
          </div>
          <h1
            key={item.slug}
            className={cn(
              "text-xl leading-snug font-medium text-balance sm:col-start-1 sm:row-start-1",
              fadeIn,
            )}
          >
            {item.title}
          </h1>
        </div>
        <div key={item.slug} className={cn("flex flex-col gap-16", fadeIn)}>
          <div className="flex flex-col gap-4 px-1">
            <p className="max-w-reading text-pretty text-muted-foreground">
              <Summary text={item.summary} />
            </p>
            {item.uses && (
              <dl className="flex flex-wrap items-center gap-1.5 text-xs leading-none">
                <dt className="me-1 text-muted-foreground">Uses</dt>
                {item.uses.map((use) => (
                  <dd key={use} className="rounded-md bg-control px-2 py-1 text-control-foreground">
                    {use}
                  </dd>
                ))}
              </dl>
            )}
          </div>

          {Details && <Details />}
        </div>
      </div>
    </main>
  );
}

function ViewToggle({ code, onChange }: { code: boolean; onChange: (code: boolean) => void }) {
  return (
    <Button
      variant="resource"
      size="icon"
      aria-label={code ? "Show preview" : "Show code"}
      title={code ? "Preview" : "Code"}
      onClick={() => onChange(!code)}
    >
      <IconSwap state={code ? "b" : "a"} a={<CodeIcon />} b={<EyeIcon />} className="size-4" />
    </Button>
  );
}

function useStepped(slug: string) {
  const [first] = useState(slug);
  const [stepped, setStepped] = useState(false);
  if (!stepped && slug !== first) setStepped(true);
  return stepped;
}

const OWNS_KEYS =
  'input, textarea, select, [contenteditable], [role="slider"], [role="tablist"], [data-slot="code-view"], [role="menu"], [role="listbox"], [role="dialog"], .dialkit-root';

function useItemKeys(
  previous: string,
  next: string,
  grid: WorkList | undefined,
  close: () => void,
) {
  const navigate = Route.useNavigate();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof Element && event.target.closest(OWNS_KEYS)) return;
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const slug = event.key === "ArrowLeft" ? previous : next;
        void navigate({
          to: "/lab/$slug",
          params: { slug },
          state: { grid },
          replace: true,
          viewTransition: STEP,
        });
      } else {
        return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, grid, navigate, next, previous]);
}

function usePreload(previous: string, next: string) {
  const router = useRouter();
  useEffect(() => {
    void router.preloadRoute({ to: "/lab/$slug", params: { slug: previous } });
    void router.preloadRoute({ to: "/lab/$slug", params: { slug: next } });
  }, [previous, next, router]);
}

const TILE_INTO_VIEW = { block: "center", behavior: "instant" } as const;

// history.back() keeps the work page's scroll, so previous and next must replace, not push.
function useClose(item: WorkItem, grid: WorkList | undefined) {
  const router = useRouter();
  return () => {
    play("page-exit");
    if (grid === "work") return router.history.back();
    void router.navigate({
      to: "/lab",
      hash: item.slug,
      hashScrollIntoView: TILE_INTO_VIEW,
      replace: grid !== undefined,
    });
  };
}

function Summary({ text }: { text: string }) {
  const parts = text.split(SUMMARY_LINK);
  return parts.map((part, index) =>
    index % 3 === 1 ? (
      <TextLink key={index} href={parts[index + 1]} target="_blank" rel="noreferrer">
        {part}
      </TextLink>
    ) : index % 3 === 0 ? (
      part
    ) : null,
  );
}
