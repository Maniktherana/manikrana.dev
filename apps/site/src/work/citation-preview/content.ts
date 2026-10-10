import type { CitationSource } from "./source";

// The demo's question and the sources its answer cites, each with its site's own favicon
// and preview image. PromCon's page has no preview image, so it shows the talk's cover.
export const question = "How do I monitor my API?";

export const sources = {
  grafana: {
    url: "https://grafana.com/docs/loki/latest/",
    name: "Grafana",
    title: "Grafana Loki documentation",
    favicon: "/work/citation-preview/grafana-icon.png",
    image: "/work/citation-preview/grafana-loki.webp",
    snippet:
      "Loki stores and queries logs, indexing only their labels, the way Prometheus handles metrics.",
  },
  fossUnited: {
    url: "https://fossunited.org/c/delhi/delhi_june_2024",
    name: "FOSS United",
    title: "Intro to Observability",
    favicon: "/work/citation-preview/fossunited-icon.png",
    image: "/work/citation-preview/fossunited-delhi.webp",
    snippet: "Prometheus, Loki and Grafana, at FOSS United Delhi in June 2024.",
  },
  promcon: {
    url: "https://promcon.io/2024-berlin/",
    name: "PromCon",
    title: "Go-ing under the hood: the Prometheus parser",
    favicon: "/work/citation-preview/promcon-icon.png",
    image: "/work/citation-preview/promcon-talk.png",
    snippet: "Breaking and optimizing the Prometheus parser, at PromCon 2024 in Berlin.",
  },
  shadcn: {
    url: "https://ui.shadcn.com/blocks",
    name: "shadcn/ui",
    title: "Building Blocks for the Web",
    favicon: "/work/citation-preview/shadcn-icon.png",
    image: "/work/citation-preview/shadcn-blocks.png",
    snippet:
      "Clean, modern building blocks. Copy and paste into your apps. Works with all React frameworks.",
  },
} satisfies Record<string, CitationSource>;

export type SourceId = keyof typeof sources;
