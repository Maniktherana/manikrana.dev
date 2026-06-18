import { Link } from "@tanstack/react-router";
import { getBreadcrumbItems } from "fumadocs-core/breadcrumb";
import { findNeighbour, type Folder, type Node, type Root } from "fumadocs-core/page-tree";
import { deserializePageTree } from "fumadocs-core/source/client";
import { AnchorProvider, ScrollProvider, TOCItem } from "fumadocs-core/toc";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ComponentIcon,
  PanelLeftIcon,
} from "lucide-react";
import * as React from "react";

import { DocsSearch } from "@/components/design/docs-search";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SerializedComponentDocPage, SerializedDocsPageTree } from "@/lib/docs-shared";
import { cn } from "@/lib/utils";

const contentWidthClassName = "w-full max-w-[704px]";
const sidebarItemClassName =
  "flex min-h-[29px] items-center gap-2 rounded-[6px] px-2 py-[5px] text-[13px] leading-[1.3] text-secondary-foreground no-underline hover:bg-accent hover:text-foreground";
const sidebarTitleClassName =
  "flex items-center justify-between px-2 pb-[7px] text-[13px] leading-[1.3] font-medium text-foreground";

type DocsLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: string;
};

function DocsLink({ href, ...props }: DocsLinkProps) {
  if (href === "/docs" || href === "/docs/") {
    return <Link to="/docs" {...props} />;
  }

  if (href.startsWith("/docs/")) {
    return (
      <Link
        to="/docs/$"
        params={{ _splat: href.slice("/docs/".length) }}
        {...props}
      />
    );
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

function getFirstPageUrl(nodes: Node[]): string {
  for (const node of nodes) {
    if (node.type === "page") return node.url;

    if (node.type === "folder") {
      if (node.index) return node.index.url;

      const url = getFirstPageUrl(node.children);
      if (url) return url;
    }
  }

  return "/docs/button";
}

function DocsSidebar({ activeUrl, pageTree }: { activeUrl: string; pageTree: Root }) {
  const sidebarHome = getFirstPageUrl(pageTree.children);

  return (
    <aside className="fixed start-0 top-14 bottom-0 z-10 w-72 min-w-0 border-e border-border max-[1180px]:static max-[1180px]:w-auto max-[900px]:hidden">
      <div className="sticky top-14 max-h-[calc(100svh-56px)] overflow-auto px-[18px] pt-[22px] pb-7">
        <DocsLink
          className={cn(sidebarItemClassName, "font-medium text-foreground [&_svg]:size-[15px]")}
          href={sidebarHome}
        >
          <ComponentIcon />
          Components
        </DocsLink>
        <nav className="mt-[18px]">
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
      <div className="mx-2 mt-4 mb-1.5 font-mono text-[11px] leading-[1.2] text-muted-foreground uppercase">
        {node.name}
      </div>
    );
  }

  if (node.type === "folder") {
    return <DocsSidebarFolder activeUrl={activeUrl} node={node} />;
  }

  return (
    <DocsLink
      aria-current={node.url === activeUrl ? "page" : undefined}
      className={cn(sidebarItemClassName, node.url === activeUrl && "bg-accent text-foreground")}
      href={node.url}
    >
      {node.name}
    </DocsLink>
  );
}

function DocsSidebarFolder({ activeUrl, node }: { activeUrl: string; node: Folder }) {
  if (node.root) {
    return (
      <div className="mt-4">
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

  return (
    <details className="group mt-4" open={node.defaultOpen ?? true}>
      <summary
        className={cn(
          sidebarTitleClassName,
          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
        )}
      >
        <span>{node.name}</span>
        <ChevronDownIcon className="size-3.5 text-muted-foreground transition-transform duration-150 group-open:rotate-180" />
      </summary>
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
    </details>
  );
}

function DocsMobileNav({ activeUrl, pageTree }: { activeUrl: string; pageTree: Root }) {
  return (
    <details className={cn("group hidden w-full max-[900px]:mb-[22px] max-[900px]:block", contentWidthClassName)}>
      <summary className="flex min-h-[38px] cursor-pointer list-none items-center justify-between rounded-[7px] border border-border px-2.5 py-2 text-[13px] leading-[1.3] font-medium text-foreground [&::-webkit-details-marker]:hidden [&_svg]:size-[15px]">
        <span className="flex min-w-0 items-center gap-2">
          <PanelLeftIcon />
          <span>Browse components</span>
        </span>
        <ChevronDownIcon className="transition-transform duration-150 group-open:rotate-180" />
      </summary>
      <nav className="mt-2 grid max-h-[60svh] gap-px overflow-auto rounded-[7px] border border-border p-2.5">
        {pageTree.children.map((node, index) => (
          <DocsSidebarNode
            activeUrl={activeUrl}
            key={node.$id ?? `${node.type}-${index}`}
            node={node}
          />
        ))}
      </nav>
    </details>
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
    <aside className="fixed end-0 top-14 bottom-0 z-10 w-64 min-w-0 border-s border-border max-[1180px]:hidden">
      <div className="sticky top-14 max-h-[calc(100svh-56px)] overflow-auto px-[22px] py-[42px]" ref={containerRef}>
        <p className="font-mono text-xs leading-[1.1] font-normal tracking-normal text-secondary-foreground uppercase">
          On This Page
        </p>
        <ScrollProvider containerRef={containerRef}>
          <nav className="mt-4 flex flex-col gap-1">
            {page.toc.map((item) => (
              <TOCItem
                className="block rounded-[6px] px-2 py-[5px] text-[13px] leading-[1.4] text-muted-foreground no-underline hover:bg-accent hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-foreground data-[depth=3]:ps-5"
                data-depth={item.depth}
                href={item.url}
                key={item.url}
              >
                {item.title}
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
          variant="secondary"
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
          variant="secondary"
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

  return (
    <AnchorProvider toc={page.toc} single>
      <main className="min-h-svh overflow-x-hidden bg-background font-sans text-[13px] leading-[1.6] text-foreground">
        <div className="min-h-svh bg-background text-foreground">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/92 px-[max(20px,calc((100vw-1536px)/2+24px))] backdrop-blur-[16px] max-[900px]:px-4 [&_svg]:size-[15px]">
            <div className="flex min-w-0 items-center gap-2">
              <ComponentIcon />
              <DocsLink
                className="text-[13px] leading-[1.1] font-medium tracking-normal text-foreground"
                href="/docs"
              >
                Components
              </DocsLink>
              <span className="hidden text-muted-foreground sm:inline">/</span>
              <span className="hidden truncate text-muted-foreground sm:inline">{page.title}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DocsSearch activeUrl={page.url} pageTree={rootTree} />
              <span className="hidden sm:inline">Component system for shadcn Base</span>
              <ThemeToggle />
            </div>
          </header>

          <div className="mx-auto block min-h-[calc(100svh-56px)] max-[1180px]:grid max-[1180px]:max-w-[1536px] max-[1180px]:grid-cols-[288px_minmax(0,1fr)] max-[900px]:block">
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
              <header className={cn("mb-9 border-b border-border pb-[34px]", contentWidthClassName)}>
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
