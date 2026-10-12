import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/talks/")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "library" });
  },
});
