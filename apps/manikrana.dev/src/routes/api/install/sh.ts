import { createFileRoute } from "@tanstack/react-router"
import { renderInstallShellScript } from "@/lib/skills"

export const Route = createFileRoute("/api/install/sh")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin

        return new Response(renderInstallShellScript(origin), {
          headers: {
            "content-type": "text/x-shellscript; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        })
      },
    },
  },
})
