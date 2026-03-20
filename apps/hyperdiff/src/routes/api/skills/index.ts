import { createFileRoute } from "@tanstack/react-router"
import { listSkills } from "@/lib/skills"

export const Route = createFileRoute("/api/skills/")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          skills: listSkills(),
        })
      },
    },
  },
})
