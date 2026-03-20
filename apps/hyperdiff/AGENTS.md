# AGENTS.md — Hyperdiff Terminal UI

## Visual Design System

### Color Palette (3 colors only)
| Token              | Value  | Role                           |
|--------------------|--------|--------------------------------|
| `--terminal-text`  | `#111` | Foreground, borders, text      |
| `--terminal-mid`   | `#555` | Dimmed text, line numbers      |
| `--terminal-bg`    | `#aaa` | Page background, inverted text |

Everything is expressed through these three values. No other colors exist in UI chrome.
Diff semantic colors (red/green) are the only exception — they are only used inside `DiffView`.

### Dithered Backgrounds
Instead of opacity or semi-transparent fills, density is faked with dot-grid patterns
using `repeating-conic-gradient`. Three densities are defined as CSS custom properties:

```css
--terminal-bg25: repeating-conic-gradient(
    var(--terminal-text) 0% 25%, transparent 0% 100%
  ) 1px 0.5px / 2px 2px;   /* sparse dots */

--terminal-bg50: repeating-conic-gradient(
    var(--terminal-text) 0% 25%, transparent 0% 50%,
    var(--terminal-text) 0% 75%, transparent 0% 100%
  ) 1px 0.5px / 2px 2px;   /* medium dots (checkerboard) */

--terminal-bg75: repeating-conic-gradient(
    transparent 0% 25%, var(--terminal-text) 0% 100%
  ) 1px 0.5px / 2px 2px;   /* dense dots */
```

Exposed as Tailwind 4 `@utility` so they work as class names:
- `dither-25` — hover state for default buttons
- `dither-75` — hover/focus state for secondary/solid buttons and expand icons

### Typography

- Font: Commit Mono (variable, `font-weight: 200 700`), served from `/public/fonts/CommitMonoV143-VF.woff2`
- Base size: `0.75rem / 1rem` line-height (12px / 16px)
- Heading size: `1.5rem / 2rem` line-height
- Font stack: `"CommitMono", "Commit Mono", ui-monospace, monospace`
- `font-weight: normal` on all headings — no bold headings

### Focus & Interaction

Keyboard focus triggers a flicker animation simulating a CRT phosphor blink:
```css
:focus {
  outline: none;
  color: var(--terminal-bg);
  background-color: var(--terminal-text);
  animation: terminal-flicker 50ms 2;
}
@keyframes terminal-flicker {
  0%, 49% { opacity: 0; }
  50%, 100% { opacity: 1; }
}
```

Button focus is special — dense dither instead of full solid inversion:
```css
[data-slot="terminal-button"]:focus {
  background: var(--terminal-bg75);
  color: var(--terminal-bg);
}
```

Hover triggers the same flicker animation as keyboard focus for consistency.

### Hunk Expand Button Hover
`ExpandIconButton` (inline `<button>` in `DiffView`) uses the same pattern as button focus:
- Hover: `background: var(--terminal-bg75)`, `color: var(--terminal-bg)` (icon inverts)
- Normal: `background: transparent`, `color: var(--terminal-mid)`
- Disabled: `color: transparent` (icon invisible but layout preserved)

This is implemented with `useState(hovered)` + `onMouseEnter`/`onMouseLeave` since
`ExpandIconButton` is a raw `<button>`, not a `TerminalButton`.

### Shake Feedback

```css
.shake       { animation: 200ms steps(1, jump-start) terminal-shake; }    /* diagonal */
.shake-up    { animation: 125ms steps(1, jump-start) terminal-shake-up; }
.shake-down  { animation: 125ms steps(1, jump-start) terminal-shake-down; }
.shake-left  { animation: 125ms steps(1, jump-start) terminal-shake-left; }
.shake-right { animation: 125ms steps(1, jump-start) terminal-shake-right; }
```
`steps(1, jump-start)` gives a stepped/digital feel, not smooth easing.

### Page Transition

```css
.page-wipe-overlay.page-wipe-active {
  animation: 440ms steps(10, jump-start) forwards terminal-page-wipe;
}
@keyframes terminal-page-wipe {
  0%    { transform: translateY(0); visibility: visible; }
  99.9% { visibility: visible; }
  100%  { visibility: hidden; transform: translateY(200vh); }
}
```
`steps(10, jump-start)` = 10 discrete position jumps = blocky terminal-style scroll.
The overlay is `200vw × 200vh` to prevent edge gaps during the transform.

---

## Code Architecture

### Directory Structure

