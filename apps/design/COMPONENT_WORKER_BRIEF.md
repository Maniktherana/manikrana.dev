# Component Docs Worker Brief

Build functional UI-library docs for the design app. The app now uses Fumadocs MDX content under `content/docs/(components)` and the `/docs` route.

## Non-Negotiables

- Use the actual shadcn/Base UI primitive wrappers from `src/components/ui`.
- Treat Figma code as exact visual input, not exact component structure. Copy the tokens, spacing, shadows, radii, typography, and state colors into the existing design token layer; do not copy Figma's state-gallery frames as fake UI.
- Do not recreate the old `/components/$componentId` route or `src/components/design/pages` page layer.
- Keep docs content in `content/docs/(components)` and reusable live examples in `src/components/design/component-doc-blocks.tsx`.
- Update `src/components/design/component-catalog.ts` only when component metadata changes.
- Do not edit primitive wrappers, global CSS, routes, catalog, or unrelated files unless the component change requires it.
- Do not add raw color, shadow, radius, font, or border approximations in docs examples. Use the shadcn tokens/classes in `src/styles.css` and existing shadcn variants.
- Do not override open/close, checked, selected, focus, disabled, menu, popover, dialog, or keyboard behavior.
- Base UI/shadcn owns behavior, ARIA, state attributes, keyboard interactions, and animation lifecycle.
- Figma informs visual tokens, density, spacing, shadows, and which real variants exist.
- Figma state sheets are references for how default, hover, active, disabled, checked, and open states should look when the real component naturally enters those states.
- Do not render separate fake cards for `hover`, `active hover`, `open`, or similar state labels unless the component's real API exposes that as a variant. Let browser hover and real interaction show those states.
- Infer the smallest real component API. Example: Accordion has two meaningful variants: `standard` and `progress`; open/closed/hover are states, not variants.
- Use only existing shell classes and shadcn tokens from `src/styles.css`; do not add CSS.
- Keep examples operational and domain-realistic: settings, inventory, orders, payments, command palettes, filters.
- ASCII only.

## Accordion Lessons To Apply Everywhere

- The correct boundary is: primitive behavior first, Figma styling second.
- A component page should expose functional examples of real variants, not a frozen grid of every Figma state.
- Never make something look open/selected/checked unless the primitive's actual state is open/selected/checked.
- Do not force heights or state display if the primitive already controls them.
- If an icon changes with state, key the visual to the primitive's state attribute (`aria-expanded`, `data-state`, `data-active`, etc.) through styling, not custom behavior.
- Standard surfaces can be transparent when Figma shows no card-rest elevation.
- Elevated surfaces use the exact tokenized card-rest shadow.
- Hover color is the Figma hover token; it should appear on actual hover, not be permanently baked into examples.
- Dark mode must use exact Figma values through shadcn variables in `src/styles.css`:
  - `--background: #212124`
  - `--accent: #27272a`
  - `--border: #ffffff1a`
  - `--foreground: #f4f4f5`
  - `--secondary-foreground: #a1a1aa`
  - `--muted-foreground: #71717a`
  - `--ring: #60a5fa`

## Page Shape

Each component doc is an MDX file under `content/docs/(components)`.

Use frontmatter plus reusable doc blocks:

```mdx
---
title: Button
description: Action primitives for forms, toolbars, and compact panels.
---

import { Button } from "@/components/ui/button";

# Button

<ComponentPreview name="button" />
```

## Acceptance Checklist

- `bun --cwd apps/design typecheck` passes.
- No new CSS.
- No primitive wrapper edits.
- No fake state-sheet demos.
- No locally invented Figma-ish colors, gradients, shadows, borders, typography, or state names.
- Every visible variant maps to a real prop/composition a consumer would use.
- Hover, active, checked, selected, open, disabled, and focus states are produced by real browser/primitive state.
- Component works if clicked, typed into, opened, closed, selected, checked, focused, or hovered.
- Uses existing shell/bands classes and shadcn tokens.
