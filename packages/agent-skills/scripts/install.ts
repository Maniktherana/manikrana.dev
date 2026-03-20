#!/usr/bin/env bun

import process from "node:process"
import { installSkills } from "../src/index"

const args = process.argv.slice(2)
const command = args[0] === "install" ? "install" : "install"

function getArg(flag: string, fallback: string) {
  const index = args.indexOf(flag)
  if (index === -1 || index === args.length - 1) return fallback
  return args[index + 1]!
}

const tool = getArg("--tool", "all") as "codex" | "claude" | "cursor" | "all"
const projectDir = getArg("--project-dir", process.cwd())

const validTools = new Set(["codex", "claude", "cursor", "all"])

if (command !== "install") {
  console.error("Only the install command is supported.")
  process.exit(1)
}

if (!validTools.has(tool)) {
  console.error("Invalid --tool value:", tool)
  process.exit(1)
}

const installed = installSkills({
  projectDir,
  tool,
})

console.log(`Installed ${installed.length} skill(s) into ${projectDir}`)
