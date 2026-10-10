import { talks } from "@/data/talks";
import type { WebImage } from "@/work/image-tray/image-tray";

// What the demo's web search turns up: the covers of the talks on this site,
// each found on its talks page.
export const images: WebImage[] = talks.map((talk) => ({
  id: talk.id,
  url: `/talks/${talk.id}-cover.png`,
  title: `${talk.title}, ${talk.events.map(({ venue }) => venue).join(" and ")}`,
  sourceName: "manikrana.dev",
  sourceUrl: "https://manikrana.dev/talks",
  faviconUrl: "/apple-touch-icon.png",
}));
