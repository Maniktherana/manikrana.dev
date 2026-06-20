import { useNavigate } from "@tanstack/react-router";
import type { Root, Node } from "fumadocs-core/page-tree";
import type { SortedResult } from "fumadocs-core/search";
import { useDocsSearch } from "fumadocs-core/search/client";
import { ClipboardIcon, CornerDownLeftIcon, SearchIcon, XIcon } from "lucide-react";
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
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { searchDocs } from "@/lib/docs-search";
import { cn } from "@/lib/utils";

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

type DialogOpenChangeDetails = {
  cancel: () => void;
  reason: string;
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

function sectionLabel(section: string) {
  if (section === "Blocks") return "Block";
  if (section === "Components") return "Component";

  return section;
}

function resultKindLabel(result: DocsSearchResult) {
  if (result.type === "heading") return "Section";
  if (result.type === "text") return "Text";

  const component = resultComponent(result);
  if (component) return sectionLabel(component.category);

  return "Document";
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
  description,
  isCurrent,
  meta,
  onSelect,
  title,
  value,
}: {
  description?: string;
  isCurrent?: boolean;
  meta: string;
  onSelect: (url: string) => void;
  title: string;
  value: string;
}) {
  return (
    <CommandItem
      value={value}
      onSelect={onSelect}
      className="min-h-8 items-center rounded-[7px] px-3 py-1.5 text-[#f4f4f5] data-selected:bg-white/[.075] data-selected:text-white data-selected:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_5%)]"
    >
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate text-[13px] leading-[1.15] font-semibold text-current">
          {title}
        </span>
        {description ? (
          <span className="hidden min-w-0 flex-1 truncate text-[12px] leading-[1.15] font-medium text-[#8e8e93] sm:block">
            {description}
          </span>
        ) : null}
      </span>
      <CommandShortcut
        className={cn(
          "text-[11px] leading-none font-semibold tracking-normal text-[#9a9aa0] group-data-selected/command-item:text-[#d8d8dc]",
          isCurrent && "text-[#d8d8dc]",
        )}
      >
        {isCurrent ? "Current" : meta}
      </CommandShortcut>
    </CommandItem>
  );
}

