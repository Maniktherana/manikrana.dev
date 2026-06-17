import { Navigate, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/")({
  component: DocsIndexRedirect,
});

function DocsIndexRedirect() {
  return <Navigate to="/docs/$" params={{ _splat: "button" }} replace />;
}
