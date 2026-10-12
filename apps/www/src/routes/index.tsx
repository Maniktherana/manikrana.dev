import { createFileRoute, Link as RouterLink, redirect } from "@tanstack/react-router";
import { InlineLink } from "@/components/inline-link";
import { Avatar, AvatarImage, AvatarFallback } from "@manikrana/ui/components/ui/avatar";
import { Link } from "@manikrana/ui/components/ui/link";
import { TextReveal } from "@manikrana/ui/components/motion/text-reveal";
import { Backdrop } from "@/components/backdrop";
import { cn } from "@manikrana/ui/lib/utils";
import { useFirstVisit } from "@/lib/use-first-visit";
import { LibraryList } from "@/library/library-list";
import { FeaturedGrid } from "@/work/grid";
import { work } from "@/work/registry";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { show?: "component" } =>
    search.show === "component" ? { show: "component" } : {},
  beforeLoad: ({ search }) => {
    if (search.show) throw redirect({ to: "/work", hash: "selected-work" });
  },
  component: Home,
});

function Home() {
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
            <Avatar data-portrait size="xl" className="rounded-xl">
              <AvatarImage
                src="/avatar.webp"
                alt="Manik Rana"
                width={48}
                height={48}
                fetchPriority="high"
                className="rounded-[inherit]"
              />
              <AvatarFallback className="rounded-[inherit]">MR</AvatarFallback>
            </Avatar>
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

      <TextReveal as="section" index={4} play={first} aria-labelledby="work-title">
        <div className="mx-auto w-[calc(100%-40px)] max-w-reading">
          <h2 id="work-title" className="mb-6 border-b border-border pb-6 leading-5.5 font-medium">
            <RouterLink
              to="/work"
              state={{ back: true }}
              className="relative isolate flex w-fit gap-2 outline-none before:absolute before:-inset-x-1.5 before:-inset-y-1 before:-z-1 before:rounded-md before:bg-card before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 focus-visible:before:opacity-100 focus-visible:before:ring-3 focus-visible:before:ring-ring/50 motion-reduce:before:transition-none"
            >
              Work{" "}
              <span className="text-muted-foreground">{Math.floor(work.length / 10) * 10}+</span>
            </RouterLink>
          </h2>
        </div>
        <div className="mx-auto w-[calc(100%-40px)] max-w-5xl">
          <FeaturedGrid />
        </div>
      </TextReveal>

      <TextReveal
        as="section"
        index={5}
        play={first}
        id="library"
        aria-labelledby="library-title"
        className="mx-auto w-[calc(100%-40px)] max-w-reading"
      >
        <h2 id="library-title" className="mb-3 border-b border-border pb-6 leading-5.5 font-medium">
          Library
        </h2>
        <LibraryList />
      </TextReveal>
    </main>
  );
}
