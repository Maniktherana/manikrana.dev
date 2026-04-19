#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd -- "$ROOT"

log() { printf '[crucible init] %s\n' "$*"; }

if [ ! -f package.json ]; then
  log "No package.json - nothing to install."
  exit 0
fi

if [ -f bun.lock ] || [ -f bun.lockb ]; then
  log "Installing with bun"
  bun install
elif [ -f pnpm-lock.yaml ]; then
  log "Installing with pnpm"
  pnpm install
elif [ -f yarn.lock ]; then
  log "Installing with yarn"
  yarn install
elif [ -f package-lock.json ]; then
  log "Installing with npm ci"
  npm ci
else
  log "Installing with npm"
  npm install
fi

log "Done."
