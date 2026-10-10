import { createFileRoute } from "@tanstack/react-router";
import { InlineLink } from "@/components/inline-link";
import { AnimatedRing } from "@manikrana/ui/components/animated-ring";
import { Avatar, AvatarImage, AvatarFallback } from "@manikrana/ui/components/ui/avatar";
import { Link } from "@manikrana/ui/components/ui/link";
import { TextReveal } from "@manikrana/ui/components/motion/text-reveal";
import { Backdrop } from "@/components/backdrop";
import { Segmented } from "@/components/segmented";
import { cn } from "@manikrana/ui/lib/utils";
import { useFirstVisit } from "@/lib/use-first-visit";
import { WorkGrid } from "@/work/grid";
import { filters } from "@/work/registry";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { show?: "component" } =>
    search.show === "component" ? { show: "component" } : {},
  component: Home,
});

function Home() {
  const { show = "project" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const first = useFirstVisit();
  return (
    <main
      id="main-content"
      className={cn(
        "grid grid-cols-1 gap-18 pt-20 min-[641px]:gap-20 min-[641px]:pt-24",
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
          <TextReveal as="header" play={first} className="mb-5 flex items-center gap-3">
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
          </TextReveal>
          <TextReveal
            as="p"
            index={1}
            play={first}
            className="mb-3 text-pretty text-muted-foreground last:mb-0"
          >
            I'm an engineer at{" "}
            <InlineLink href="https://turboml.com/" mark="turboml">
              TurboML
            </InlineLink>
            . I build ambitious software with a strong attention to craft, from the systems
            underneath it to the interfaces people actually use.
          </TextReveal>
          <TextReveal
            as="p"
            index={2}
            play={first}
            className="mb-3 text-pretty text-muted-foreground last:mb-0"
          >
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
          </TextReveal>
          <TextReveal
            as="p"
            index={3}
            play={first}
            className="mb-3 text-pretty text-muted-foreground last:mb-0"
          >
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
          </TextReveal>
        </div>
      </section>

      <TextReveal
        as="section"
        index={4}
        play={first}
        aria-labelledby="work-title"
        className="@container"
      >
        <h2 id="work-title" className="sr-only">
          Work
        </h2>
        <div className="mx-auto mb-5 w-[calc(100%-40px)] max-w-reading">
          <Segmented
            label="Show"
            value={show}
            onChange={(value) =>
              navigate({
                search: value === "component" ? { show: value } : {},
                replace: true,
                resetScroll: false,
                viewTransition: { types: ["filter"] },
              })
            }
            options={filters}
          />
        </div>
        <WorkGrid filter={show} />
      </TextReveal>
    </main>
  );
}
