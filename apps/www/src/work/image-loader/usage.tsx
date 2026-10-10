import { useEffect, useState } from "react";
import { ImageLoader } from "./image-loader";

export function Example({ prompt }: { prompt: string }) {
  const [image, setImage] = useState<{ prompt: string; url: string }>();
  const url = image?.prompt === prompt ? image.url : undefined;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/images", {
      method: "POST",
      body: JSON.stringify({ prompt, size: "1024x768" }),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: { url: string }) => setImage({ prompt, url: data.url }))
      .catch(() => {});
    return () => controller.abort();
  }, [prompt]);

  return (
    <ImageLoader
      status={url ? "done" : "generating"}
      src={url}
      alt={prompt}
      aspectRatio={4 / 3}
      grid={{ pattern: "weave" }}
      className="max-w-md"
    />
  );
}
