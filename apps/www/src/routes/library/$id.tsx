import { createFileRoute, notFound } from "@tanstack/react-router";
import { posts, talks } from "@/routes/library/-data";
import { PostPage } from "@/routes/library/-components/post-page";
import { TalkPage } from "@/routes/library/-components/talk-page";

export const Route = createFileRoute("/library/$id")({
  loader: ({ params }) => {
    const post = posts.find(({ id }) => id === params.id);
    if (post)
      return { kind: "post", id: post.id, title: post.title, subtitle: post.description } as const;
    const talk = talks.find(({ id }) => id === params.id);
    if (talk) return { kind: "talk", talk } as const;
    throw notFound();
  },
  head: ({ loaderData: entry }) => {
    if (!entry) return {};
    const { title, subtitle } = entry.kind === "talk" ? entry.talk : entry;
    const description = subtitle ?? title;
    return {
      meta: [
        { title: `${title} · Manik Rana` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(entry.kind === "post"
          ? [
              {
                property: "og:image",
                content: `https://manikrana.dev/writing/${entry.id}/og.png`,
              },
              { property: "og:image:alt", content: title },
            ]
          : []),
      ],
    };
  },
  component: LibraryEntryPage,
});

function LibraryEntryPage() {
  const entry = Route.useLoaderData();
  if (entry.kind === "post") return <PostPage id={entry.id} />;
  return <TalkPage talk={entry.talk} />;
}
