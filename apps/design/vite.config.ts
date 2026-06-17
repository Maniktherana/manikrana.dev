import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [mdx(), devtools(), tailwindcss(), tanstackStart(), viteReact()],
});

export default config;
