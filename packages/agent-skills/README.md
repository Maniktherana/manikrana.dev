# Agent Skills

Canonical, spec-compliant Agent Skills for this repo.

The source of truth lives under `skills/`. Codex and Claude Code receive direct copies of the canonical skill folder. Cursor receives a generated `.mdc` adapter.

## Layout

```text
packages/agent-skills/
├── agents/
│   └── skills/
│       └── animation-design/
│           ├── SKILL.md
│           └── references/
│               └── practical-tips.md
├── adapters/
│   └── cursor/
├── scripts/
│   └── install.ts
└── README.md
```

Adding a new skill means adding a new folder under `skills/`.

## Install Destinations

| Tool | Path |
| --- | --- |
| Any spec-compliant agent | `.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` |
| Codex | `.codex/skills/<skill-name>/` |
| Cursor | `.cursor/rules/<skill-name>.mdc` |

Project-level skills override user-level skills.

## Distribution

### curl install

```bash
curl -fsSL https://manikrana.dev/api/install/sh | bash
```

### bunx install

```bash
bunx https://manikrana.dev/api/install/cli --tool all
```

### global CLI

```bash
bun i -g @workspace/skills
skills install --tool all
```

### repo-local

```bash
bun run skills:install --tool all
```

### create a new distributable skill

```bash
bun run skills:new
```

## Manual Copy

```bash
mkdir -p .agents/skills
cp -R packages/agent-skills/skills/animation-design .agents/skills/
cp -R packages/agent-skills/skills/animation-design .codex/skills/
cp -R packages/agent-skills/skills/animation-design .claude/skills/
```

Cursor rules are generated from the canonical skill during install.
