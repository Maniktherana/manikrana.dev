import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/work/")({
  beforeLoad: ({ location }) => {
    throw redirect({ to: "/lab", hash: location.hash, statusCode: 301 });
  },
});
