import type { PlopTypes } from "@turbo/gen"

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("distributable-skill", {
    description: "Create a new distributable Agent Skills-compliant skill",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Skill name (lowercase-hyphenated):",
        validate: (value: string) => {
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
            ? true
            : "Use lowercase letters, numbers, and hyphens only."
        },
      },
      {
        type: "input",
        name: "description",
        message: "Skill description:",
        validate: (value: string) => {
          return value.trim().length > 0 ? true : "Description is required."
        },
      },
      {
        type: "confirm",
        name: "includePracticalTips",
        message: "Add a practical tips reference file?",
        default: true,
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/agent-skills/skills/{{name}}/SKILL.md",
        templateFile: "turbo/generators/templates/distributable-skill/SKILL.md.hbs",
      },
      {
        type: "add",
        path: "packages/agent-skills/skills/{{name}}/references/practical-tips.md",
        templateFile:
          "turbo/generators/templates/distributable-skill/references/practical-tips.md.hbs",
        skip: ({ includePracticalTips }) => {
          return includePracticalTips ? undefined : "Practical tips reference not requested"
        },
      },
    ],
  })
}