```
apps/hyperdiff/
  src/
    routes/          # TanStack file-based routes
      __root.tsx     # Root layout (PageWipe, CSS import)
      index.tsx      # / — input page
      diff.tsx       # /diff — diff output page
    hooks/
      useKeyboardNav.ts
    styles/
      globals.css    # Terminal theme CSS (hyperdiff-specific)
  public/
    fonts/
      CommitMonoV143-VF.woff2

packages/ui/
  src/
    components/
      terminal-button.tsx
      terminal-kbd.tsx
      terminal-collapsible.tsx
      nav-row.tsx
      hyperdiff/
        DiffInput.tsx
        DiffView.tsx       ← primary diff rendering component
        KeyboardHint.tsx
        PageWipe.tsx
```

### CSS Strategy

Rule: Tailwind classes for everything expressible as standard utilities.
Custom CSS in `globals.css` only for things Tailwind cannot express:
- `repeating-conic-gradient` dither backgrounds → exposed as `@utility dither-*`
- `:focus` global override (needs pseudo-selector + animation together)
- `@keyframes` definitions
- `@font-face`

`globals.css` uses Tailwind 4 syntax:
```css
@import "tailwindcss";
@source "../**/*.{ts,tsx}";
@source "../../../../packages/ui/src/**/*.{ts,tsx}";
```
The `@source` directives are critical — without them Tailwind won't scan `packages/ui`
and button utility classes silently do nothing.

### CSS Variable Shorthand (Tailwind 4)

```tsx
// ✓ Tailwind 4 style
className="text-(--terminal-text) bg-(--terminal-bg)"

// ✗ Old verbose style (avoid)
className="text-[var(--terminal-text)]"
```

---

## Components

### TerminalButton (`packages/ui/src/components/terminal-button.tsx`)

Built on `@base-ui/react/button` (unstyled primitive). Three variants:

| Variant   | Appearance           | Hover                     | Use case            |
|-----------|----------------------|---------------------------|---------------------|
| `default` | No underline         | dither-25                 | Navigation, actions |
| `secondary` | Underlined         | dither-75 + no underline  | Primary CTAs        |
| `solid`   | Dark bg, light text  | dither-75                 | Confirm / submit    |

Uses `data-slot="terminal-button"` so CSS can target it without class coupling.

### TerminalCollapsible (`packages/ui/src/components/terminal-collapsible.tsx`)

Collapsible with `bordered` prop (full-width diff hunk header style) and `lines` prop
for per-line animation timing:
```tsx
animationDuration: `${Math.max(128, lines * 32)}ms`
animationTimingFunction: `steps(${lines}, jump-start)`
```
This ensures each line takes exactly 32ms to reveal regardless of total content height.

### DiffView (`packages/ui/src/components/hyperdiff/DiffView.tsx`)

The primary diff component. Props:
```tsx
{ textA: string; textB: string; mode?: "unified" | "split"; language?: string }
```

#### Diff Pipeline

1. `computeLines(textA, textB)` — `diffLines` + paired `diffChars` for adjacent removed/added lines. Splices `no-eof` sentinel markers when inputs lack trailing `\n`.
2. `buildSections(lines)` — groups into `Section[]` (kind: `"change" | "context"`). Context sections with `> CONTEXT*2+1` lines are `collapsible: true` and carry `midHunk` for `@@ -X,Y +X,Y @@` labels.
3. `buildTokenMap(lines, language)` — async shiki tokenization (`codeToTokens`, theme: `"min-light"`). Returns empty map on error so rendering falls back to plain text.

#### DiffLine Union Type
```ts
type DiffLine =
  | { type: "context"; text: string }
  | { type: "removed"; text: string; chars?: CharPart[] }
  | { type: "added";   text: string; chars?: CharPart[] }
  | { type: "no-eof";  side: "left" | "right" | "both" }
```

#### Section Type
```ts
type Section =
  | { kind: "change"; lines: DiffLine[] }
  | { kind: "context"; lines: DiffLine[]; collapsible: boolean;
      midHunk?: { a: number; aCount: number; b: number; bCount: number } }
```

#### Hunk Collapse / Expand

Constants: `CONTEXT = 3`, `EXPAND_SIZE = 10`.

State: `Map<sectionIndex, { top: number; bottom: number }>` (how many mid-lines revealed from each direction).

`ExpandRow` renders a full-width hunk bar:
- **Single button (`↕`/`▲`/`▼`)**: when `hiddenMid <= EXPAND_SIZE` (all fits in one expand) OR only one direction is available. Fires both `expandTop` + `expandBottom` simultaneously.
- **Two buttons (▲ + ▼)**: when both directions available and more than `EXPAND_SIZE` lines remain.
- Hover: `background: var(--terminal-bg75)`, `color: var(--terminal-bg)` — matches button focus style.

