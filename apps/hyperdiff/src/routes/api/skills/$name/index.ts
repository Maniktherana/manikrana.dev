import { createFileRoute } from "@tanstack/react-router"
import { getSkill } from "@/lib/skills"

export const Route = createFileRoute("/api/skills/$name/")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const skill = getSkill(params.name)

        if (!skill) {
          return new Response("Skill not found", { status: 404 })
        }

        return Response.json(skill)
      },
    },
  },
})
