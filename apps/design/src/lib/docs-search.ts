import { createServerFn } from "@tanstack/react-start";
import { createFromSource } from "fumadocs-core/search/server";

import { docsSource } from "@/lib/docs-source";

const docsSearchServer = createFromSource(docsSource, {
  language: "english",
});

export const searchDocs = createServerFn({
  method: "GET",
})
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
    if (query.trim().length === 0) return [];

    return docsSearchServer.search(query, {
      limit: 12,
    });
  });
