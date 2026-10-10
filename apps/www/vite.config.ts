import { createReadStream, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";

// Nitro's dev server sends PDFs whole, so pdf.js would wait for the entire file before the first page.
function pdfRanges(): Plugin {
  return {
    name: "pdf-ranges",
    apply: "serve",
    configureServer(server) {
      const root = server.config.publicDir;
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (!pathname?.endsWith(".pdf")) return next();
        const file = resolve(root, `.${decodeURIComponent(pathname)}`);
        let size: number;
        try {
          if (!file.startsWith(root + sep)) throw new Error("Outside the public directory");
          size = statSync(file).size;
        } catch {
          return next();
        }
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range ?? "");
        const start = range ? Number(range[1]) : 0;
        const end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
        res.writeHead(range ? 206 : 200, {
          "accept-ranges": "bytes",
          "content-type": "application/pdf",
          "content-length": end - start + 1,
          ...(range && { "content-range": `bytes ${start}-${end}/${size}` }),
        });
        createReadStream(file, { start, end }).pipe(res);
      });
    },
  };
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    pdfRanges(),
    tailwindcss(),
    // The filter skips anchors and the image files the pages link to.
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true, filter: ({ path }) => !/[.#]/.test(path) },
    }),
    nitro({ preset: process.env.VERCEL ? "vercel" : "bun" }),
    viteReact(),
  ],
});
