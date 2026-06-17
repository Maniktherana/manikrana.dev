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

import { ThemeToggle } from "@/components/design/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SerializedComponentDocPage, SerializedDocsPageTree } from "@/lib/docs-shared";
import { cn } from "@/lib/utils";

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
    <aside className="medusa-doc-sidebar">
      <div className="medusa-doc-sidebar-inner">
        <a className="medusa-doc-sidebar-root" href={sidebarHome}>
          <ComponentIcon />
          Components
        </a>
        <nav className="medusa-doc-sidebar-nav">
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
    return <div className="medusa-doc-sidebar-separator">{node.name}</div>;
  }

  if (node.type === "folder") {
    return <DocsSidebarFolder activeUrl={activeUrl} node={node} />;
  }

  return (
    <a
      aria-current={node.url === activeUrl ? "page" : undefined}
      className={cn("medusa-doc-sidebar-link", node.url === activeUrl && "is-active")}
      href={node.url}
    >
      {node.name}
    </a>
  );
}

function DocsSidebarFolder({ activeUrl, node }: { activeUrl: string; node: Folder }) {
  if (node.root) {
    return (
      <div className="medusa-doc-sidebar-folder">
        <div className="medusa-doc-sidebar-folder-title">{node.name}</div>
        <div className="medusa-doc-sidebar-folder-items">
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
    <details className="medusa-doc-sidebar-folder" open={node.defaultOpen ?? true}>
      <summary className="medusa-doc-sidebar-folder-title">
        <span>{node.name}</span>
        <ChevronDownIcon />
      </summary>
      <div className="medusa-doc-sidebar-folder-items">
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
    <details className="medusa-doc-mobile-nav">
      <summary>
        <span className="flex min-w-0 items-center gap-2">
          <PanelLeftIcon />
          <span>Browse components</span>
        </span>
        <ChevronDownIcon />
      </summary>
      <nav>
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
    <nav aria-label="Breadcrumb" className="medusa-doc-breadcrumbs">
      {items.map((item, index) => (
        <React.Fragment key={`${index}-${item.url ?? "item"}`}>
          {index > 0 ? <span className="medusa-doc-breadcrumb-divider">/</span> : null}
          {item.url ? <a href={item.url}>{item.name}</a> : <span>{item.name}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

function DocsTableOfContents({ page }: { page: SerializedComponentDocPage }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (page.toc.length === 0) return null;

  return (
    <aside className="medusa-doc-toc">
      <div className="medusa-doc-toc-inner" ref={containerRef}>
        <p className="medusa-code-label">On This Page</p>
        <ScrollProvider containerRef={containerRef}>
          <nav className="mt-4 flex flex-col gap-1">
            {page.toc.map((item) => (
              <TOCItem
                className="medusa-doc-toc-link"
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
    <nav aria-label="Component pagination" className="medusa-doc-neighbours">
      {neighbours.previous ? (
        <Button
          variant="secondary"
          size="sm"
          nativeButton={false}
          render={
            <a
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
            <a aria-label={`Open ${nodeLabel(neighbours.next.name)}`} href={neighbours.next.url} />
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
    <div className="medusa-doc-page-actions">
      <Button
        aria-label={previousLabel}
        disabled={!neighbours.previous}
        nativeButton={!neighbours.previous}
        render={
          neighbours.previous ? (
            <a href={neighbours.previous.url} aria-label={previousLabel} />
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
            <a href={neighbours.next.url} aria-label={nextLabel} />
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
      <main data-medusa className="min-h-svh overflow-x-hidden bg-background">
        <div className="medusa-doc-app">
          <header className="medusa-doc-topbar">
            <div className="flex min-w-0 items-center gap-2">
              <ComponentIcon />
              <a className="medusa-compact-plus" href="/docs">
                Components
              </a>
              <span className="hidden text-muted-foreground sm:inline">/</span>
              <span className="hidden truncate text-muted-foreground sm:inline">{page.title}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="hidden sm:inline">Medusa UI for shadcn Base</span>
              <ThemeToggle />
            </div>
          </header>

          <div className="medusa-doc-grid">
            <DocsSidebar activeUrl={page.url} pageTree={rootTree} />
            <article className="medusa-doc-article">
              <DocsMobileNav activeUrl={page.url} pageTree={rootTree} />
              <div className="medusa-doc-intro-row">
                <DocsBreadcrumbs page={page} pageTree={rootTree} />
                <DocsPageActions page={page} pageTree={rootTree} />
              </div>
              <header className="medusa-doc-header">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{page.component.category}</Badge>
                  <Badge variant={page.component.custom ? "outline" : "secondary"}>
                    {page.component.custom ? "local composition" : "shadcn primitive"}
                  </Badge>
                </div>
                <h1>{page.title}</h1>
                <p>{page.description}</p>
              </header>
              <div className="medusa-doc-mdx">{children}</div>
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
