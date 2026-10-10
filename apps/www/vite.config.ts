import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    // Every page is prerendered from the links on the home page, so each one
    // ships as a static file. The server only renders the 404 page. The filter
    // skips the anchors and the images the pages link to.
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, filter: ({ path }) => !/[.#]/.test(path) },
    }),
    nitro({ preset: process.env.VERCEL ? "vercel" : "bun" }),
    viteReact(),
  ],
});
