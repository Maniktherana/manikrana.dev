import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export type SkillFrontmatter = {
  name: string
  description: string
  license?: string
  compatibility?: string
  metadata?: Record<string, string>
  allowedTools?: string
}

export type SkillFile = {
  path: string
  kind: "skill" | "reference" | "asset" | "script" | "other"
}

export type Skill = {
  dir: string
  frontmatter: SkillFrontmatter
  body: string
  files: SkillFile[]
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

export function getSkillsRoot() {
  return resolve(packageRoot, "skills")
}

function stripQuotes(value: string) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

function parseFrontmatterBlock(frontmatter: string) {
  const result: Partial<SkillFrontmatter> = {}
  const metadata: Record<string, string> = {}
  let inMetadata = false

  for (const rawLine of frontmatter.split("\n")) {
    const line = rawLine.replace(/\r$/, "")

    if (!line.trim()) continue

    if (inMetadata) {
      const metadataMatch = line.match(/^\s{2}([^:]+):\s*(.*)$/)
      if (metadataMatch) {
        metadata[metadataMatch[1].trim()] = stripQuotes(metadataMatch[2])
        continue
      }
      inMetadata = false
    }

    const match = line.match(/^([A-Za-z-]+):\s*(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match

    if (key === "metadata") {
      inMetadata = true
      continue
    }

    const value = stripQuotes(rawValue)

    if (key === "allowed-tools") {
      result.allowedTools = value
      continue
    }

    if (key === "name" || key === "description" || key === "license" || key === "compatibility") {
      result[key] = value
    }
  }

  if (Object.keys(metadata).length > 0) {
    result.metadata = metadata
  }

  if (!result.name || !result.description) {
    throw new Error("Invalid SKILL.md frontmatter: missing required name or description")
  }

  return result as SkillFrontmatter
}

export function parseSkillMarkdown(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)

  if (!match) {
    throw new Error("Invalid SKILL.md: missing YAML frontmatter")
  }

  const [, frontmatterBlock, body] = match

  return {
    frontmatter: parseFrontmatterBlock(frontmatterBlock),
    body,
    rawFrontmatter: frontmatterBlock,
  }
}

function listFiles(rootDir: string, currentDir = rootDir): SkillFile[] {
  const files: SkillFile[] = []

  for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
    const fullPath = join(currentDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFiles(rootDir, fullPath))
      continue
    }

    const relativePath = relative(rootDir, fullPath).replaceAll("\\", "/")
    let kind: SkillFile["kind"] = "other"

    if (relativePath === "SKILL.md") kind = "skill"
    else if (relativePath.startsWith("references/")) kind = "reference"
    else if (relativePath.startsWith("assets/")) kind = "asset"
    else if (relativePath.startsWith("scripts/")) kind = "script"

    files.push({ path: relativePath, kind })
  }

  return files.sort((a, b) => a.path.localeCompare(b.path))
}

export function discoverSkills(): Skill[] {
  const root = getSkillsRoot()

  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = join(root, entry.name)
      const skillFile = join(dir, "SKILL.md")
      const markdown = readFileSync(skillFile, "utf8")
      const { frontmatter, body } = parseSkillMarkdown(markdown)

      return {
        dir,
        frontmatter,
        body,
        files: listFiles(dir),
      }
    })
    .sort((a, b) => a.frontmatter.name.localeCompare(b.frontmatter.name))
}

export function getSkillByName(name: string) {
  return discoverSkills().find((skill) => skill.frontmatter.name === name) ?? null
}

export function readSkillFile(skill: Skill, relativePath: string) {
  const safePath = resolve(skill.dir, relativePath)

  if (!safePath.startsWith(resolve(skill.dir))) {
    throw new Error("Invalid skill file path")
  }

  if (!existsSync(safePath) || !statSync(safePath).isFile()) {
    throw new Error("Skill file not found")
  }

  return readFileSync(safePath, "utf8")
}

function humanizeSkillName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function generateCursorRule(skill: Skill) {
  const title = humanizeSkillName(skill.frontmatter.name)
  const referenceFiles = skill.files
    .filter((file) => file.kind === "reference")
    .map((file) => file.path)

  const referenceMentions = referenceFiles
    .map((path) => {
      const baseName = path.split("/").pop() ?? path
      return `@${skill.frontmatter.name}-${baseName}`
    })
    .join("\n")

  const body = skill.body.trim()

  const content = [
    "---",
    `description: ${skill.frontmatter.description}`,
    "globs:",
    "alwaysApply: false",
    "---",
    "",
    `# ${title}`,
    "",
    body,
    referenceMentions ? `\n${referenceMentions}` : "",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()

  const files = new Map<string, string>()
  files.set(`${skill.frontmatter.name}.mdc`, content)

  for (const referenceFile of referenceFiles) {
    const baseName = referenceFile.split("/").pop() ?? referenceFile
    files.set(`${skill.frontmatter.name}-${baseName}`, readSkillFile(skill, referenceFile))
  }

  return files
}

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true })
}

