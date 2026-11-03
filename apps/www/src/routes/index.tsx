import { createFileRoute, Link as RouterLink, redirect } from "@tanstack/react-router";
import { Link } from "@/components/link";
import { GsocMark } from "@/components/icons/gsoc-mark";
import { PrometheusMark } from "@/components/icons/prometheus-mark";
import { TurbomlMark } from "@/components/icons/turboml-mark";
import { GithubIcon } from "@/components/icons/github";
import { MailIcon } from "@/components/icons/mail";
import { XIcon } from "@/components/icons/x";
import { Avatar, AvatarImage, AvatarFallback } from "@manikrana/ui/components/ui/avatar";
import { Backdrop } from "@/components/backdrop";
import { cn } from "@manikrana/ui/lib/utils";
import { useFirstVisit } from "@/hooks/use-first-visit";
import { LibraryList } from "@/routes/-components/library-list";
import { ProjectList } from "@/routes/-components/project-list";
import { FeaturedGrid } from "@/components/work/grid";
import { work } from "@/components/work/registry";

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
          <header className="mb-5 flex items-center gap-3">
            <Avatar data-portrait size="xl" className="rounded-xl">
              <AvatarFallback delay={200} className="absolute inset-0 rounded-[inherit]">
                MR
              </AvatarFallback>
              <AvatarImage
                keepMounted
                src="/avatar.webp"
                alt="Manik Rana"
                width={48}
                height={48}
                fetchPriority="high"
                className="absolute inset-0 rounded-[inherit] data-loading:invisible data-error:invisible"
              />
            </Avatar>
            <div>
              <h1 id="intro-title" className="text-base leading-5.5 font-semibold">
                Manik Rana
              </h1>
              <p className="text-muted-foreground font-[450] leading-5.5">Engineer at TurboML</p>
            </div>
          </header>
          <p className="mb-3 text-muted-foreground last:mb-0">
            I'm an engineer at{" "}
            <span className="whitespace-nowrap">
              <Link href="https://turboml.com/" target="_blank" rel="noreferrer">
                <TurbomlMark />
                TurboML
              </Link>
              .
            </span>{" "}
            I build ambitious software end to end, from the systems that make it fast to the
            interfaces that make it feel good.
          </p>
          <p className="mb-3 text-muted-foreground last:mb-0">
            Previously, I worked on{" "}
            <Link
              href="https://github.com/prometheus/prometheus/issues/14217"
              target="_blank"
              rel="noreferrer"
            >
              <PrometheusMark />
              Prometheus
            </Link>{" "}
            through{" "}
            <span className="whitespace-nowrap">
              <Link
                href="https://summerofcode.withgoogle.com/archive/2024/organizations/cncf/"
                target="_blank"
                rel="noreferrer"
              >
                <GsocMark />
                GSoC
              </Link>
              ,
            </span>{" "}
            where I worked on its OpenMetrics parser and cut memory use by up to{" "}
            <span className="whitespace-nowrap">
              <Link
                href="https://github.com/prometheus/prometheus/pull/15097#issuecomment-2404777959"
                target="_blank"
                rel="noreferrer"
                className="tabular-nums"
              >
                10x
              </Link>
              .
            </span>
          </p>
          <p className="mb-3 text-muted-foreground last:mb-0">
            You can reach me on{" "}
            <span className="whitespace-nowrap">
              <Link href="https://x.com/ManikMkr" target="_blank" rel="noreferrer">
                <XIcon className="size-3.5 self-center" />x
              </Link>
              ,
            </span>{" "}
            by{" "}
            <span className="whitespace-nowrap">
              <Link href="mailto:hello@manikrana.dev">
                <MailIcon className="self-center" />
                email
              </Link>
              ,
            </span>{" "}
            or on{" "}
            <span className="whitespace-nowrap">
              <Link href="https://github.com/Maniktherana" target="_blank" rel="noreferrer">
                <GithubIcon className="self-center" />
                GitHub
              </Link>
              .
            </span>
          </p>
        </div>
      </section>

      <section
        aria-labelledby="projects-title"
        className="mx-auto w-[calc(100%-40px)] max-w-reading"
      >
        <h2
          id="projects-title"
          className="mb-6 text-lg leading-tight font-semibold"
        >
          Projects
        </h2>
        <ProjectList />
      </section>

      <section aria-labelledby="work-title">
        <div className="mx-auto w-[calc(100%-40px)] max-w-reading">
          <h2
            id="work-title"
            className="mb-6 text-lg leading-tight font-semibold"
          >
            <RouterLink
              to="/work"
              state={{ back: true }}
              className="relative isolate flex w-fit items-baseline gap-2 outline-none before:absolute before:-inset-x-1.5 before:-inset-y-1 before:-z-1 before:rounded-md before:bg-card before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 focus-visible:before:opacity-100 focus-visible:before:ring-2 focus-visible:before:ring-ring motion-reduce:before:transition-none"
            >
              Lab{" "}
              <span className="text-base font-normal text-muted-foreground">
                {Math.floor(work.length / 10) * 10}+
              </span>
            </RouterLink>
          </h2>
        </div>
        <div className="mx-auto w-[calc(100%-40px)] max-w-5xl">
          <FeaturedGrid />
        </div>
      </section>

      <section
        id="library"
        aria-labelledby="library-title"
        className="mx-auto w-[calc(100%-40px)] max-w-reading"
      >
        <h2
          id="library-title"
          className="mb-6 text-lg leading-tight font-semibold"
        >
          Library
        </h2>
        <LibraryList />
      </section>
    </main>
  );
}
