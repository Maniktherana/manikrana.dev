import { Link } from "@tanstack/react-router";
import { getBreadcrumbItems } from "fumadocs-core/breadcrumb";
import { findNeighbour, type Folder, type Node, type Root } from "fumadocs-core/page-tree";
import { deserializePageTree } from "fumadocs-core/source/client";
import { AnchorProvider, ScrollProvider, TOCItem } from "fumadocs-core/toc";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import * as React from "react";

import { DocsSearch } from "@/components/design/docs-search";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SerializedComponentDocPage, SerializedDocsPageTree } from "@/lib/docs-shared";
import { cn } from "@/lib/utils";

const contentWidthClassName = "w-full max-w-[704px]";
const sidebarItemClassName =
  "group/sidebar-link flex min-h-[29px] min-w-0 items-center text-[13px] leading-[1.3] text-secondary-foreground no-underline transition-colors hover:text-foreground";
const sidebarItemLabelClassName =
  "inline-flex max-w-full items-center truncate rounded-md px-2 py-[5px] transition-colors group-hover/sidebar-link:bg-white/10";
const sidebarSectionClassName = "mt-6 first:mt-0";
const sidebarTitleClassName =
  "mb-1.5 px-2 font-mono text-[12px] leading-[1.25] font-normal text-muted-foreground";

type DocsLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: string;
};

function DocsLink({ href, ...props }: DocsLinkProps) {
  if (href === "/docs" || href === "/docs/") {
    return <Link to="/docs" {...props} />;
  }

  if (href.startsWith("/docs/")) {
    return <Link to="/docs/$" params={{ _splat: href.slice("/docs/".length) }} {...props} />;
  }

  return <a href={href} {...props} />;
}

function nodeLabel(name: React.ReactNode): string {
  if (name === undefined || name === null || typeof name === "boolean") return "Page";

  if (typeof name === "string" || typeof name === "number" || typeof name === "bigint") {
    return String(name);
  }

  if (Array.isArray(name)) {
    return name.map(nodeLabel).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(name)) {
    return nodeLabel(name.props.children);
  }

  return "Page";
}

function collectPageNodes(nodes: Node[]): Array<Extract<Node, { type: "page" }>> {
  const pages: Array<Extract<Node, { type: "page" }>> = [];

  for (const node of nodes) {
    if (node.type === "page") {
      pages.push(node);
      continue;
    }

    if (node.type === "folder") {
      if (node.index) pages.push(node.index);
      pages.push(...collectPageNodes(node.children));
    }
  }

  return pages;
}

function DocsSidebarLink({
  active,
  children,
  href,
}: {
  active?: boolean;
  children: React.ReactNode;
  href: string;
}) {
  return (
    <DocsLink
      aria-current={active ? "page" : undefined}
      className={cn(sidebarItemClassName, active && "text-foreground")}
      href={href}
    >
      <span className={cn(sidebarItemLabelClassName, active && "bg-white/10")}>{children}</span>
    </DocsLink>
  );
}

