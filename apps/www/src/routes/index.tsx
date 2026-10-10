import { createFileRoute } from "@tanstack/react-router";
import { InlineLink } from "@/components/inline-link";
import { AnimatedRing } from "@manikrana/ui/components/animated-ring";
import { Avatar, AvatarImage, AvatarFallback } from "@manikrana/ui/components/ui/avatar";
import { Link } from "@manikrana/ui/components/ui/link";
import { Backdrop } from "@/components/backdrop";
import { Segmented } from "@/components/segmented";
import { cn } from "@manikrana/ui/lib/utils";
import { useFirstVisit } from "@/lib/use-first-visit";
import { WorkGrid } from "@/work/grid";
import { filters, work, type Filter } from "@/work/registry";

export const Route = createFileRoute("/")({
  // The grid's filter lives in the URL, so it survives opening a tile and
  // coming back. "All" is the bare URL.
  validateSearch: (search: Record<string, unknown>): { show?: Exclude<Filter, "all"> } => {
    const show = filters.find((filter) => filter.value === search.show)?.value;
    return show && show !== "all" ? { show } : {};
  },
  component: Home,
});

const filterOptions = filters.map((filter) => ({
  ...filter,
  count:
    filter.value === "all" ? work.length : work.filter((item) => item.kind === filter.value).length,
}));

function Home() {
  const { show = "all" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const first = useFirstVisit();
  return (
    <main
      id="main-content"
      className={cn(
        "grid grid-cols-1 gap-18 pt-14 min-[641px]:gap-20 min-[641px]:pt-24",
        first && "entering",
      )}
    >
      <Backdrop />
      <section
        id="home"
        aria-labelledby="intro-title"
        className="mx-auto w-[calc(100%-40px)] max-w-reading"
      >
        <div>
          <header className="reveal mb-5 flex items-center gap-3">
            <AnimatedRing className="portrait-glow size-12 [--ring-radius:14px]">
              <Avatar size="xl" className="size-full rounded-[calc(var(--ring-radius)_-_5px)]">
                <AvatarImage
                  src="/avatar.webp"
                  alt="Manik Rana"
                  width={38}
                  height={38}
                  fetchPriority="high"
                  className="rounded-[inherit]"
                />
                <AvatarFallback className="rounded-[inherit]">MR</AvatarFallback>
              </Avatar>
            </AnimatedRing>
            <div>
              <h1 id="intro-title" className="text-base leading-5.5 font-medium">
                Manik Rana
              </h1>
              <p className="text-muted-foreground font-[450] leading-5.5">Engineer at TurboML</p>
            </div>
          </header>
          <p className="mb-3 text-pretty text-muted-foreground last:mb-0 reveal [--i:1]">
            I'm an engineer at{" "}
            <InlineLink href="https://turboml.com/" mark="turboml">
              TurboML
            </InlineLink>
            . I build ambitious software with a strong attention to craft, from the systems
            underneath it to the interfaces people actually use.
          </p>
          <p className="mb-3 text-pretty text-muted-foreground last:mb-0 reveal [--i:2]">
            Previously, I worked on{" "}
            <InlineLink
              href="https://github.com/prometheus/prometheus/issues/14217"
              mark="prometheus"
            >
              Prometheus
            </InlineLink>{" "}
            through{" "}
            <InlineLink
              href="https://summerofcode.withgoogle.com/archive/2024/organizations/cncf/"
              mark="gsoc"
            >
              GSoC
            </InlineLink>
            , where I worked on its OpenMetrics parser and cut memory use by up to{" "}
            <InlineLink
              href="https://github.com/prometheus/prometheus/pull/15097#issuecomment-2404777959"
              tone="memory"
            >
              10x
            </InlineLink>
            .
          </p>
          <p className="mb-3 text-pretty text-muted-foreground last:mb-0 reveal [--i:3]">
            You can reach me at{" "}
            <Link
              className="font-[450] motion-safe:duration-200 motion-safe:ease-[ease] motion-reduce:transition-none"
              href="https://twitter.com/ManikMkr"
              target="_blank"
              rel="noreferrer"
            >
              @ManikMkr
            </Link>
            , by{" "}
            <Link
              className="font-[450] motion-safe:duration-200 motion-safe:ease-[ease] motion-reduce:transition-none"
              href="mailto:hello@manikrana.dev"
            >
              email
            </Link>{" "}
            or see my code on{" "}
            <Link
              className="font-[450] motion-safe:duration-200 motion-safe:ease-[ease] motion-reduce:transition-none"
              href="https://github.com/Maniktherana"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="work-title" className="reveal [--i:4]">
        <h2 id="work-title" className="sr-only">
          Work
        </h2>
        <div className="mx-auto mb-5 w-[calc(100%-40px)] max-w-reading">
          <Segmented
            label="Show"
            value={show}
            onChange={(value) =>
              navigate({
                search: value === "all" ? {} : { show: value },
                replace: true,
                resetScroll: false,
              })
            }
            options={filterOptions}
          />
        </div>
        <WorkGrid filter={show} />
      </section>
    </main>
  );
}
