import { buttonVariants } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right";
import { GithubIcon } from "@/components/icons/github";
import { LibraryHeader } from "@/routes/library/-components/library-header";
import { PdfPages } from "@/components/pdf-pages";
import type { Talk } from "@/routes/library/-data";
import { TalkVideo } from "@/routes/library/-components/talk-video";

export function TalkPage({ talk }: { talk: Talk }) {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-[calc(100%-40px)] max-w-reading flex-col gap-5 min-[641px]:gap-10"
    >
      <LibraryHeader />

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="flex min-w-0 flex-1 basis-64 flex-col gap-0.5">
              <h1 className="text-lg leading-6.5 font-medium text-pretty">{talk.title}</h1>
              <time
                dateTime={talk.events[0].dateTime}
                className="text-sm leading-5 font-medium text-muted-foreground"
              >
                {talk.events[0].date}
              </time>
            </div>
            <nav aria-label="Talk resources" className="flex flex-wrap items-center gap-2">
              <a
                href={`/talks/${talk.id}.pdf`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "resource", className: "gap-2 ps-3 pe-2.5" }),
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
                className={cn(buttonVariants({ variant: "resource", size: "icon" }))}
              >
                <GithubIcon />
              </a>
            </nav>
          </header>

          {talk.video && <TalkVideo talk={talk} video={talk.video} />}
        </div>

        <section aria-labelledby="slides-title">
          <div className="mb-3 flex items-center justify-between border-b border-separator pb-6 leading-5.5">
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
      </div>
    </main>
  );
}
