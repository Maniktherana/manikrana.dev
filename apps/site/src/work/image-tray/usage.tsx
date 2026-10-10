import { useState } from "react";
import { ImageStrip } from "./image-strip";
import { ImageTray, type WebImage } from "./image-tray";

const images: WebImage[] = [
  {
    id: "aurora",
    url: "/images/aurora.jpg",
    title: "Northern lights over Tromsø",
    sourceName: "example.com",
    sourceUrl: "https://example.com/aurora",
    faviconUrl: "https://example.com/favicon.ico",
  },
];

export function Example() {
  const [image, setImage] = useState<WebImage | null>(null);

  return (
    <>
      <ImageStrip images={images} onSelect={setImage} />
      <ImageTray image={image} onClose={() => setImage(null)} />
    </>
  );
}
