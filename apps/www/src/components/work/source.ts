import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import type { Dependencies } from "@/components/work/dependencies";
import { findWork } from "@/components/work/registry";

export type SourceFile = { name: string; code: string; html: string };
export type ItemSource = { files: SourceFile[]; dependencies: Dependencies };

const UI = "@manikrana/ui/components/";

export const getSource = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<ItemSource | null> => {
    const item = findWork(slug);
    const files = [...(item?.usage ? [item.usage] : []), ...(item?.files ?? [])];
    if (!item || !files.length) return null;
    const sources = import.meta.glob<string>(["./*/*.{ts,tsx}", "./*.tsx"], {
      query: "?raw",
      import: "default",
    });
    const shared = import.meta.glob<string>("../../../../../packages/ui/components/*.tsx", {
      query: "?raw",
      import: "default",
    });
    const [{ codeToHtml }, { dependencies }] = await Promise.all([
      import("shiki"),
      import("@/components/work/dependencies"),
    ]);
    const highlighted = await Promise.all(
      files.map(async (entry) => {
        const name = entry.split("/").at(-1)!;
        const load = entry.startsWith(UI)
          ? shared[`../../../../../packages/ui/components/${name}`]
          : sources[entry.startsWith("../") ? `./${entry.slice(3)}` : `./${slug}/${entry}`];
        if (!load) throw new Error(`No source file for ${entry} in ${slug}`);
        const code = await load();
        const lang = name.endsWith(".tsx") ? "tsx" : "ts";
        return { name, code, html: await codeToHtml(code, { lang, theme: "vesper" }) };
      }),
    );
    return { files: highlighted, dependencies: dependencies(item, highlighted) };
  });
