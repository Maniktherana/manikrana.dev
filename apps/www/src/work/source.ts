import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import type { Dependencies } from "@/work/dependencies";
import { findWork } from "@/work/registry";

export type SourceFile = { name: string; code: string; html: string };
export type ItemSource = { files: SourceFile[]; dependencies: Dependencies };

// Highlights an item's source files, then its usage example, and reads what
// they need to install, all at build time, so neither Shiki nor that work runs
// in the browser. Prerendering saves each result as JSON next to the pages,
// and the built site fetches that file instead of calling a server. The page
// copies text from what this returns.
export const getSource = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<ItemSource | null> => {
    const item = findWork(slug);
    const files = [...(item?.files ?? []), ...(item?.usage ? [item.usage] : [])];
    if (!item || !files.length) return null;
    const sources = import.meta.glob<string>(["./*/*.{ts,tsx}", "./*.tsx"], {
      query: "?raw",
      import: "default",
    });
    const [{ codeToHtml }, { dependencies }] = await Promise.all([
      import("shiki"),
      import("@/work/dependencies"),
    ]);
    const highlighted = await Promise.all(
      files.map(async (entry) => {
        // "../iphone.tsx" is a module several items share, beside the registry.
        const path = entry.startsWith("../") ? `./${entry.slice(3)}` : `./${slug}/${entry}`;
        const load = sources[path];
        if (!load) throw new Error(`No source file at src/work/${path.slice(2)}`);
        const name = entry.replace(/^\.\.\//, "");
        const code = await load();
        const lang = name.endsWith(".tsx") ? "tsx" : "ts";
        return { name, code, html: await codeToHtml(code, { lang, theme: "vesper" }) };
      }),
    );
    return { files: highlighted, dependencies: dependencies(item, highlighted) };
  });