function DocsSidebar({ activeUrl, pageTree }: { activeUrl: string; pageTree: Root }) {
  return (
    <aside className="sticky top-14 flex h-[calc(100svh-56px)] min-w-0 items-start self-start max-[900px]:hidden">
      <div className="no-scrollbar mt-3 h-[calc(90%_-_12px)] w-full overflow-auto overscroll-none px-5 py-6 [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%_-_32px),transparent)]">
        <nav className="flex flex-col">
          {pageTree.children.map((node, index) => (
            <DocsSidebarNode
              activeUrl={activeUrl}
              key={node.$id ?? `${node.type}-${index}`}
              node={node}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function DocsSidebarNode({ activeUrl, node }: { activeUrl: string; node: Node }) {
  if (node.type === "separator") {
    return (
      <div className={sidebarSectionClassName}>
        <div className={sidebarTitleClassName}>{node.name}</div>
      </div>
    );
  }

  if (node.type === "folder") {
    return <DocsSidebarFolder activeUrl={activeUrl} node={node} />;
  }

  return (
    <DocsSidebarLink active={node.url === activeUrl} href={node.url}>
      {node.name}
    </DocsSidebarLink>
  );
}

function DocsSidebarFolder({ activeUrl, node }: { activeUrl: string; node: Folder }) {
  if (node.root) {
    return (
      <>
        {node.children.map((child, index) => (
          <DocsSidebarNode
            activeUrl={activeUrl}
            key={child.$id ?? `${child.type}-${index}`}
            node={child}
          />
        ))}
      </>
    );
  }

  return (
    <div className={sidebarSectionClassName}>
      <div className={sidebarTitleClassName}>{node.name}</div>
      <div className="flex flex-col gap-px">
        {node.index ? <DocsSidebarNode activeUrl={activeUrl} node={node.index} /> : null}
        {node.children.map((child, index) => (
          <DocsSidebarNode
            activeUrl={activeUrl}
            key={child.$id ?? `${child.type}-${index}`}
            node={child}
          />
        ))}
      </div>
    </div>
  );
}

function DocsMobileNav({ activeUrl, pageTree }: { activeUrl: string; pageTree: Root }) {
  const pages = React.useMemo(() => collectPageNodes(pageTree.children), [pageTree]);

  return (
    <nav
      aria-label="Docs sections"
      className={cn(
        "hidden overflow-x-auto pb-2 [mask-image:linear-gradient(90deg,transparent,black_16px,black_calc(100%_-_28px),transparent)] max-[900px]:mb-[22px] max-[900px]:block",
        contentWidthClassName,
      )}
    >
      <div className="flex min-w-max gap-1">
        {pages.map((node) => (
          <DocsLink
            aria-current={node.url === activeUrl ? "page" : undefined}
            className={cn(
              "rounded-md px-2 py-[5px] text-[13px] leading-[1.3] text-secondary-foreground no-underline transition-colors hover:bg-white/10 hover:text-foreground",
              node.url === activeUrl && "bg-white/10 text-foreground",
            )}
            href={node.url}
            key={node.url}
          >
            {node.name}
          </DocsLink>
        ))}
      </div>
    </nav>
  );
}

function DocsBreadcrumbs({ page, pageTree }: { page: SerializedComponentDocPage; pageTree: Root }) {
  const items = getBreadcrumbItems(page.url, pageTree, {
    includePage: true,
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px] leading-[1.3] text-muted-foreground"
    >
      {items.map((item, index) => (
        <React.Fragment key={`${index}-${item.url ?? "item"}`}>
          {index > 0 ? <span className="text-border">/</span> : null}
          {item.url ? (
            <DocsLink className="text-inherit no-underline hover:text-foreground" href={item.url}>
              {item.name}
            </DocsLink>
          ) : (
            <span>{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function DocsTableOfContents({ page }: { page: SerializedComponentDocPage }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (page.toc.length === 0) return null;

  return (
    <aside className="sticky top-14 flex h-[calc(100svh-56px)] min-w-0 items-start self-start max-[1180px]:hidden">
      <div
        className="no-scrollbar h-[90%] w-full overflow-auto overscroll-none px-[22px] py-6 [mask-image:linear-gradient(to_bottom,transparent,black_24px,black_calc(100%_-_32px),transparent)]"
        ref={containerRef}
      >
        <p className={sidebarTitleClassName}>On This Page</p>
        <ScrollProvider containerRef={containerRef}>
          <nav className="flex flex-col gap-px">
            {page.toc.map((item) => (
              <TOCItem
                className="group/toc block text-[13px] leading-[1.4] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:text-foreground data-[depth=3]:ps-4"
                data-depth={item.depth}
                href={item.url}
                key={item.url}
              >
                <span className="inline-flex max-w-full truncate px-2 py-[5px] transition-colors">
                  {item.title}
                </span>
              </TOCItem>
            ))}
          </nav>
        </ScrollProvider>
      </div>
    </aside>
  );
}

function DocsNeighbours({ page, pageTree }: { page: SerializedComponentDocPage; pageTree: Root }) {
  const neighbours = findNeighbour(pageTree, page.url);

  return (
    <nav
      aria-label="Component pagination"
      className={cn("mt-14 flex gap-3 border-t border-border pt-6", contentWidthClassName)}
    >
      {neighbours.previous ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <DocsLink
              aria-label={`Open ${nodeLabel(neighbours.previous.name)}`}
              href={neighbours.previous.url}
            />
          }
        >
          <ArrowLeftIcon data-icon="inline-start" />
          {neighbours.previous.name}
        </Button>
      ) : null}
      {neighbours.next ? (
        <Button
          className="ml-auto"
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <DocsLink
              aria-label={`Open ${nodeLabel(neighbours.next.name)}`}
              href={neighbours.next.url}
            />
          }
        >
          {neighbours.next.name}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      ) : null}
    </nav>
  );
}

function DocsPageActions({ page, pageTree }: { page: SerializedComponentDocPage; pageTree: Root }) {
  const neighbours = findNeighbour(pageTree, page.url);
  const previousLabel = neighbours.previous
    ? `Open ${nodeLabel(neighbours.previous.name)}`
    : "No previous page";
  const nextLabel = neighbours.next ? `Open ${nodeLabel(neighbours.next.name)}` : "No next page";

  return (
    <div className="flex items-center gap-0.5">
      <Button
        aria-label={previousLabel}
        disabled={!neighbours.previous}
        nativeButton={!neighbours.previous}
        render={
          neighbours.previous ? (
            <DocsLink href={neighbours.previous.url} aria-label={previousLabel} />
          ) : (
            <button type="button" aria-label={previousLabel} />
          )
        }
        size="icon-sm"
        variant="ghost"
      >
        <ArrowLeftIcon />
      </Button>
      <Button
        aria-label={nextLabel}
        disabled={!neighbours.next}
        nativeButton={!neighbours.next}
        render={
          neighbours.next ? (
            <DocsLink href={neighbours.next.url} aria-label={nextLabel} />
          ) : (
            <button type="button" aria-label={nextLabel} />
          )
        }
        size="icon-sm"
        variant="ghost"
      >
        <ArrowRightIcon />
      </Button>
    </div>
  );
}

function DocsShell({
  children,
  page,
  pageTree,
}: {
  children: React.ReactNode;
  page: SerializedComponentDocPage;
  pageTree: SerializedDocsPageTree;
}) {
  const rootTree = React.useMemo(() => deserializePageTree(pageTree), [pageTree]);
  const isFullBleed = page.url.endsWith("/ai-chat");

  const header = (
    <header className="fixed inset-x-0 top-0 z-50 h-14 bg-page-background/62 backdrop-blur-2xl supports-[backdrop-filter]:bg-page-background/50">
      <div className="mx-auto flex h-full max-w-[1536px] items-center justify-between gap-4 px-6 max-[900px]:px-4 [&_svg]:size-4">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src="/logo.svg"
            alt=""
            width={20}
            height={20}
            className="size-5 shrink-0"
            decoding="async"
          />
          <DocsLink
            className="text-[13px] leading-[1.1] font-medium tracking-normal text-foreground"
            href="/docs"
          >
            Components
          </DocsLink>
          <span className="hidden truncate text-muted-foreground sm:inline">{page.title}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <DocsSearch activeUrl={page.url} pageTree={rootTree} />
          <span className="hidden sm:inline">Component system for shadcn Base</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );

  if (isFullBleed) {
    return (
      <AnchorProvider toc={page.toc} single>
        <main className="flex h-svh flex-col overflow-hidden overscroll-none bg-page-background font-sans text-foreground">
          {header}
          <div className="min-h-0 flex-1 p-3 pt-[calc(56px+0.75rem)] max-[900px]:p-0 max-[900px]:pt-14">
            {children}
          </div>
        </main>
      </AnchorProvider>
    );
  }

  return (
    <AnchorProvider toc={page.toc} single>
      <main className="min-h-svh overflow-x-clip overscroll-none bg-page-background font-sans text-[13px] leading-[1.6] text-foreground">
        <div className="min-h-svh bg-page-background text-foreground">
          {header}

          <div className="mx-auto grid min-h-svh max-w-[1536px] grid-cols-[288px_minmax(0,1fr)_256px] pt-14 max-[1180px]:grid-cols-[268px_minmax(0,1fr)] max-[900px]:block">
            <DocsSidebar activeUrl={page.url} pageTree={rootTree} />
            <article className="flex min-w-0 flex-col items-center px-12 pt-[38px] pb-14 max-[900px]:px-[18px] max-[900px]:pt-7 max-[900px]:pb-10">
              <DocsMobileNav activeUrl={page.url} pageTree={rootTree} />
              <div
                className={cn(
                  "mb-6 flex items-center justify-between gap-4 max-[900px]:mb-5 max-[900px]:items-start max-[900px]:gap-3",
                  contentWidthClassName,
                )}
              >
                <DocsBreadcrumbs page={page} pageTree={rootTree} />
                <DocsPageActions page={page} pageTree={rootTree} />
              </div>
              <header
                className={cn("mb-9 border-b border-border pb-[34px]", contentWidthClassName)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{page.component.category}</Badge>
                  <Badge variant={page.component.custom ? "outline" : "secondary"}>
                    {page.component.custom ? "local composition" : "shadcn primitive"}
                  </Badge>
                </div>
                <h1 className="mt-4 font-sans text-[42px] leading-[1.1] font-medium tracking-normal text-foreground max-[900px]:text-[32px]">
                  {page.title}
                </h1>
                <p className="mt-3 max-w-[680px] text-base leading-[1.6] text-secondary-foreground">
                  {page.description}
                </p>
              </header>
              <div
                className={cn(
                  "min-w-0 [&>*:first-child]:mt-0 [&>[data-slot=code-block]]:mt-[14px] [&>[data-slot=code-block]+[data-slot=code-block]]:mt-2",
                  contentWidthClassName,
                )}
              >
                {children}
              </div>
              <DocsNeighbours page={page} pageTree={rootTree} />
            </article>
            <DocsTableOfContents page={page} />
          </div>
        </div>
      </main>
    </AnchorProvider>
  );
}

export { DocsShell };
