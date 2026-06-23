import { useNavigate } from "@tanstack/react-router";
import type { Root, Node } from "fumadocs-core/page-tree";
import type { SortedResult } from "fumadocs-core/search";
import { useDocsSearch } from "fumadocs-core/search/client";
import { CornerDownLeftIcon, FileTextIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import { catalogById } from "@/components/design/component-catalog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { searchDocs } from "@/lib/docs-search";

type DocsSearchPage = {
  description?: string;
  section: string;
  title: string;
  url: string;
};

type DocsSearchResult = {
  breadcrumbs: string[];
  content: string;
  id: string;
  type: SortedResult["type"];
  url: string;
};

type DocsSearchItem = {
  description?: string;
  title: string;
  url: string;
  value: string;
};

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

function nodeDescription(node: Node): string | undefined {
  if (!("description" in node) || !node.description) return undefined;

  return nodeLabel(node.description);
}

function componentIdFromUrl(url: string) {
  const [pathname] = url.split("#");

  return pathname.split("/").filter(Boolean).at(-1) ?? "";
}

function collectDocsSearchPages(nodes: Node[], section = "Components") {
  const pages: DocsSearchPage[] = [];
  let currentSection = section;

  for (const node of nodes) {
    if (node.type === "separator") {
      currentSection = nodeLabel(node.name);
      continue;
    }

    if (node.type === "page") {
      const component = catalogById[componentIdFromUrl(node.url)];

      pages.push({
        description: component?.description ?? nodeDescription(node),
        section: component?.category ?? currentSection,
        title: component?.title ?? nodeLabel(node.name),
        url: node.url,
      });
      continue;
    }

    if (node.type === "folder") {
      pages.push(...collectDocsSearchPages(node.children, nodeLabel(node.name)));
    }
  }

  return pages;
}

function plainText(value: string) {
  const text = value
    .replace(/<\/?mark>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_~#[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const midpoint = Math.floor(text.length / 2);
  if (text.length % 2 === 0 && text.slice(0, midpoint) === text.slice(midpoint)) {
    return text.slice(0, midpoint).trim();
  }

  return text;
}

function toDocsSearchResult(result: SortedResult): DocsSearchResult {
  return {
    breadcrumbs: result.breadcrumbs?.map(plainText).filter(Boolean) ?? [],
    content: plainText(result.content),
    id: result.id,
    type: result.type,
    url: result.url,
  };
}

function resultTitle(result: DocsSearchResult) {
  if (result.type === "page" || result.type === "heading") return result.content;

  return result.breadcrumbs.at(-1) ?? result.content;
}

function resultComponent(result: DocsSearchResult) {
  return catalogById[componentIdFromUrl(result.url)];
}

function resultDescription(result: DocsSearchResult) {
  const component = resultComponent(result);

  if (result.type === "page") {
    return component?.description ?? result.breadcrumbs.join(" / ");
  }

  if (result.type === "heading") {
    if (component) return `${component.title} - ${component.description}`;

    return result.breadcrumbs.join(" / ");
  }

  return result.content;
}

function resultSection(result: DocsSearchResult) {
  return resultComponent(result)?.category ?? "Docs";
}

function groupBySection<T>(
  items: T[],
  getSection: (item: T) => string,
): Array<{ items: T[]; section: string }> {
  const groups: Array<{ items: T[]; section: string }> = [];

  for (const item of items) {
    const section = getSection(item);
    const group = groups.find((entry) => entry.section === section);

    if (group) {
      group.items.push(item);
      continue;
    }

    groups.push({ items: [item], section });
  }

  return groups;
}

function pageToSearchItem(page: DocsSearchPage): DocsSearchItem {
  return {
    description: page.description ?? page.section,
    title: page.title,
    url: page.url,
    value: page.url,
  };
}

function resultToSearchItem(result: DocsSearchResult): DocsSearchItem {
  return {
    description: resultDescription(result),
    title: resultTitle(result),
    url: result.url,
    value: result.url,
  };
}

function SearchRow({
  isCurrent,
  onSelect,
  title,
  value,
}: {
  isCurrent?: boolean;
  onSelect: (url: string) => void;
  title: string;
  value: string;
}) {
  return (
    <CommandItem
      value={value}
      onSelect={onSelect}
      className="min-h-9 gap-2.5 rounded-md px-2.5 text-sm text-foreground"
    >
      <FileTextIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {isCurrent ? (
        <span className="shrink-0 text-xs font-medium text-muted-foreground">Current</span>
      ) : null}
    </CommandItem>
  );
}

function navigateToDocsUrl(navigate: ReturnType<typeof useNavigate>, url: string) {
  const [pathname, hash] = url.split("#");

  if (pathname === "/docs" || pathname === "/docs/") {
    void navigate({ to: "/docs", hash });
    return;
  }

  if (pathname.startsWith("/docs/")) {
    void navigate({
      to: "/docs/$",
      params: { _splat: pathname.slice("/docs/".length) },
      hash,
    });
  }
}

function DocsSearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="hidden h-8 min-w-[248px] items-center gap-2 rounded-[7px] border border-border bg-muted/50 px-2.5 text-left text-[13px] leading-[1.1] text-muted-foreground shadow-[var(--shadow-control)] transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none md:flex"
      >
        <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">Search documentation...</span>
        <KbdGroup className="shrink-0">
          <Kbd className="h-[18px] min-w-[18px] px-1">⌘</Kbd>
          <Kbd className="h-[18px] min-w-[18px] px-1">K</Kbd>
        </KbdGroup>
      </button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="md:hidden"
        aria-label="Search documentation"
        onClick={onOpen}
      >
        <SearchIcon />
      </Button>
    </>
  );
}

