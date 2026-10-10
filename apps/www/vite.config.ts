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
    // The filter skips anchors and the image files the pages link to.
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, filter: ({ path }) => !/[.#]/.test(path) },
    }),
    nitro({ preset: process.env.VERCEL ? "vercel" : "bun" }),
    viteReact(),
  ],
});
