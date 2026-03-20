import { createFileRoute } from "@tanstack/react-router"
import { getSkillFile } from "@/lib/skills"

export const Route = createFileRoute("/api/skills/$name/files/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat

        if (!path) {
          return new Response("File path is required", { status: 400 })
        }

        try {
          const file = getSkillFile(params.name, path)

          if (!file) {
            return new Response("Skill not found", { status: 404 })
          }

          return new Response(file, {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "public, max-age=300",
            },
          })
        } catch {
          return new Response("Skill file not found", { status: 404 })
        }
      },
    },
  },
})