function DocsSearch({ activeUrl, pageTree }: { activeUrl: string; pageTree: Root }) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const navigate = useNavigate();
  const pages = React.useMemo(() => collectDocsSearchPages(pageTree.children), [pageTree]);
  const searchClient = React.useMemo(
    () => ({
      search: (query: string) => searchDocs({ data: query }),
    }),
    [],
  );
  const { search, setSearch, query } = useDocsSearch({
    client: searchClient,
    delayMs: 180,
  });
  const results = React.useMemo(
    () =>
      Array.isArray(query.data)
        ? query.data
            .map(toDocsSearchResult)
            .filter((result) => result.type !== "text")
            .slice(0, 12)
        : [],
    [query.data],
  );
  const pageGroups = React.useMemo(() => groupBySection(pages, (page) => page.section), [pages]);
  const resultGroups = React.useMemo(() => groupBySection(results, resultSection), [results]);
  const showSuggestions = search.trim().length === 0;
  const showLoading = !showSuggestions && query.isLoading;
  const showNoResults = !showSuggestions && !showLoading && results.length === 0;
  const activeItems = React.useMemo(
    () => (showSuggestions ? pages.map(pageToSearchItem) : results.map(resultToSearchItem)),
    [pages, results, showSuggestions],
  );

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!open && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open, setSearch]);

  React.useEffect(() => {
    if (!open) return;

    if (!activeItems.some((item) => item.value === selectedValue)) {
      setSelectedValue(activeItems[0]?.value ?? "");
    }
  }, [activeItems, open, selectedValue]);

  function selectUrl(url: string) {
    setOpen(false);
    navigateToDocsUrl(navigate, url);
  }

  return (
    <>
      <DocsSearchTrigger onOpen={() => setOpen(true)} />
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Search design system pages."
        className="w-[min(640px,calc(100vw-24px))]"
      >
        <Command
          value={selectedValue}
          onValueChange={setSelectedValue}
          shouldFilter={false}
          className="rounded-none border-0 bg-transparent p-0 shadow-none"
        >
          <CommandInput
            autoFocus
            onValueChange={setSearch}
            placeholder="Search documentation..."
            value={search}
            variant="modal"
          />
          <CommandList className="h-[min(60svh,440px)] scroll-py-2 p-2">
            {showSuggestions
              ? pageGroups.map((group) => (
                  <CommandGroup key={group.section} heading={group.section}>
                    {group.items.map((page) => (
                      <SearchRow
                        key={page.url}
                        isCurrent={page.url === activeUrl}
                        onSelect={selectUrl}
                        title={page.title}
                        value={page.url}
                      />
                    ))}
                  </CommandGroup>
                ))
              : null}

            {!showSuggestions && results.length > 0
              ? resultGroups.map((group) => (
                  <CommandGroup key={group.section} heading={group.section}>
                    {group.items.map((result) => (
                      <SearchRow
                        key={`${result.id}-${result.url}`}
                        onSelect={selectUrl}
                        title={resultTitle(result)}
                        value={result.url}
                      />
                    ))}
                  </CommandGroup>
                ))
              : null}

            {showLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Searching...</div>
            ) : null}
            {query.error ? (
              <div className="py-8 text-center text-sm text-destructive">
                Search is unavailable.
              </div>
            ) : null}
            {showNoResults && !query.error ? (
              <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
                No results found.
              </CommandEmpty>
            ) : null}
          </CommandList>
          <div className="flex h-10 items-center gap-2 border-t border-border bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
            Go to Page
            <Kbd>
              <CornerDownLeftIcon className="size-3" />
            </Kbd>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}

export { DocsSearch };