`RevealBlock` animates newly revealed lines:
```tsx
animationDuration: `${Math.max(240, lines.length * 32)}ms`
animationTimingFunction: `steps(${lines.length}, jump-start)`
```
The `key` prop on the inner `div` forces DOM remount (replaying the animation) each time the reveal count changes.

#### Char-Level Diff Highlights

Line backgrounds (semantic colors — exception to 3-color rule):
- Removed line: `rgba(160, 0, 0, 0.18)`
- Added line: `rgba(0, 120, 0, 0.18)`

Char-level dither highlights (fully opaque, more saturated than line bg):
```tsx
// removed chars
"repeating-conic-gradient(rgb(210,0,0) 0% 25%, transparent 0% 100%) 1px 0.5px / 2px 2px"
// added chars
"repeating-conic-gradient(rgb(0,170,0) 0% 25%, transparent 0% 100%) 1px 0.5px / 2px 2px"
```
These are applied as inline `background` on `<span>` elements wrapping each `CharPart`.
When shiki tokens are present, `renderTokenizedText` layers char colors + diff highlights together.

#### No-EOF Marker

`{ type: "no-eof"; side: "left" | "right" | "both" }` is spliced after the last visible line on each side when the input lacks a trailing `\n`. Renders as `\ No newline at end of file` in italic `var(--terminal-mid)`.

In split mode, `buildSplitRows` routes it to `{ left: line, right: null }` / `{ left: null, right: line }` / `{ left: line, right: line }` based on `side`.

#### FileSummaryHeader

Shown at the top of the diff box:
```
@@ -1,N +1,M @@  +X -Y
```
Where N/M = total lines per side, X/Y = lines added/removed.

#### Split View

`buildSplitRows` pairs removed+added blocks into `{ left, right }` rows. `SplitView` renders a CSS grid (`gridTemplateColumns: "1fr 1fr"`). `ExpandRow` uses `gridColumn: "1 / -1"` to span both columns.

`SplitView` receives `{ sections, getRevealed, expandTop, expandBottom, tokenMap }` — the same expand state is shared with unified mode.

#### Syntax Highlighting

`buildTokenMap` runs async via `useEffect` keyed on `[textA, textB, language]`. Falls back to plain text until tokens are ready. Uses shiki `min-light` theme. The `language` prop accepts any shiki-supported language ID.

---

## Keyboard Navigation (`useKeyboardNav`)

### Axis-Aware Movement

- Items inside `[data-nav-axis="horizontal"]` containers: left/right arrows move within
- Up/down arrows while inside a horizontal row: exit the row entirely
- Standard focusable elements outside rows: up/down navigate vertically

### Vertical Stop Deduplication

`getVerticalStops()` deduplicates horizontal group items — only the first focusable
element in each `[data-nav-axis="horizontal"]` container appears as a vertical stop.

### Shake on Boundary

When ArrowLeft on first item or ArrowRight on last, the navigation container gets
`.shake-left` / `.shake-right` applied and removed after animation duration. Same for up/down.

---

## Routing & Data Flow

- TanStack Start with file-based routing (`apps/hyperdiff/src/routes/`)
- Data between pages: `sessionStorage` (not URL params, not global state)
  - `index.tsx` writes `"hyperdiff_input"` → `diff.tsx` reads on mount
  - If key is missing on `/diff`, redirect to `/`
- Page wipe: `PageWipe` lives in `__root.tsx`, triggered on route changes
- Unified/split toggle: `[U]` key on `/diff` page, state held in `useState` in `DiffPage`

---

## Conventions

- No color values outside CSS vars — always reference `--terminal-text/mid/bg`
  - Exception: diff semantic colors (red/green) only inside `DiffView`
- No opacity for density — use dither patterns instead
- No smooth easing — all animations use `steps()` for digital feel
- No bold — terminal UIs use weight and dither, not bold
- `2ch` gap — standard spacing unit between inline elements (character-width based)
- Tailwind 4 shorthand everywhere: `text-(--var)`, `bg-(--var)`, `border-(--var)`
- Inline styles only for dynamic/computed values; static styles use Tailwind classes
- `whiteSpace: "pre"` on the diff container — never add wrapping to code lines

## Known TypeScript LSP False Positives

The editor LSP reports `Property 'div'/'span'/'button' does not exist on type 'JSX.IntrinsicElements'` in `DiffView.tsx`. These are **not real errors** — `bun run --filter @workspace/ui typecheck` (actual `tsc`) only reports missing `@hugeicons` module errors (pre-existing, unrelated). Ignore the LSP warnings.
