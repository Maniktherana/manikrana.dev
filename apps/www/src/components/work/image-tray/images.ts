import { talks } from "@/content/library";
import type { WebImage } from "@/components/work/image-tray/image-tray";

export const images: WebImage[] = talks.map((talk) => ({
  id: talk.id,
  url: `/talks/${talk.id}-cover.png`,
  title: `${talk.title}, ${talk.events.map(({ venue }) => venue).join(" and ")}`,
  sourceName: "manikrana.dev",
  sourceUrl: `https://manikrana.dev/library/${talk.id}`,
  faviconUrl: "/apple-touch-icon.png",
}));
