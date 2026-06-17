import { isValidElement, type ComponentType, type ElementType, type ReactNode } from "react";
import type { Node } from "fumadocs-core/page-tree";
import type { TOCItemType } from "fumadocs-core/toc";
import { loader, type InferPageType } from "fumadocs-core/source";
import { docs } from "collections/server";

import {
  catalogById,
  componentCatalog,
  type ComponentRecord,
} from "@/components/design/component-catalog";
import type { Frontmatter, SerializedComponentDocPage, SerializedTocItem } from "@/lib/docs-shared";

type MdxComponent = ComponentType<{
  components?: Record<string, ElementType>;
}>;

export const docsSource = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

type FumadocsPage = InferPageType<typeof docsSource>;

type ComponentDocPage = {
  id: string;
  title: string;
  description: string;
  url: string;
  path: string;
  body: MdxComponent;
  toc: TOCItemType[];
  frontmatter: Frontmatter;
  component: ComponentRecord;
  page: FumadocsPage;
};

function idFromSlugs(slugs: string[]) {
  return slugs.at(-1) ?? "";
}

function toComponentDocPage(page: FumadocsPage): ComponentDocPage | undefined {
  const id = idFromSlugs(page.slugs);
  const component = catalogById[id];

  if (!component) return undefined;

  const frontmatter: Frontmatter = {
    base: (page.data as Frontmatter).base,
    component: (page.data as Frontmatter).component,
    description: page.data.description,
    featured: (page.data as Frontmatter).featured,
    title: page.data.title,
  };

  return {
    id,
    body: page.data.body as MdxComponent,
    component,
    description: page.data.description ?? component.description,
    frontmatter,
    page,
    path: page.path,
    title: page.data.title ?? component.title,
    toc: page.data.toc,
    url: page.url,
  };
}

function serializeToc(toc: TOCItemType[]): SerializedTocItem[] {
  return toc.map((item) => ({
    depth: item.depth,
    title: nodeToText(item.title),
    url: item.url,
  }));
}

function nodeToText(node: ReactNode): string {
  if (node === undefined || node === null || typeof node === "boolean") return "";

  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(nodeToText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeToText(node.props.children);
  }

  return "";
}

function serializeComponentDocPage(page: ComponentDocPage): SerializedComponentDocPage {
  return {
    id: page.id,
    component: page.component,
    description: page.description,
    frontmatter: page.frontmatter,
    path: page.path,
    title: page.title,
    toc: serializeToc(page.toc),
    url: page.url,
  };
}

export const docsPageTree = docsSource.pageTree;

export const componentDocPages = docsSource
  .getPages()
  .map(toComponentDocPage)
  .filter((page): page is ComponentDocPage => Boolean(page))
  .sort(
    (a, b) =>
      componentCatalog.findIndex((component) => component.id === a.id) -
      componentCatalog.findIndex((component) => component.id === b.id),
  );

export const componentDocsById = Object.fromEntries(
  componentDocPages.map((page) => [page.id, page]),
) as Record<string, ComponentDocPage>;

const componentDocsByUrl = Object.fromEntries(
  componentDocPages.map((page) => [page.url, page]),
) as Record<string, ComponentDocPage>;

function getFirstPageUrl(nodes: Node[]): string | undefined {
  for (const node of nodes) {
    if (node.type === "page") return node.url;

    if (node.type === "folder") {
      if (node.index) return node.index.url;

      const url = getFirstPageUrl(node.children);
      if (url) return url;
    }
  }

  return undefined;
}

export function getComponentDocPage(componentId: string) {
  return componentDocsById[componentId];
}

export function getComponentDocPageBySlugs(slugs: string[]) {
  const page = docsSource.getPage(slugs);

  return page ? toComponentDocPage(page) : undefined;
}

export function getFirstComponentDocPage() {
  const firstPageUrl = getFirstPageUrl(docsPageTree.children);

  return firstPageUrl ? componentDocsByUrl[firstPageUrl] : componentDocPages[0];
}

export { serializeComponentDocPage };
export type { ComponentDocPage };
