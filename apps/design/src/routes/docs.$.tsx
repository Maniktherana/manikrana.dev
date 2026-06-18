import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import browserCollections from "collections/browser";

import { DocsShell } from "@/components/design/docs-shell";
import { mdxComponents } from "@/components/design/mdx-components";

const docsClientLoader = browserCollections.docs.createClientLoader({
  component({ default: MDX }, props: { components: typeof mdxComponents }) {
    return <MDX components={props.components} />;
  },
});

const loadComponentDoc = createServerFn({
  method: "GET",
})
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const {
      docsPageTree,
      docsSource,
      getComponentDocPageBySlugs,
      getFirstComponentDocPage,
      serializeComponentDocPage,
    } = await import("@/lib/docs-source");
    const page = slugs.length > 0 ? getComponentDocPageBySlugs(slugs) : getFirstComponentDocPage();

    if (!page) throw notFound();

    return {
      page: serializeComponentDocPage(page),
      pageTree: await docsSource.serializePageTree(docsPageTree),
    };
  });

export const Route = createFileRoute("/docs/$")({
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];

    if (slugs.length === 1 && slugs[0] === "commandbar") {
      throw redirect({
        to: "/docs/$",
        params: { _splat: "command-palette" },
        replace: true,
      });
    }

    const data = await loadComponentDoc({ data: slugs });

    await docsClientLoader.preload(data.page.path);

    return data;
  },
  component: ComponentDocsRoute,
});

function ComponentDocsRoute() {
  const { page, pageTree } = Route.useLoaderData();

  return (
    <DocsShell page={page} pageTree={pageTree}>
      {docsClientLoader.useContent(page.path, { components: mdxComponents })}
    </DocsShell>
  );
}