function copySkillDir(skill: Skill, destinationRoot: string) {
  const targetDir = join(destinationRoot, skill.frontmatter.name)
  ensureDir(destinationRoot)
  rmSync(targetDir, { recursive: true, force: true })
  cpSync(skill.dir, targetDir, { recursive: true, force: true })
}

function writeCursorAdapter(skill: Skill, rulesDir: string) {
  ensureDir(rulesDir)

  for (const [fileName, content] of generateCursorRule(skill)) {
    rmSync(join(rulesDir, fileName), { force: true })
    writeFileSync(join(rulesDir, fileName), content)
  }
}

export type InstallOptions = {
  projectDir: string
  tool: "codex" | "claude" | "cursor" | "all"
}

export function installSkills(options: InstallOptions) {
  const skills = discoverSkills()
  const projectDir = resolve(options.projectDir)

  for (const skill of skills) {
    copySkillDir(skill, join(projectDir, ".agents/skills"))

    if (options.tool === "codex" || options.tool === "all") {
      copySkillDir(skill, join(projectDir, ".codex/skills"))
    }

    if (options.tool === "claude" || options.tool === "all") {
      copySkillDir(skill, join(projectDir, ".claude/skills"))
    }

    if (options.tool === "cursor" || options.tool === "all") {
      writeCursorAdapter(skill, join(projectDir, ".cursor/rules"))
    }
  }

  return skills.map((skill) => skill.frontmatter.name)
}

export function buildInstallScript(baseUrl: string) {
  const skills = discoverSkills()

  const lines = [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    `BASE_URL=${JSON.stringify(baseUrl)}`,
    `SKILLS=${JSON.stringify(skills.map((skill) => skill.frontmatter.name).join(" "))}`,
    "",
  ]

  for (const skill of skills) {
    const varName = skill.frontmatter.name.replaceAll("-", "_").toUpperCase()
    lines.push(
      `${varName}_FILES=${JSON.stringify(skill.files.map((file) => file.path).join(" "))}`,
    )
  }

  lines.push(
    "",
    'mkdir -p ".agents/skills"',
    'TMP_DIR="$(mktemp -d)"',
    'cleanup() { rm -rf "$TMP_DIR"; }',
    "trap cleanup EXIT",
    "",
    'HAS_CODEX=0',
    'if [ -d ".codex" ] || [ -f "AGENTS.md" ]; then',
    "  HAS_CODEX=1",
    "fi",
    "",
    'HAS_CLAUDE=0',
    'if [ -d ".claude" ]; then',
    "  HAS_CLAUDE=1",
    "fi",
    "",
    'HAS_CURSOR=0',
    'if [ -d ".cursor" ]; then',
    "  HAS_CURSOR=1",
    "fi",
    "",
    "for SKILL in $SKILLS; do",
    '  FILES_VAR="$(printf "%s_FILES" "$(printf "%s" "$SKILL" | tr "[:lower:]-" "[:upper:]_")")"',
    '  eval "FILES=\\${$FILES_VAR}"',
    '  STAGING_DIR="$TMP_DIR/$SKILL"',
    '  TARGET_DIR=".agents/skills/$SKILL"',
    '  rm -rf "$STAGING_DIR" "$TARGET_DIR"',
    '  mkdir -p "$STAGING_DIR"',
    '  for FILE in $FILES; do',
    '    DEST="$STAGING_DIR/$FILE"',
    '    mkdir -p "$(dirname "$DEST")"',
    '    curl -fsSL "$BASE_URL/api/skills/$SKILL/files/$FILE" -o "$DEST"',
    "  done",
    '  mkdir -p ".agents/skills"',
    '  cp -R "$STAGING_DIR" "$TARGET_DIR"',
    "",
    '  if [ "$HAS_CODEX" = "1" ]; then',
    '    mkdir -p ".codex/skills"',
    '    rm -rf ".codex/skills/$SKILL"',
    '    cp -R "$TARGET_DIR" ".codex/skills/$SKILL"',
    "  fi",
    "",
    '  if [ "$HAS_CLAUDE" = "1" ]; then',
    '    mkdir -p ".claude/skills"',
    '    rm -rf ".claude/skills/$SKILL"',
    '    cp -R "$TARGET_DIR" ".claude/skills/$SKILL"',
    "  fi",
    "",
    '  if [ "$HAS_CURSOR" = "1" ]; then',
    '    mkdir -p ".cursor/rules"',
    '    rm -f ".cursor/rules/$SKILL.mdc" ".cursor/rules/$SKILL-practical-tips.md"',
    '    SKILL_MD="$(cat "$STAGING_DIR/SKILL.md")"',
    '    DESCRIPTION="$(printf "%s\n" "$SKILL_MD" | sed -n \'s/^description: //p\' | head -n 1)"',
    '    BODY="$(printf "%s\n" "$SKILL_MD" | awk \'BEGIN { d = 0 } /^---$/ { d++; next } d >= 2 { print }\')"',
    '    printf -- "---\ndescription: %s\nglobs:\nalwaysApply: false\n---\n\n%s\n" "$DESCRIPTION" "$BODY" > ".cursor/rules/$SKILL.mdc"',
    '    if [ -f "$STAGING_DIR/references/practical-tips.md" ]; then',
    '      cp "$STAGING_DIR/references/practical-tips.md" ".cursor/rules/$SKILL-practical-tips.md"',
      '      printf "\n@%s-practical-tips.md\n" "$SKILL" >> ".cursor/rules/$SKILL.mdc"',
    "    fi",
    "  fi",
    "done",
    "",
    'printf "Installed skills into .agents/skills"',
    'if [ "$HAS_CODEX" = "1" ]; then printf ", .codex/skills"; fi',
    'if [ "$HAS_CLAUDE" = "1" ]; then printf ", .claude/skills"; fi',
    'if [ "$HAS_CURSOR" = "1" ]; then printf ", .cursor/rules"; fi',
    'printf "\\n"',
    "",
  )

  return `${lines.join("\n")}\n`
}

