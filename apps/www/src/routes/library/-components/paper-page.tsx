import { buttonVariants } from "@manikrana/ui/components/ui/button";
import { Link } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import { ArxivLogo } from "@/components/icons/arxiv-logo";
import { GithubIcon } from "@/components/icons/github";
import {
  BreadcrumbLink,
  BreadcrumbSeparator,
  PageHeader,
  useClose,
} from "@/components/page-header";
import { PdfPages } from "@/components/pdf-pages";
import type { Paper } from "@/content/library";

export function PaperPage({ paper }: { paper: Paper }) {
  const close = useClose({ to: "/" });
  return (
    <main id="main-content" className="mx-auto w-[calc(100%-40px)] max-w-stage">
      <PageHeader onClose={close}>
        <BreadcrumbLink to="/">Manik Rana</BreadcrumbLink>
        <BreadcrumbSeparator />
        <span aria-current="page" className="truncate text-foreground">
          {paper.title}
        </span>
      </PageHeader>

      <div className="mx-auto max-w-reading">
        <div className="mt-8 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1 basis-64">
            <h1 className="text-base leading-5.5 font-medium">{paper.title}</h1>
            <time
              dateTime={paper.dateTime}
              className="mt-1 block leading-5.5 text-muted-foreground"
            >
              {paper.date}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={paper.openreview}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "rounded-xl px-3 font-normal text-control-foreground hover:text-foreground",
              )}
            >
              OpenReview
            </a>
            <a
              href={paper.arxiv}
              target="_blank"
              rel="noreferrer"
              aria-label={`${paper.title} on arXiv`}
              title="arXiv"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "rounded-xl px-3 text-control-foreground hover:text-foreground",
              )}
            >
              <ArxivLogo />
            </a>
            <a
              href={paper.github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${paper.title} on GitHub`}
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

        <p className="mt-5 text-pretty text-muted-foreground">
          My first paper as first author, accepted at the NeurIPS 2025{" "}
          <Link
            href="https://workshop-multi-turn-interaction.github.io/"
            target="_blank"
            rel="noreferrer"
            className="font-[450] motion-safe:duration-200 motion-safe:ease-[ease] motion-reduce:transition-none"
          >
            Workshop on Multi-Turn Interactions in Large Language Models
          </Link>
          .
        </p>

        <PdfPages
          url={`/papers/${paper.id}.pdf`}
          pages={paper.pages}
          label="Page"
          className="mt-8"
          pageClassName="aspect-[17/22]"
        />
      </div>
    </main>
  );
}