function DocsSearchActions({
  onClose,
  onCopyLink,
  onDismiss,
  onOpen,
  target,
}: {
  onClose: () => void;
  onCopyLink: () => void;
  onDismiss: () => void;
  onOpen: () => void;
  target?: DocsSearchItem;
}) {
  const firstActionRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      firstActionRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;

    event.preventDefault();
    event.stopPropagation();
    onDismiss();
  }

  return (
    <div
      role="menu"
      aria-label="Search actions"
      onKeyDown={handleKeyDown}
      className="docs-search-actions absolute right-2.5 bottom-10 z-20 w-[min(330px,calc(100%-20px))] overflow-hidden rounded-[11px] border border-white/[.13] bg-[#1b1b1d]/95 text-white shadow-[0_18px_70px_rgb(0_0_0_/_55%),0_0_0_1px_rgb(255_255_255_/_4%),inset_0_1px_0_rgb(255_255_255_/_8%)] backdrop-blur-xl"
    >
      <div className="border-b border-white/[.09] px-3 py-2.5">
        <div className="text-[11px] leading-none font-semibold text-[#9a9aa0]">Actions</div>
        <div className="mt-1.5 truncate text-[13px] leading-none font-semibold text-[#f4f4f5]">
          {target?.title ?? "No result selected"}
        </div>
      </div>
      <div className="p-1.5">
        <button
          ref={firstActionRef}
          type="button"
          role="menuitem"
          data-docs-search-action=""
          data-docs-search-primary-action=""
          disabled={!target}
          onClick={onOpen}
          className="group flex min-h-8 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[13px] leading-none font-semibold text-[#f4f4f5] outline-none hover:bg-white/[.075] focus-visible:bg-white/[.075] disabled:pointer-events-none disabled:opacity-45"
        >
          <CornerDownLeftIcon className="size-[15px] text-[#b8b8bf]" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">Open selected result</span>
          <Kbd className="h-5 min-w-5 px-1.5">↵</Kbd>
        </button>
        <button
          type="button"
          role="menuitem"
          data-docs-search-action=""
          disabled={!target}
          onClick={onCopyLink}
          className="group mt-0.5 flex min-h-8 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[13px] leading-none font-semibold text-[#f4f4f5] outline-none hover:bg-white/[.075] focus-visible:bg-white/[.075] disabled:pointer-events-none disabled:opacity-45"
        >
          <ClipboardIcon className="size-[15px] text-[#b8b8bf]" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">Copy link</span>
          <KbdGroup>
            <Kbd className="h-5 min-w-5 px-1.5">⌘</Kbd>
            <Kbd className="h-5 min-w-5 px-1.5">C</Kbd>
          </KbdGroup>
        </button>
        <button
          type="button"
          role="menuitem"
          data-docs-search-action=""
          onClick={onClose}
          className="group mt-0.5 flex min-h-8 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[13px] leading-none font-semibold text-[#f4f4f5] outline-none hover:bg-white/[.075] focus-visible:bg-white/[.075]"
        >
          <XIcon className="size-[15px] text-[#b8b8bf]" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">Close search</span>
        </button>
      </div>
    </div>
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
        <SearchIcon className="size-[15px] shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">Search documentation...</span>
        <KbdGroup className="shrink-0">
          <Kbd className="h-[18px] min-w-[18px] px-1">⌘</Kbd>
          <Kbd className="h-[18px] min-w-[18px] px-1">K</Kbd>
        </KbdGroup>
      </button>
      <Button
        type="button"
        variant="secondary"
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
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
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
    delayMs: 80,
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
  const selectedItem = React.useMemo(
    () => activeItems.find((item) => item.value === selectedValue) ?? activeItems[0],
    [activeItems, selectedValue],
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
    if (open) return;

    setActionsOpen(false);
    setSearch("");
  }, [open, setSearch]);

  React.useEffect(() => {
    if (!open) return;

    setActionsOpen(false);
  }, [open, search]);

  React.useEffect(() => {
    if (!open) return;

    if (!activeItems.some((item) => item.value === selectedValue)) {
      setSelectedValue(activeItems[0]?.value ?? "");
    }
  }, [activeItems, open, selectedValue]);

  React.useEffect(() => {
    if (!open || !actionsOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        dismissActions();
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        moveActionsFocus(event.key);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        const action = currentActionButton() ?? actionButtons()[0];
        if (!action) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        action.click();
      }
    }

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [actionsOpen, open]);

  function selectUrl(url: string) {
    setActionsOpen(false);
    setOpen(false);
    navigateToDocsUrl(navigate, url);
  }

  function dismissActions() {
    setActionsOpen(false);
    window.requestAnimationFrame(() => {
      const input =
        searchInputRef.current ??
        document.querySelector<HTMLInputElement>("[data-docs-search-input]");

      input?.focus();
    });
  }

  function actionButtons() {
    return Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-docs-search-action]:not(:disabled)"),
    );
  }

  function currentActionButton() {
    const activeElement = document.activeElement;

    if (
      activeElement instanceof HTMLButtonElement &&
      activeElement.matches("[data-docs-search-action]")
    ) {
      return activeElement;
    }

    return null;
  }

  function moveActionsFocus(key: string) {
    const buttons = actionButtons();
    if (buttons.length === 0) return;

    const current = currentActionButton();
    const currentIndex = current ? buttons.indexOf(current) : -1;
    const lastIndex = buttons.length - 1;

    if (key === "Home") {
      buttons[0]?.focus();
      return;
    }

    if (key === "End") {
      buttons[lastIndex]?.focus();
      return;
    }

    if (key === "ArrowUp") {
      const nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
      buttons[nextIndex]?.focus();
      return;
    }

    const nextIndex = currentIndex < 0 || currentIndex >= lastIndex ? 0 : currentIndex + 1;
    buttons[nextIndex]?.focus();
  }

  function openSelectedItem() {
    if (!selectedItem) return;

    selectUrl(selectedItem.url);
  }

  function closeSearch() {
    setActionsOpen(false);
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean, eventDetails: DialogOpenChangeDetails) {
    if (!nextOpen && actionsOpen && eventDetails.reason === "escape-key") {
      eventDetails.cancel();
      dismissActions();
      return;
    }

    setOpen(nextOpen);
  }

  function copySelectedLink() {
    if (!selectedItem) return;

    const url = new URL(selectedItem.url, window.location.origin);
    void navigator.clipboard?.writeText(url.toString());
    dismissActions();
  }

  function toggleActions() {
    if (actionsOpen) {
      dismissActions();
      return;
    }

    setActionsOpen(true);
  }

  function handleCommandKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const key = event.key.toLowerCase();

    if ((event.metaKey || event.ctrlKey) && key === "k") {
      event.preventDefault();
      event.stopPropagation();
      toggleActions();
      return;
    }

    if (actionsOpen && key === "c" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.stopPropagation();
      copySelectedLink();
      return;
    }

    if (actionsOpen && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismissActions();
    }
  }

  return (
    <>
      <DocsSearchTrigger onOpen={() => setOpen(true)} />
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search documentation"
        description="Search design system pages."
        overlayClassName="bg-black/35 backdrop-blur-[8px] duration-150"
        className="docs-search-dialog top-[42%] w-[min(740px,calc(100vw-24px))] overflow-hidden rounded-[13px]! border border-white/[.13] bg-[#151516]/95 text-white shadow-[0_28px_90px_rgb(0_0_0_/_62%),0_0_0_1px_rgb(255_255_255_/_4%),inset_0_1px_0_rgb(255_255_255_/_8%)] backdrop-blur-2xl"
      >
        <Command
          value={selectedValue}
          onValueChange={setSelectedValue}
          onKeyDown={handleCommandKeyDown}
          shouldFilter={false}
          className="relative rounded-none border-0 bg-transparent p-0 text-white shadow-none [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:leading-none [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-normal [&_[cmdk-group-heading]]:text-[#77777f] [&_[data-slot=command-input-wrapper]]:border-white/[.09] [&_[data-slot=command-input-wrapper]]:bg-transparent [&_[data-slot=command-input]]:h-[52px] [&_[data-slot=command-input]]:px-3.5 [&_[data-slot=command-input]]:text-[17px] [&_[data-slot=command-input]]:font-medium [&_[data-slot=command-input]]:text-[#f4f4f5] [&_[data-slot=command-input]]:placeholder:text-[#8c8c92]"
        >
          <CommandInput
            autoFocus
            ref={searchInputRef}
            data-docs-search-input=""
            onValueChange={setSearch}
            placeholder="Search docs and components..."
            value={search}
            variant="modal"
          />
          <CommandList className="min-h-[292px] max-h-[min(382px,calc(100svh-176px))] scroll-py-1.5 p-1.5">
            {showSuggestions ? (
              <>
                {pageGroups.map((group) => (
                  <CommandGroup key={group.section} heading={group.section} className="p-0">
                    {group.items.map((page) => (
                      <SearchRow
                        key={page.url}
                        description={page.description ?? page.section}
                        isCurrent={page.url === activeUrl}
                        meta={sectionLabel(page.section)}
                        onSelect={selectUrl}
                        title={page.title}
                        value={page.url}
                      />
                    ))}
                  </CommandGroup>
                ))}
              </>
            ) : null}

            {!showSuggestions && results.length > 0 ? (
              <>
                {resultGroups.map((group) => (
                  <CommandGroup key={group.section} heading={group.section} className="p-0">
                    {group.items.map((result) => {
                      const description = resultDescription(result);

                      return (
                        <SearchRow
                          key={`${result.id}-${result.url}`}
                          description={description}
                          meta={resultKindLabel(result)}
                          onSelect={selectUrl}
                          title={resultTitle(result)}
                          value={result.url}
                        />
                      );
                    })}
                  </CommandGroup>
                ))}
              </>
            ) : null}

            {showLoading ? (
              <div className="py-8 text-center text-[13px] font-medium text-[#8e8e93]">
                Searching...
              </div>
            ) : null}
            {query.error ? (
              <div className="py-8 text-center text-[13px] font-medium text-[#f87171]">
                Search is unavailable.
              </div>
            ) : null}
            {showNoResults && !query.error ? (
              <CommandEmpty className="py-8 text-center text-[13px] font-medium text-[#8e8e93]">
                No results found.
              </CommandEmpty>
            ) : null}
          </CommandList>
          {actionsOpen ? (
            <DocsSearchActions
              target={selectedItem}
              onOpen={openSelectedItem}
              onCopyLink={copySelectedLink}
              onDismiss={dismissActions}
              onClose={closeSearch}
            />
          ) : null}
          <div className="flex h-9 items-center justify-between border-t border-white/[.09] bg-white/[.035] px-2.5 text-[12px] leading-none font-semibold text-[#9a9aa0]">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">Design UI</span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-1.5 sm:flex">
                Open
                <Kbd className="h-5 min-w-5 px-1.5">
                  <CornerDownLeftIcon className="size-3" />
                </Kbd>
              </span>
              <button
                type="button"
                onClick={toggleActions}
                className="flex items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-[#9a9aa0] outline-none hover:bg-white/[.07] hover:text-[#d8d8dc] focus-visible:bg-white/[.07] focus-visible:text-[#d8d8dc]"
              >
                Actions
                <KbdGroup>
                  <Kbd className="h-5 min-w-5 px-1.5">⌘</Kbd>
                  <Kbd className="h-5 min-w-5 px-1.5">K</Kbd>
                </KbdGroup>
              </button>
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}

export { DocsSearch };
