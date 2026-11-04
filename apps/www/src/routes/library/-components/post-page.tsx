import { useRef } from "react";
import type { MDXComponents } from "mdx/types";
import "katex/dist/katex.min.css";
import { Link } from "@manikrana/ui/components/ui/link";
import { buttonVariants } from "@manikrana/ui/components/ui/button";
import { cn } from "@manikrana/ui/lib/utils";
import { ChapterNavigation, slugOf } from "@/routes/library/-components/chapter-navigation";
import { CodeBlock } from "@/components/code-block";
import { Link as TextLink } from "@/components/link";
import { GithubIcon } from "@/components/icons/github";
import { ArxivLogo } from "@/components/icons/arxiv-logo";
import { Commit, Issue, Person, PullRequest, Repository } from "@/components/github-link";
import { LibraryHeader } from "@/routes/library/-components/library-header";
import { posts } from "@/routes/library/-data";
import { PdfDialog } from "@/routes/library/-components/pdf-dialog";
import { TalkVideo } from "@/routes/library/-components/talk-video";

const mdxComponents: MDXComponents = {
  a: ({ href, children }) => (
    <Link href={href} target="_blank" rel="noreferrer">
      {children}
    </Link>
  ),
  h2: ({ children }) => (
    <h2 id={slugOf(children)} className="heading-rule">
      <span className="min-w-0">{children}</span>
    </h2>
  ),
  pre: CodeBlock,
  Link: TextLink,
  Commit,
  Issue,
  Person,
  PullRequest,
  Repository,
};

export function PostPage({ id }: { id: string }) {
  const post = posts.find((entry) => entry.id === id)!;
  const article = useRef<HTMLElement>(null);
  return (
    <main
      id="main-content"
      className="mx-auto flex w-[calc(100%-40px)] max-w-reading flex-col gap-5 pb-24 min-[641px]:gap-10"
    >
      <LibraryHeader />

      <div className="relative flex flex-col gap-8">
        <ChapterNavigation article={article} />
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-1 basis-64 flex-col gap-0.5">
            <h1 className="text-lg leading-6.5 font-medium text-pretty">{post.title}</h1>
            <time
              dateTime={post.date}
              className="text-sm leading-5 font-medium text-muted-foreground"
            >
              {post.month}
            </time>
          </div>
          {(post.talk || post.paper || post.github) && (
            <nav aria-label="Article resources" className="flex flex-wrap items-center gap-2">
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
                    className={cn(buttonVariants({ variant: "resource", className: "px-3" }))}
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
                  className={cn(buttonVariants({ variant: "resource", size: "icon" }))}
                >
                  <GithubIcon />
                </a>
              )}
            </nav>
          )}
        </header>

        {post.talk?.video && <TalkVideo talk={post.talk} video={post.talk.video} />}

        <article
          ref={article}
          className="text-muted-foreground [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-control [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm [&_:not(pre)>code]:text-control-foreground [&_h2]:mt-18 [&_h2]:mb-4 [&_h2]:text-lg [&_h2]:leading-6.5 [&_h2]:font-medium [&_h2]:text-foreground [&_li]:mt-1 [&_li]:ps-1 [&_li]:marker:text-foreground/30 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:ps-5 [&_strong]:font-medium [&_strong]:text-foreground"
        >
          <post.Content components={mdxComponents} />
        </article>
      </div>
    </main>
  );
}
