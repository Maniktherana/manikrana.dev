import { useRef } from "react";
import type { MDXComponents } from "mdx/types";
import "katex/dist/katex.min.css";
import { buttonVariants } from "@manikrana/ui/components/ui/button";
import { Link } from "@manikrana/ui/components/ui/link";
import { cn } from "@manikrana/ui/lib/utils";
import { ChapterNavigation, slugOf } from "@/routes/library/-components/chapter-navigation";
import { CodeBlock } from "@/components/code-block";
import { GithubIcon } from "@/components/icons/github";
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

const mdxComponents: MDXComponents = {
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noreferrer">
      {children}
    </Link>
  ),
  h2: ({ children }) => <h2 id={slugOf(children)}>{children}</h2>,
  pre: CodeBlock,
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
            <h1 className="text-base leading-5.5 font-medium">{post.title}</h1>
            <time dateTime={post.date} className="mt-1 block leading-5.5 text-muted-foreground">
              {post.month}
            </time>
          </div>
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
        </div>

        <article
          ref={article}
          className="mt-8 text-muted-foreground sm:text-pretty [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-control [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm [&_:not(pre)>code]:text-control-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:leading-5.5 [&_h2]:font-medium [&_h2]:text-foreground [&_p]:mb-4 [&_strong]:font-medium [&_strong]:text-foreground"
        >
          <post.Content components={mdxComponents} />
        </article>
      </div>
    </main>
  );
}
