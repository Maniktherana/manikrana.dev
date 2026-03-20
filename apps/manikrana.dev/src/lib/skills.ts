import {
  buildCliScript,
  buildInstallScript,
  discoverSkills,
  getSkillByName,
  readSkillFile,
} from "../../../../packages/agent-skills/src/index"

export function listSkills() {
  return discoverSkills().map((skill) => ({
    name: skill.frontmatter.name,
    description: skill.frontmatter.description,
    files: skill.files,
  }))
}

export function getSkill(name: string) {
  const skill = getSkillByName(name)

  if (!skill) return null

  return {
    frontmatter: skill.frontmatter,
    content: skill.body,
    files: skill.files,
  }
}

export function getSkillFile(name: string, path: string) {
  const skill = getSkillByName(name)

  if (!skill) return null

  return readSkillFile(skill, path)
}

export function renderInstallShellScript(origin: string) {
  return buildInstallScript(origin)
}

export function renderInstallCli(origin: string) {
  return buildCliScript(origin)
}
