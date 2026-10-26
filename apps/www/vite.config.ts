import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
} from "@shikijs/transformers";
import rehypeKatex from "rehype-katex";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { loupe } from "@manikrana/loupe/vite";
import { nitro } from "nitro/vite";
import type { ShikiTransformer } from "shiki";
import { defineConfig } from "vite";

// A fence's file="..." becomes data-file on its <pre>, for the code block's header. It comes out of
// the raw meta so transformerMetaWordHighlight doesn't read the path's slashes as a /word/.
const fileName: ShikiTransformer = {
  preprocess() {
    const meta = this.options.meta;
    const file = /file="([^"]+)"/.exec(meta?.__raw ?? "");
    if (!meta?.__raw || !file) return;
    meta["data-file"] = file[1];
    meta.__raw = meta.__raw.replace(file[0], "");
  },
};

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
    allowedHosts: [".ngrok.app", ".ngrok-free.app"],
  },
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          remarkMdxFrontmatter,
          [remarkMath, { singleDollarTextMath: false }],
        ],
        rehypePlugins: [
          rehypeKatex,
          [
            rehypeShiki,
            {
              theme: "vesper",
              transformers: [
                fileName,
                transformerMetaHighlight(),
                transformerMetaWordHighlight(),
                transformerNotationDiff(),
              ],
            },
          ],
        ],
      }),
    },
    tailwindcss(),
    // The filter skips anchors and the image files the pages link to.
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        filter: ({ path }) => !/[.#]/.test(path),
      },
      pages: [{ path: "/404", prerender: { enabled: true, outputPath: "/404.html" } }],
    }),
    nitro({ preset: "node" }),
    viteReact(),
    loupe(),
  ],
});
