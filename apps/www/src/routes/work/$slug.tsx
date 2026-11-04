import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/work/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/lab/$slug", params, statusCode: 301 });
  },
});
