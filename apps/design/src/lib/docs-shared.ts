import type { SerializedPageTree } from "fumadocs-core/source/client";

import type { ComponentRecord } from "@/components/design/component-catalog";

export type Frontmatter = {
  title?: string;
  description?: string;
  component?: boolean;
  featured?: boolean;
  base?: string;
};

export type SerializedTocItem = {
  depth: number;
  title: string;
  url: string;
};

export type SerializedComponentDocPage = {
  id: string;
  title: string;
  description: string;
  url: string;
  path: string;
  toc: SerializedTocItem[];
  frontmatter: Frontmatter;
  component: ComponentRecord;
};

export type SerializedDocsPageTree = SerializedPageTree;

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
