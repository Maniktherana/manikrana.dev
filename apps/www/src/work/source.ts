import { createServerFn } from "@tanstack/react-start";
import type { Dependencies } from "@/work/dependencies";
import { findWork } from "@/work/registry";

export type SourceFile = { name: string; code: string; html: string };
export type ItemSource = { files: SourceFile[]; dependencies: Dependencies };

// Highlights an item's source files, then its usage example, and reads what
// they need to install, all on the server, so neither Shiki nor that work runs
// in the browser. The page copies text from what this returns.
export const getSource = createServerFn({ method: "GET" })
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
