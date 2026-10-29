import { useRef } from "react";
import type { MDXComponents } from "mdx/types";
import "katex/dist/katex.min.css";
import { buttonVariants } from "@manikrana/ui/components/ui/button";
import { Link } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import { ChapterNavigation, slugOf } from "@/routes/library/-components/chapter-navigation";
import { CodeBlock } from "@/components/code-block";
import { GithubIcon } from "@/components/icons/github";
import { ArxivLogo } from "@/components/icons/arxiv-logo";
import { Commit, Issue, Person, PullRequest, Repository } from "@/components/github-link";
import { Recording, Screenshot } from "@/components/media";
import { ConversationPlayer } from "@/components/agentchangebench/conversation-player";
import { PersonaShifts } from "@/components/agentchangebench/persona-shifts";
import { ResultsTable } from "@/components/agentchangebench/results-table";
import { Transcript } from "@/components/agentchangebench/transcript";
import { AttentionDiagram } from "@/components/mlm/attention-diagram";
import { InputEmbeddingDiagram } from "@/components/mlm/input-embedding-diagram";
import { LayerNormDiagram } from "@/components/mlm/layer-norm-diagram";
import { MlpDiagram } from "@/components/mlm/mlp-diagram";
import { ModelDiagram } from "@/components/mlm/model-diagram";
import { OutputHeadDiagram } from "@/components/mlm/output-head-diagram";
import { GeluGraph } from "@/components/mlm/gelu-graph";
import { LinearGraph } from "@/components/mlm/linear-graph";
import { LossGraph } from "@/components/mlm/loss-graph";
import { SoftmaxGraph } from "@/components/mlm/softmax-graph";
import { TrainingGraph } from "@/components/mlm/training-graph";
import {
  BreadcrumbLink,
  BreadcrumbSeparator,
  PageHeader,
  useClose,
} from "@/components/page-header";
import { posts } from "@/content/library";
import { PdfDialog } from "@/routes/library/-components/pdf-dialog";
import { TalkVideo } from "@/routes/library/-components/talk-video";

const mdxComponents: MDXComponents = {
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noreferrer">
      {children}
    </Link>
  ),
  h2: ({ children }) => <h2 id={slugOf(children)}>{children}</h2>,
  pre: CodeBlock,
  Commit,
  Issue,
  Person,
  PullRequest,
  Repository,
  Recording,
  Screenshot,
  ConversationPlayer,
  PersonaShifts,
  ResultsTable,
  Transcript,
  AttentionDiagram,
  InputEmbeddingDiagram,
  LayerNormDiagram,
  MlpDiagram,
  ModelDiagram,
  OutputHeadDiagram,
  GeluGraph,
  LinearGraph,
  LossGraph,
  SoftmaxGraph,
  TrainingGraph,
};

export function PostPage({ id }: { id: string }) {
  const post = posts.find((entry) => entry.id === id)!;
  const close = useClose({ to: "/" });
  const article = useRef<HTMLElement>(null);
  return (
    <main id="main-content" className="mx-auto w-[calc(100%-40px)] max-w-reading pb-24">
      <PageHeader onClose={close}>
        <BreadcrumbLink to="/">Manik Rana</BreadcrumbLink>
        <BreadcrumbSeparator />
        <span aria-current="page" className="truncate">
          {post.title}
        </span>
      </PageHeader>

      <div className="relative mt-8">
        <ChapterNavigation article={article} />
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1 basis-64">
            <h1 className="text-base leading-6.5 font-semibold">{post.title}</h1>
            <time dateTime={post.date} className="mt-1 block leading-5.5 text-muted-foreground">
              {post.month}
            </time>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {post.talk && (
              <PdfDialog
                url={`/talks/${post.talk.id}.pdf`}
                pages={post.talk.slides}
                title="Slides"
                pageLabel="Slide"
                pageClassName="aspect-video"
              />
            )}
            {post.paper && (
              <>
                <PdfDialog
                  url={`/papers/${post.paper.id}.pdf`}
                  pages={post.paper.pages}
                  title="Paper"
                  pageLabel="Page"
                  pageClassName="aspect-[17/22]"
                />
                <a
                  href={post.paper.arxiv}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${post.title} on arXiv`}
                  title="arXiv"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "rounded-xl px-3 text-control-foreground hover:text-foreground",
                  )}
                >
                  <ArxivLogo />
                </a>
              </>
            )}
            {post.github && (
              <a
                href={post.github}
                target="_blank"
                rel="noreferrer"
                aria-label={`${post.title} on GitHub`}
                title="GitHub"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "icon" }),
                  "rounded-xl text-control-foreground hover:text-foreground",
                )}
              >
                <GithubIcon />
              </a>
            )}
          </div>
        </div>

        {post.talk?.video && <TalkVideo talk={post.talk} video={post.talk.video} />}

        <article
          ref={article}
          className="mt-8 text-muted-foreground sm:text-pretty [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-control [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm [&_:not(pre)>code]:text-control-foreground [&_h2]:mt-18 [&_h2]:mb-4 [&_h2]:leading-6.5 [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mt-1 [&_li]:ps-1 [&_li]:marker:text-foreground/30 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:ps-5 [&_strong]:font-medium [&_strong]:text-foreground"
        >
          <post.Content components={mdxComponents} />
        </article>
      </div>
    </main>
  );
}
