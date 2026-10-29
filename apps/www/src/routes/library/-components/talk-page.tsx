import { buttonVariants } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right";
import { GithubIcon } from "@/components/icons/github";
import {
  BreadcrumbLink,
  BreadcrumbSeparator,
  PageHeader,
  useClose,
} from "@/components/page-header";
import { PdfPages } from "@/components/pdf-pages";
import type { Talk } from "@/content/library";
import { TalkVideo } from "@/routes/library/-components/talk-video";

export function TalkPage({ talk }: { talk: Talk }) {
  const close = useClose({ to: "/" });
  return (
    <main id="main-content" className="mx-auto w-[calc(100%-40px)] max-w-reading">
      <PageHeader onClose={close}>
        <BreadcrumbLink to="/">Manik Rana</BreadcrumbLink>
        <BreadcrumbSeparator />
        <span aria-current="page" className="truncate">
          {talk.title}
        </span>
      </PageHeader>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-64">
          <h1 className="text-base leading-5.5 font-semibold">{talk.title}</h1>
          <time
            dateTime={talk.events[0].dateTime}
            className="mt-1 block leading-5.5 text-muted-foreground"
          >
            {talk.events[0].date}
          </time>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/talks/${talk.id}.pdf`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "gap-2 rounded-xl ps-3 pe-2.5 font-normal text-control-foreground hover:text-foreground",
            )}
          >
            PDF
            <ArrowUpRightIcon className="text-muted-foreground" />
          </a>
          <a
            href="https://github.com/Maniktherana/talks"
            target="_blank"
            rel="noreferrer"
            aria-label="Talks on GitHub"
            title="GitHub"
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" }),
              "rounded-xl text-control-foreground hover:text-foreground",
            )}
          >
            <GithubIcon />
          </a>
        </div>
      </div>

      {talk.video && <TalkVideo talk={talk} video={talk.video} />}

      <section aria-labelledby="slides-title" className="mt-12">
        <div className="mb-3 flex items-center justify-between border-b border-border pb-6 leading-5.5">
          <h2 id="slides-title" className="font-semibold">
            Slides
          </h2>
          <span className="text-muted-foreground">{talk.slides}</span>
        </div>
        <PdfPages
          url={`/talks/${talk.id}.pdf`}
          pages={talk.slides}
          label="Slide"
          className="pt-3"
          pageClassName="aspect-video"
        />
      </section>
    </main>
  );
}
