import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import type { ShikiTransformer } from "shiki";
import { defineConfig } from "vite";

// A fence's file="..." becomes data-file on its <pre>, for the code block's header.
const fileName: ShikiTransformer = {
  pre(node) {
    const file = /file="([^"]+)"/.exec(this.options.meta?.__raw ?? "")?.[1];
    if (file) node.properties["data-file"] = file;
  },
};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              theme: "vesper",
              transformers: [fileName],
            },
          ],
        ],
      }),
    },
    tailwindcss(),
    // The filter skips anchors and the image files the pages link to.
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, filter: ({ path }) => !/[.#]/.test(path) },
    }),
    nitro({ preset: process.env.VERCEL ? "vercel" : "bun" }),
    viteReact(),
  ],
});
