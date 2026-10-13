import { createFileRoute, notFound } from "@tanstack/react-router";
import { papers, posts, talks } from "@/content/library";
import { PaperPage } from "@/routes/library/-components/paper-page";
import { PostPage } from "@/routes/library/-components/post-page";
import { TalkPage } from "@/routes/library/-components/talk-page";

export const Route = createFileRoute("/library/$id")({
  loader: ({ params }) => {
    const post = posts.find(({ id }) => id === params.id);
    if (post)
      return { kind: "post", id: post.id, title: post.title, subtitle: post.description } as const;
    const talk = talks.find(({ id }) => id === params.id);
    if (talk) return { kind: "talk", talk } as const;
    const paper = papers.find(({ id }) => id === params.id);
    if (paper) return { kind: "paper", paper } as const;
    throw notFound();
  },
  head: ({ loaderData: entry }) => {
    if (!entry) return {};
    const { title, subtitle } =
      entry.kind === "talk" ? entry.talk : entry.kind === "post" ? entry : entry.paper;
    const description = subtitle ?? title;
    return {
      meta: [
        { title: `${title} · Manik Rana` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(entry.kind === "talk"
          ? [
              {
                property: "og:image",
                content: `https://manikrana.dev/talks/${entry.talk.id}-cover.png`,
              },
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
  return entry.kind === "talk" ? <TalkPage talk={entry.talk} /> : <PaperPage paper={entry.paper} />;
}
