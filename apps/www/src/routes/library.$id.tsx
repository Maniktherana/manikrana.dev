import { createFileRoute, notFound } from "@tanstack/react-router";
import { papers } from "@/data/papers";
import { talks } from "@/data/talks";
import { PaperPage } from "@/library/paper-page";
import { TalkPage } from "@/library/talk-page";

export const Route = createFileRoute("/library/$id")({
  loader: ({ params }) => {
    const talk = talks.find(({ id }) => id === params.id);
    if (talk) return { kind: "talk", talk } as const;
    const paper = papers.find(({ id }) => id === params.id);
    if (paper) return { kind: "paper", paper } as const;
    throw notFound();
  },
  head: ({ loaderData: entry }) => {
    if (!entry) return {};
    const { title, subtitle } = entry.kind === "talk" ? entry.talk : entry.paper;
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
  return entry.kind === "talk" ? <TalkPage talk={entry.talk} /> : <PaperPage paper={entry.paper} />;
}