export function buildCliScript(baseUrl: string) {
  return `#!/usr/bin/env bun
import { mkdirSync, writeFileSync, cpSync, rmSync, mkdtempSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { tmpdir } from "node:os"

const args = process.argv.slice(2)

function getArg(flag, fallback) {
  const index = args.indexOf(flag)
  if (index === -1 || index === args.length - 1) return fallback
  return args[index + 1]
}

const command = args[0] === "install" ? "install" : "install"
const tool = getArg("--tool", "all")
const projectDir = resolve(getArg("--project-dir", process.cwd()))
const baseUrl = ${JSON.stringify(baseUrl)}

const validTools = new Set(["codex", "claude", "cursor", "all"])

if (!validTools.has(tool)) {
  console.error("Invalid --tool value:", tool)
  process.exit(1)
}

if (command !== "install") {
  console.error("Only the install command is supported.")
  process.exit(1)
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true })
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\\n[\\s\\S]*?\\n---\\n?/, "")
}

const skillListResponse = await fetch(\`\${baseUrl}/api/skills\`)
if (!skillListResponse.ok) {
  throw new Error("Failed to fetch skill index")
}

const { skills } = await skillListResponse.json()
const stagingRoot = mkdtempSync(join(tmpdir(), "skills-"))

try {
  for (const skill of skills) {
    const stagingSkillRoot = join(stagingRoot, skill.name)
    const skillRoot = join(projectDir, ".agents/skills", skill.name)

    rmSync(stagingSkillRoot, { recursive: true, force: true })
    rmSync(skillRoot, { recursive: true, force: true })
    ensureDir(stagingSkillRoot)

    for (const file of skill.files) {
      const response = await fetch(\`\${baseUrl}/api/skills/\${skill.name}/files/\${file.path}\`)
      if (!response.ok) {
        throw new Error(\`Failed to fetch \${skill.name}/\${file.path}\`)
      }

      const target = join(stagingSkillRoot, file.path)
      ensureDir(dirname(target))
      writeFileSync(target, await response.text())
    }

    ensureDir(dirname(skillRoot))
    cpSync(stagingSkillRoot, skillRoot, { recursive: true, force: true })

    if (tool === "codex" || tool === "all") {
      const target = join(projectDir, ".codex/skills", skill.name)
      rmSync(target, { recursive: true, force: true })
      ensureDir(dirname(target))
      cpSync(skillRoot, target, { recursive: true, force: true })
    }

    if (tool === "claude" || tool === "all") {
      const target = join(projectDir, ".claude/skills", skill.name)
      rmSync(target, { recursive: true, force: true })
      ensureDir(dirname(target))
      cpSync(skillRoot, target, { recursive: true, force: true })
    }

    if (tool === "cursor" || tool === "all") {
      ensureDir(join(projectDir, ".cursor/rules"))
      const skillMarkdown = Bun.file(join(skillRoot, "SKILL.md")).text()
      const body = stripFrontmatter(await skillMarkdown).trim()
      const rulePath = join(projectDir, ".cursor/rules", \`\${skill.name}.mdc\`)
      const tipsPath = join(projectDir, ".cursor/rules", \`\${skill.name}-practical-tips.md\`)
      let cursorRule = \`---\\ndescription: \${skill.description}\\nglobs:\\nalwaysApply: false\\n---\\n\\n\${body}\\n\`

      rmSync(rulePath, { force: true })
      rmSync(tipsPath, { force: true })

      const practicalTips = join(skillRoot, "references/practical-tips.md")
      try {
        const referenceText = await Bun.file(practicalTips).text()
        writeFileSync(tipsPath, referenceText)
        cursorRule += \`\\n@\${skill.name}-practical-tips.md\\n\`
      } catch {}

      writeFileSync(rulePath, cursorRule)
    }
  }
} finally {
  rmSync(stagingRoot, { recursive: true, force: true })
}

console.log("Installed skills to", projectDir)
`
}
