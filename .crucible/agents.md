# Agent Guide: Maniktherana/manikrana.dev

## TL;DR
Personal portfolio site for Manik Rana - a Next.js 14 App Router project with a Payload CMS 3.0 (beta) admin mounted alongside the public site.

## Quick Start
1. Run `./.crucible/init.sh` to install dependencies (pnpm).
2. Start the dev server with `pnpm dev` - Next.js serves on `http://localhost:3000` by default.

Note: Payload CMS expects `PAYLOAD_SECRET` and `DATABASE_URI` (Postgres) in the environment. The public pages under `src/app/(app)` render without them, but anything touching `/admin` or the Payload API will fail until they are set. If the dev server crashes on boot, that is the cause.

## Architecture
- **Framework:** Next.js `14.1.0` (App Router), React 18, TypeScript strict mode.
- **CMS:** Payload CMS `3.0.0-beta.10` with the Postgres adapter (`@payloadcms/db-postgres`) and the Lexical richtext editor.
- **Styling:** Tailwind CSS 3 + `tailwind-merge` + `tailwindcss-animate`. Global styles in `src/app/globals.css`.
- **UI primitives:** Radix (`@radix-ui/react-*`) + a shadcn-style local `components/ui/` folder (see `components.json`). `lucide-react` for icons.
- **Animation:** `framer-motion`, plus `use-scramble` for the scrambling role text.
- **Theming:** `next-themes` via `src/components/theme-provider.tsx`, toggled by `src/components/theme-toggle.tsx`.
- **Fonts:** `geist/font/sans` and `geist/font/mono` wired in the root layout.
- **Analytics:** `@vercel/analytics` + `@vercel/speed-insights`.

## Key Files
- `src/app/(app)/layout.tsx` - root layout for the public site; mounts `ThemeProvider`, `Navbar`, `Footer`, and Vercel analytics.
- `src/app/(app)/page.tsx` - home page (hero, role scramble, social links).
- `src/app/(app)/talks/` - talks route group.
- `src/app/(app)/opengraph-image.tsx` - dynamic OG image.
- `src/app/(payload)/layout.tsx` and `src/app/(payload)/admin/` - Payload admin UI mount.
- `src/app/(payload)/api/` - Payload REST/GraphQL endpoints.
- `src/payload.config.ts` - Payload config (Postgres adapter, Users collection, Lexical editor).
- `src/collections/Users.ts` - the only Payload collection so far.
- `src/components/` - app components (`navbar`, `footer`, `menu`, `spotlight`, `roles`, `work-status`, `theme-toggle`, etc.).
- `src/components/ui/` - shadcn-style primitives.
- `src/lib/utils.ts` - the canonical `cn()` class-merger.
- `next.config.mjs` - wraps the Next config with `withPayload`.
- `tailwind.config.ts` - Tailwind theme extensions.

## Testing
- **Runner:** not configured. There is no test script in `package.json` and no test framework in `devDependencies`.
- **Command:** n/a - if a task requires testing, add a runner as part of the work and document it.
- **Where tests live:** no existing test directories.

## Conventions
- **Path alias:** `@/*` resolves to `src/*`; `@payload-config` resolves to `src/payload.config.ts` (see `tsconfig.json`).
- **Route groups:** `(app)` for the public site, `(payload)` for the CMS - keep this split when adding routes.
- **Components:** React function components in `.tsx`, default-exported for pages, named for shared components. File names are kebab-case (`work-status.tsx`, `theme-toggle.tsx`).
- **Classes:** compose with `cn(...)` from `@/lib/utils`. Prefer Tailwind utilities over CSS files; global styles only in `src/app/globals.css`.
- **Icons:** `lucide-react` for generic icons, bespoke SVGs under `src/components/icons/`.
- **Lint:** `pnpm lint` (runs `next lint` with `eslint-config-next`). No Prettier config is checked in.
- **Typecheck:** no dedicated script; use `pnpm exec tsc --noEmit` if you need one.

## UI Testing
Use `agent-browser` to verify UI changes. Start the dev server first (`pnpm dev`), then:

```bash
agent-browser open http://localhost:3000
agent-browser snapshot -ic
agent-browser screenshot ./screenshot.png
agent-browser close
```

Routes worth checking after visual changes:
- `/` - home/hero
- `/talks` - talks listing
- `/admin` - Payload admin (only if `PAYLOAD_SECRET` + `DATABASE_URI` are set; expect it to fail otherwise)

Check both light and dark themes - `next-themes` defaults to `system`, so toggle via the navbar theme button when snapshotting.

## Common Pitfalls
- Payload 3.0 is a **beta** (`3.0.0-beta.10`). APIs and config shapes can shift; do not assume parity with stable Payload docs.
- Dev server will error without `DATABASE_URI` and `PAYLOAD_SECRET`. For pure frontend work, stub them in `.env.local` - Payload still boots even with a bogus Postgres URL until something actually queries it.
- The project uses `pnpm` (see `pnpm-lock.yaml`). Do not run `npm install` or `yarn` - it will desync the lockfile.
- Two parallel route groups (`(app)` and `(payload)`) share the `src/app` root. Put new public pages under `(app)`, never at `src/app/<route>` directly.
