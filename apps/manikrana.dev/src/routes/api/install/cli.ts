import { createFileRoute } from "@tanstack/react-router"
import { renderInstallCli } from "@/lib/skills"

export const Route = createFileRoute("/api/install/cli")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin

        return new Response(renderInstallCli(origin), {
          headers: {
            "content-type": "application/typescript; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        })
      },
    },
  },
})
