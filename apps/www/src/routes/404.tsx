import { createFileRoute } from "@tanstack/react-router";
import NotFound from "@/components/not-found";

// Prerendered to 404.html, which the static host serves for any unknown path.
export const Route = createFileRoute("/404")({
  head: () => ({ meta: [{ title: "Page not found · Manik Rana" }] }),
  component: NotFound,
});
