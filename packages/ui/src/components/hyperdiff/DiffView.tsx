"use client"
import { diffLines, diffChars } from "diff"
import { type ReactNode, Fragment, useEffect, useState } from "react"

type CharPart = { value: string; added?: boolean; removed?: boolean }
type DiffLine =
  | { type: "context"; text: string }
  | { type: "removed"; text: string; chars?: CharPart[] }
  | { type: "added"; text: string; chars?: CharPart[] }
  | { type: "no-eof"; side: "left" | "right" | "both" }

// How many context lines to keep visible above/below a change
const CONTEXT = 3
// How many lines to reveal per click
const EXPAND_SIZE = 10

function computeLines(textA: string, textB: string): DiffLine[] {
  const raw: DiffLine[] = []

  for (const part of diffLines(textA, textB)) {
    const text = part.value.endsWith("\n")
      ? part.value.slice(0, -1)
      : part.value
    for (const line of text.split("\n")) {
      if (part.removed) raw.push({ type: "removed", text: line })
      else if (part.added) raw.push({ type: "added", text: line })
      else raw.push({ type: "context", text: line })
    }
  }

  // Pair adjacent removed+added lines for char-level diffs
  const result: DiffLine[] = []
  let i = 0
  while (i < raw.length) {
    const cur = raw[i]
    if (
      cur.type === "removed" &&
      i + 1 < raw.length &&
      raw[i + 1].type === "added"
    ) {
      const next = raw[i + 1] as { type: "added"; text: string }
      const chars = diffChars(cur.text, next.text) as CharPart[]
      result.push({
        type: "removed",
        text: cur.text,
        chars: chars.filter((c) => !c.added),
      })
      result.push({
        type: "added",
        text: next.text,
        chars: chars.filter((c) => !c.removed),
      })
      i += 2
    } else {
      result.push(cur)
      i++
    }
  }

  // Insert "no-eof" markers for files missing a trailing newline.
  // Find the index of the last line that belongs to textA (removed or context)
  // and the last line that belongs to textB (added or context).
  if (!textA.endsWith("\n") && textA.length > 0) {
    // Last line visible on the A side: last removed or context line
    let lastAIdx = -1
    for (let j = result.length - 1; j >= 0; j--) {
      const t = result[j].type
      if (t === "removed" || t === "context") {
        lastAIdx = j
        break
      }
    }
    if (lastAIdx !== -1) {
      result.splice(lastAIdx + 1, 0, { type: "no-eof", side: "left" })
    }
  }

  if (!textB.endsWith("\n") && textB.length > 0) {
    // Last line visible on the B side: last added or context line
    // (after potentially inserting the A marker, so re-scan)
    let lastBIdx = -1
    for (let j = result.length - 1; j >= 0; j--) {
      const t = result[j].type
      if (t === "added" || t === "context") {
        lastBIdx = j
        break
      }
    }
    if (lastBIdx !== -1) {
      result.splice(lastBIdx + 1, 0, { type: "no-eof", side: "right" })
    }
  }

  return result
}

// Split lines into sections: change blocks and context blocks.
// Context blocks with more than CONTEXT*2+1 lines get their middle collapsed.
type Section =
  | { kind: "change"; lines: DiffLine[] }
  | {
      kind: "context"
      lines: DiffLine[]
      collapsible: boolean
      // hunk header info for the collapsed middle (only set when collapsible)
      midHunk?: { a: number; aCount: number; b: number; bCount: number }
    }

// Each section also carries the starting A/B line numbers so the render loop
// can compute per-line numbers without a second full scan.
type SectionWithStart = Section & { startA: number; startB: number }

function buildSections(lines: DiffLine[]): SectionWithStart[] {
  // Group into runs of context vs change, tracking line numbers
  const runs: {
    isContext: boolean
    lines: DiffLine[]
    startA: number
    startB: number
  }[] = []
  let lineA = 1
  let lineB = 1

  for (const line of lines) {
    // "no-eof" markers are not real lines — attach them to the previous run
    // (or start a new non-context run if there's nothing yet) and don't
    // advance either line counter.
    if (line.type === "no-eof") {
      const last = runs[runs.length - 1]
      if (last) {
        last.lines.push(line)
      } else {
        runs.push({
          isContext: false,
          lines: [line],
          startA: lineA,
          startB: lineB,
        })
      }
      continue
    }
    const isCtx = line.type === "context"
    const last = runs[runs.length - 1]
    if (last && last.isContext === isCtx) {
      last.lines.push(line)
    } else {
      runs.push({
        isContext: isCtx,
        lines: [line],
        startA: lineA,
        startB: lineB,
      })
    }
    if (line.type !== "added") lineA++
    if (line.type !== "removed") lineB++
  }

  return runs.map((run) => {
    if (!run.isContext)
      return {
        kind: "change" as const,
        lines: run.lines,
        startA: run.startA,
        startB: run.startB,
      }
    const collapsible = run.lines.length > CONTEXT * 2 + 1
    if (!collapsible)
      return {
        kind: "context" as const,
        lines: run.lines,
        collapsible,
        startA: run.startA,
        startB: run.startB,
      }

    // Mid section starts after the first CONTEXT lines
    const midStartA = run.startA + CONTEXT
    const midStartB = run.startB + CONTEXT
    const midCount = run.lines.length - CONTEXT * 2
    return {
      kind: "context" as const,
      lines: run.lines,
      collapsible,
      midHunk: {
        a: midStartA,
        aCount: midCount,
        b: midStartB,
        bCount: midCount,
      },
      startA: run.startA,
      startB: run.startB,
    }
  })
}

// --- Syntax highlighting ---

type Token = { content: string; color?: string }
// Maps raw line text -> array of tokens for that line
type TokenMap = Map<string, Token[]>

async function buildTokenMap(
  lines: DiffLine[],
  language: string
): Promise<TokenMap> {
  const { codeToTokens } = await import("shiki")

  // Collect all line texts in order (skip no-eof sentinels)
  const lineTexts: string[] = lines
    .filter(
      (l): l is { type: "context" | "removed" | "added"; text: string } =>
        l.type !== "no-eof"
    )
    .map((l) => l.text)

  const fullText = lineTexts.join("\n")

  let tokenLines: Token[][]
  try {
    const result = await codeToTokens(fullText, {
      lang: language as Parameters<typeof codeToTokens>[1]["lang"],
      theme: "min-light",
    })
    tokenLines = result.tokens.map((lineTokens) =>
      lineTokens.map((t) => ({ content: t.content, color: t.color }))
    )
  } catch {
    // Unknown language or shiki error — return empty map so rendering falls back
    return new Map()
  }

  const map: TokenMap = new Map()
  lineTexts.forEach((text, idx) => {
    if (tokenLines[idx]) {
      map.set(text, tokenLines[idx])
    }
  })
  return map
}

// Render a line's text content applying shiki token colors, with optional
// char-level diff highlight spans layered on top.
function renderTokenizedText(
  text: string,
  chars: CharPart[] | undefined,
  isRemoved: boolean | undefined,
  charBg: string | undefined,
  tokens: Token[]
): ReactNode {
  if (chars) {
    // Build a flat per-character color array from tokens
    const charColors: (string | undefined)[] = []
    for (const tok of tokens) {
      for (let k = 0; k < tok.content.length; k++) {
        charColors.push(tok.color)
      }
    }

    let charPos = 0
    return chars.map((c, ci) => {
      const highlight = isRemoved ? c.removed : c.added
      const startPos = charPos
      charPos += c.value.length

      const charsArr = c.value.split("")
      return (
        <span key={ci} style={highlight ? { background: charBg } : undefined}>
          {charsArr.map((ch, chIdx) => {
            const color = charColors[startPos + chIdx]
            return color ? (
              <span key={chIdx} style={{ color }}>
                {ch}
              </span>
            ) : (
              ch
            )
          })}
        </span>
      )
    })
  }

  // No char-level diff — render tokens with their syntax colors
  return tokens.map((tok, ti) =>
    tok.color ? (
      <span key={ti} style={{ color: tok.color }}>
        {tok.content}
      </span>
    ) : (
      tok.content
    )
  )
}

// --- Line number gutter helpers ---

const LINE_NUM_GUTTER_STYLE: React.CSSProperties = {
  color: "var(--terminal-mid)",
  textAlign: "right",
  userSelect: "none",
  flexShrink: 0,
  paddingRight: "0.5ch",
  paddingLeft: "0.5ch",
  borderRight: "1px solid var(--terminal-text)",
  opacity: 0.6,
}

// A single line-number cell. `num` is the 1-based line number, or undefined
// for blank gutters (no-eof, expand rows, empty slots in split view).
function LineNumCell({
  num,
  width,
}: {
  num: number | undefined
  width: number
}) {
  return (
    <div
      style={{
        ...LINE_NUM_GUTTER_STYLE,
        width: `${width}ch`,
        minWidth: `${width}ch`,
      }}
    >
      {num !== undefined ? String(num) : ""}
    </div>
  )
}

// Second gutter column in unified mode — shows the B-side line number.
// Uses the same bordered style as LineNumCell so both columns look identical.
function LineNumCellB({
  num,
  width,
}: {
  num: number | undefined
  width: number
}) {
  return (
    <div
      style={{
        ...LINE_NUM_GUTTER_STYLE,
        width: `${width}ch`,
        minWidth: `${width}ch`,
      }}
    >
      {num !== undefined ? String(num) : ""}
    </div>
  )
}

function NoEofLine({ gutterSlot }: { gutterSlot?: ReactNode }) {
  return (
    <div style={{ display: "flex" }}>
      {gutterSlot}
      <div
        style={{
          padding: "0 0.5rem",
          color: "var(--terminal-mid)",
          fontStyle: "italic",
          flex: 1,
          minWidth: 0,
        }}
      >
        {"\\ No newline at end of file"}
      </div>
    </div>
  )
}

function ContextLine({
  line,
  tokenMap,
  lineNumA,
  lineNumB,
  gutterWidth,
}: {
  line: DiffLine
  tokenMap?: TokenMap
  lineNumA?: number
  lineNumB?: number
  gutterWidth: number
}) {
  if (line.type === "no-eof") {
    // Unified: blank A gutter, blank B gutter
    return (
      <NoEofLine
        gutterSlot={
          <>
            <LineNumCell num={undefined} width={gutterWidth} />
            <LineNumCellB num={undefined} width={gutterWidth} />
          </>
        }
      />
    )
  }
  const lineText = (line as { text: string }).text
  const tokens = tokenMap?.get(lineText)
  return (
    <div style={{ display: "flex" }}>
      <LineNumCell num={lineNumA} width={gutterWidth} />
      <LineNumCellB num={lineNumB} width={gutterWidth} />
      <div
        style={{
          padding: "0 0.5rem",
          color: "var(--terminal-mid)",
          flex: 1,
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {"  "}
        {tokens
          ? renderTokenizedText(lineText, undefined, undefined, undefined, tokens)
          : lineText || "\u00a0"}
      </div>
    </div>
  )
}

function ChangeLine({
  line,
  tokenMap,
  lineNumA,
  lineNumB,
  gutterWidth,
}: {
  line: DiffLine
  tokenMap?: TokenMap
  lineNumA?: number
  lineNumB?: number
  gutterWidth: number
}) {
  if (line.type === "context")
    return (
      <ContextLine
        line={line}
        tokenMap={tokenMap}
        lineNumA={lineNumA}
        lineNumB={lineNumB}
        gutterWidth={gutterWidth}
      />
    )
  if (line.type === "no-eof") {
    return (
      <NoEofLine
        gutterSlot={
          <>
            <LineNumCell num={undefined} width={gutterWidth} />
            <LineNumCellB num={undefined} width={gutterWidth} />
          </>
        }
      />
    )
  }
  const isRemoved = line.type === "removed"
  const lineBg = isRemoved ? "rgba(160, 0, 0, 0.18)" : "rgba(0, 120, 0, 0.18)"
  const charBg = isRemoved
    ? "repeating-conic-gradient(rgb(210,0,0) 0% 25%, transparent 0% 100%) 1px 0.5px / 2px 2px"
    : "repeating-conic-gradient(rgb(0,170,0) 0% 25%, transparent 0% 100%) 1px 0.5px / 2px 2px"
  const prefix = isRemoved ? "- " : "+ "
  const tokens = tokenMap?.get(line.text)

  // Unified: removed shows A number only, added shows B number only
  const numA = isRemoved ? lineNumA : undefined
  const numB = isRemoved ? undefined : lineNumB

  return (
    <div
      style={{
        background: lineBg,
        color: "var(--terminal-text)",
        display: "flex",
      }}
    >
      <LineNumCell num={numA} width={gutterWidth} />
      <LineNumCellB num={numB} width={gutterWidth} />
      <div
        style={{
          padding: "0 0.5rem",
          flex: 1,
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {prefix}
        {tokens
          ? renderTokenizedText(line.text, line.chars, isRemoved, charBg, tokens)
          : line.chars
            ? line.chars.map((c, ci) => {
                const highlight = isRemoved ? c.removed : c.added
                return (
                  <span
                    key={ci}
                    style={highlight ? { background: charBg } : undefined}
                  >
                    {c.value}
                  </span>
                )
              })
            : line.text}
      </div>
    </div>
  )
}

function ExpandIconButton({
  children,
  onClick,
  disabled,
  flex,
}: {
  children: ReactNode
  onClick: () => void
  disabled: boolean
  flex?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: flex ?? "1 1 50%",
        border: "none",
        background:
          hovered && !disabled ? "var(--terminal-bg75)" : "transparent",
        fontFamily: "inherit",
        fontSize: "0.75rem",
        cursor: disabled ? "default" : "pointer",
        color: disabled
          ? "transparent"
          : hovered
            ? "var(--terminal-bg)"
            : "var(--terminal-mid)",
        padding: 0,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  )
}

function ExpandRow({
  label,
  si,
  hiddenMid,
  canExpandTop,
  canExpandBottom,
  onExpandTop,
  onExpandBottom,
  gutterWidth,
  splitMode,
}: {
  label: string
  si: number
  hiddenMid: number
  canExpandTop: boolean
  canExpandBottom: boolean
  onExpandTop: () => void
  onExpandBottom: () => void
  gutterWidth: number
  splitMode?: boolean
}) {
  // If all remaining hidden lines fit in a single expand, use one button
  const fitsInOne = hiddenMid <= EXPAND_SIZE
  const bothDirections = canExpandTop && canExpandBottom

  // In unified mode we have two gutter columns; in split mode each column has one.
  // Each cell is gutterWidth ch wide plus 1ch of horizontal padding (0.5ch each side).
  // The expand row spans full width — show the expand icons in the combined gutter space.
  const cellWidth = gutterWidth + 1 // width + padding
  const gutterTotalWidth = splitMode ? cellWidth : cellWidth * 2

  return (
    <div
      style={{
        borderTop: "1px solid var(--terminal-text)",
        borderBottom: "1px solid var(--terminal-text)",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {/* Gutter — same combined width as the line number columns */}
      <div
        style={{
          width: `${gutterTotalWidth}ch`,
          minWidth: `${gutterTotalWidth}ch`,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--terminal-text)",
          opacity: 0.6,
        }}
      >
        {fitsInOne || !bothDirections ? (
          <ExpandIconButton
            flex="1 1 100%"
            onClick={() => {
              if (canExpandTop) onExpandTop()
              if (canExpandBottom) onExpandBottom()
            }}
            disabled={!canExpandTop && !canExpandBottom}
          >
            {canExpandTop && !canExpandBottom
              ? "▲"
              : canExpandBottom && !canExpandTop
                ? "▼"
                : "↕"}
          </ExpandIconButton>
        ) : (
          <>
            <ExpandIconButton onClick={onExpandTop} disabled={!canExpandTop}>
              ▲
            </ExpandIconButton>
            <ExpandIconButton
              onClick={onExpandBottom}
              disabled={!canExpandBottom}
            >
              ▼
            </ExpandIconButton>
          </>
        )}
      </div>
      {/* Right area — hunk label, dimmed, non-interactive */}
      <div
        style={{
          flex: 1,
          padding: "0 0.5rem",
          color: "var(--terminal-mid)",
          display: "flex",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        {label}
      </div>
    </div>
  )
}

function RevealBlock({
  lines: revealLines,
  revealKey,
  tokenMap,
  startLineNumA,
  startLineNumB,
  gutterWidth,
}: {
  lines: DiffLine[]
  revealKey: number
  tokenMap?: TokenMap
  startLineNumA: number
  startLineNumB: number
  gutterWidth: number
}) {
  if (revealLines.length === 0) return null

  // Compute per-line numbers for revealed context lines (they are always context)
  let curA = startLineNumA
  let curB = startLineNumB

  return (
    <div
      key={revealKey}
      className="terminal-collapsible-content"
      style={{
        animationDuration: `${Math.max(240, revealLines.length * 5)}ms`,
        animationTimingFunction: `steps(${revealLines.length}, jump-start)`,
      }}
    >
      {revealLines.map((line, li) => {
        const lnA = line.type !== "no-eof" ? curA : undefined
        const lnB = line.type !== "no-eof" ? curB : undefined
        if (line.type === "context") {
          curA++
          curB++
        }
        return (
          <ContextLine
            key={li}
            line={line}
            tokenMap={tokenMap}
            lineNumA={lnA}
            lineNumB={lnB}
            gutterWidth={gutterWidth}
          />
        )
      })}
    </div>
  )
}

// --- Split view helpers ---

type SplitRow = {
  left: DiffLine | null
  right: DiffLine | null
  lineNumLeft: number | undefined
  lineNumRight: number | undefined
}

function buildSplitRows(
  lines: DiffLine[],
  startA: number,
  startB: number
): SplitRow[] {
  const rows: SplitRow[] = []
  let i = 0
  let curA = startA
  let curB = startB

  while (i < lines.length) {
    const line = lines[i]
    if (line.type === "no-eof") {
      // Place the marker only in the column(s) it belongs to
      if (line.side === "left") {
        rows.push({ left: line, right: null, lineNumLeft: undefined, lineNumRight: undefined })
      } else if (line.side === "right") {
        rows.push({ left: null, right: line, lineNumLeft: undefined, lineNumRight: undefined })
      } else {
        // "both"
        rows.push({ left: line, right: line, lineNumLeft: undefined, lineNumRight: undefined })
      }
      i++
    } else if (line.type === "context") {
      rows.push({ left: line, right: line, lineNumLeft: curA, lineNumRight: curB })
      curA++
      curB++
      i++
    } else if (line.type === "removed") {
      // Collect a block of removed lines followed by added lines
      const removedBlock: { line: DiffLine; numA: number }[] = []
      while (i < lines.length && lines[i].type === "removed") {
        removedBlock.push({ line: lines[i], numA: curA })
        curA++
        i++
      }
      const addedBlock: { line: DiffLine; numB: number }[] = []
      while (i < lines.length && lines[i].type === "added") {
        addedBlock.push({ line: lines[i], numB: curB })
        curB++
        i++
      }
      const maxLen = Math.max(removedBlock.length, addedBlock.length)
      for (let j = 0; j < maxLen; j++) {
        rows.push({
          left: removedBlock[j]?.line ?? null,
          right: addedBlock[j]?.line ?? null,
          lineNumLeft: removedBlock[j]?.numA,
          lineNumRight: addedBlock[j]?.numB,
        })
      }
    } else {
      // standalone added line
      rows.push({ left: null, right: line, lineNumLeft: undefined, lineNumRight: curB })
      curB++
      i++
    }
  }
  return rows
}

function SplitCell({
  line,
  side,
  tokenMap,
  lineNum,
  gutterWidth,
}: {
  line: DiffLine | null
  side: "left" | "right"
  tokenMap?: TokenMap
  lineNum: number | undefined
  gutterWidth: number
}) {
  const emptyBg = side === "left" ? "rgba(160,0,0,0.07)" : "rgba(0,120,0,0.07)"
  const borderLeft =
    side === "right" ? "1px solid var(--terminal-text)" : undefined

  if (line === null) {
    return (
      <div
        style={{
          background: emptyBg,
          minWidth: 0,
          overflow: "hidden",
          borderLeft,
          display: "flex",
        }}
      >
        <LineNumCell num={undefined} width={gutterWidth} />
        <div style={{ padding: "0 0.5rem", flex: 1 }}>{"\u00a0"}</div>
      </div>
    )
  }

  if (line.type === "no-eof") {
    return (
      <div
        style={{
          minWidth: 0,
          overflow: "hidden",
          borderLeft,
          display: "flex",
        }}
      >
        <LineNumCell num={undefined} width={gutterWidth} />
        <div
          style={{
            padding: "0 0.5rem",
            color: "var(--terminal-mid)",
            fontStyle: "italic",
            flex: 1,
          }}
        >
          {"\\ No newline at end of file"}
        </div>
      </div>
    )
  }

  if (line.type === "context") {
    const tokens = tokenMap?.get(line.text)
    return (
      <div
        style={{
          minWidth: 0,
          overflow: "hidden",
          borderLeft,
          display: "flex",
          color: "var(--terminal-mid)",
        }}
      >
        <LineNumCell num={lineNum} width={gutterWidth} />
        <div
          style={{
            padding: "0 0.5rem",
            flex: 1,
            overflowWrap: "anywhere",
          }}
        >
          {"  "}
          {tokens
            ? renderTokenizedText(
                line.text,
                undefined,
                undefined,
                undefined,
                tokens
              )
            : line.text || "\u00a0"}
        </div>
      </div>
    )
  }

  const isRemoved = line.type === "removed"
  const lineBg = isRemoved ? "rgba(160, 0, 0, 0.18)" : "rgba(0, 120, 0, 0.18)"
  const charBg = isRemoved
    ? "repeating-conic-gradient(rgb(210,0,0) 0% 25%, transparent 0% 100%) 1px 0.5px / 2px 2px"
    : "repeating-conic-gradient(rgb(0,170,0) 0% 25%, transparent 0% 100%) 1px 0.5px / 2px 2px"
  const prefix = isRemoved ? "- " : "+ "
  const tokens = tokenMap?.get(line.text)

  return (
    <div
      style={{
        background: lineBg,
        color: "var(--terminal-text)",
        minWidth: 0,
        overflow: "hidden",
        borderLeft,
        display: "flex",
      }}
    >
      <LineNumCell num={lineNum} width={gutterWidth} />
      <div
        style={{
          padding: "0 0.5rem",
          flex: 1,
          overflowWrap: "anywhere",
        }}
      >
        {prefix}
        {tokens
          ? renderTokenizedText(line.text, line.chars, isRemoved, charBg, tokens)
          : line.chars
            ? line.chars.map((c, ci) => {
                const highlight = isRemoved ? c.removed : c.added
                return (
                  <span
                    key={ci}
                    style={highlight ? { background: charBg } : undefined}
                  >
                    {c.value}
                  </span>
                )
              })
            : line.text}
      </div>
    </div>
  )
}

function SplitContextPair({
  line,
  tokenMap,
  lineNumLeft,
  lineNumRight,
  gutterWidth,
}: {
  line: DiffLine
  tokenMap?: TokenMap
  lineNumLeft: number | undefined
  lineNumRight: number | undefined
  gutterWidth: number
}) {
  return (
    <Fragment>
      <SplitCell line={line} side="left" tokenMap={tokenMap} lineNum={lineNumLeft} gutterWidth={gutterWidth} />
      <SplitCell line={line} side="right" tokenMap={tokenMap} lineNum={lineNumRight} gutterWidth={gutterWidth} />
    </Fragment>
  )
}

function SplitView({
  sections,
  getRevealed,
  expandTop,
  expandBottom,
  tokenMap,
  gutterWidth,
}: {
  sections: SectionWithStart[]
  getRevealed: (si: number) => { top: number; bottom: number }
  expandTop: (si: number) => void
  expandBottom: (si: number) => void
  tokenMap?: TokenMap
  gutterWidth: number
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {sections.map((section, si) => {
        if (section.kind === "change") {
          const rows = buildSplitRows(section.lines, section.startA, section.startB)
          return rows.map((row, ri) => (
            <Fragment key={`${si}-${ri}`}>
              <SplitCell line={row.left} side="left" tokenMap={tokenMap} lineNum={row.lineNumLeft} gutterWidth={gutterWidth} />
              <SplitCell line={row.right} side="right" tokenMap={tokenMap} lineNum={row.lineNumRight} gutterWidth={gutterWidth} />
            </Fragment>
          ))
        }

        if (!section.collapsible) {
          // Non-collapsible context: track line numbers per line
          let curA = section.startA
          let curB = section.startB
          return section.lines.map((line, li) => {
            const lnL = line.type !== "no-eof" ? curA : undefined
            const lnR = line.type !== "no-eof" ? curB : undefined
            if (line.type === "context") { curA++; curB++ }
            return (
              <SplitContextPair
                key={`${si}-${li}`}
                line={line}
                tokenMap={tokenMap}
                lineNumLeft={lnL}
                lineNumRight={lnR}
                gutterWidth={gutterWidth}
              />
            )
          })
        }

        const top = section.lines.slice(0, CONTEXT)
        const mid = section.lines.slice(CONTEXT, -CONTEXT)
        const bot = section.lines.slice(-CONTEXT)
        const { top: revTop, bottom: revBottom } = getRevealed(si)
        const clampedTop = Math.min(revTop, mid.length)
        const clampedBottom = Math.min(revBottom, mid.length - clampedTop)
        const revealedTopLines = mid.slice(0, clampedTop)
        const revealedBotLines = mid.slice(mid.length - clampedBottom)
        const hiddenMid = mid.slice(clampedTop, mid.length - clampedBottom)
        const hunkLabel = section.midHunk
          ? `@@ -${section.midHunk.a},${section.midHunk.aCount} +${section.midHunk.b},${section.midHunk.bCount} @@`
          : `${mid.length} unchanged lines`

        // Compute starting line numbers for each sub-slice
        const topStartA = section.startA
        const topStartB = section.startB
        const midStartA = topStartA + CONTEXT
        const midStartB = topStartB + CONTEXT
        const botStartA = midStartA + mid.length
        const botStartB = midStartB + mid.length
        const revealedBotStartA = botStartA - clampedBottom
        const revealedBotStartB = botStartB - clampedBottom

        return (
          <Fragment key={si}>
            {top.map((line, li) => (
              <SplitContextPair
                key={li}
                line={line}
                tokenMap={tokenMap}
                lineNumLeft={topStartA + li}
                lineNumRight={topStartB + li}
                gutterWidth={gutterWidth}
              />
            ))}
            {revealedTopLines.map((line, li) => (
              <SplitContextPair
                key={`rt-${li}`}
                line={line}
                tokenMap={tokenMap}
                lineNumLeft={midStartA + li}
                lineNumRight={midStartB + li}
                gutterWidth={gutterWidth}
              />
            ))}
            {hiddenMid.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <ExpandRow
                  label={hunkLabel}
                  si={si}
                  hiddenMid={hiddenMid.length}
                  canExpandTop={clampedTop < mid.length - clampedBottom}
                  canExpandBottom={clampedBottom < mid.length - clampedTop}
                  onExpandTop={() => expandTop(si)}
                  onExpandBottom={() => expandBottom(si)}
                  gutterWidth={gutterWidth}
                  splitMode={true}
                />
              </div>
            )}
            {revealedBotLines.map((line, li) => (
              <SplitContextPair
                key={`rb-${li}`}
                line={line}
                tokenMap={tokenMap}
                lineNumLeft={revealedBotStartA + li}
                lineNumRight={revealedBotStartB + li}
                gutterWidth={gutterWidth}
              />
            ))}
            {bot.map((line, li) => (
              <SplitContextPair
                key={`b-${li}`}
                line={line}
                tokenMap={tokenMap}
                lineNumLeft={botStartA + li}
                lineNumRight={botStartB + li}
                gutterWidth={gutterWidth}
              />
            ))}
          </Fragment>
        )
      })}
    </div>
  )
}

// --- File-level hunk summary header ---

function computeFileSummary(lines: DiffLine[]): {
  linesA: number
  linesB: number
  linesAdded: number
  linesRemoved: number
} {
  let linesA = 0
  let linesB = 0
  let linesAdded = 0
  let linesRemoved = 0
  for (const line of lines) {
    if (line.type === "no-eof") continue
    if (line.type === "removed") {
      linesA++
      linesRemoved++
    } else if (line.type === "added") {
      linesB++
      linesAdded++
    } else {
      // context
      linesA++
      linesB++
    }
  }
  return { linesA, linesB, linesAdded, linesRemoved }
}

function FileSummaryHeader({
  linesA,
  linesB,
  linesAdded,
  linesRemoved,
}: {
  linesA: number
  linesB: number
  linesAdded: number
  linesRemoved: number
}) {
  return (
    <div
      style={{
        color: "var(--terminal-mid)",
        padding: "0 0.5rem",
        borderBottom: "1px solid var(--terminal-text)",
        opacity: 0.7,
        display: "flex",
        gap: "0.75rem",
        alignItems: "baseline",
      }}
    >
      <span>{`@@ -1,${linesA} +1,${linesB} @@`}</span>
      {(linesAdded > 0 || linesRemoved > 0) && (
        <span>
          {linesAdded > 0 && (
            <span style={{ color: "rgba(0, 180, 0, 0.9)" }}>
              {`+${linesAdded}`}
            </span>
          )}
          {linesAdded > 0 && linesRemoved > 0 && " "}
          {linesRemoved > 0 && (
            <span style={{ color: "rgba(200, 0, 0, 0.9)" }}>
              {`-${linesRemoved}`}
            </span>
          )}
        </span>
      )}
    </div>
  )
}

// --- Main DiffView ---

export function DiffView({
  textA,
  textB,
  mode = "unified",
  language,
}: {
  textA: string
  textB: string
  mode?: "unified" | "split"
  language?: string
}) {
  const lines = computeLines(textA, textB)
  const { linesA, linesB, linesAdded, linesRemoved } = computeFileSummary(lines)

  // Track incremental reveal state per collapsible section index (unified mode)
  const [revealed, setRevealed] = useState<
    Map<number, { top: number; bottom: number }>
  >(new Map())

  // Syntax highlighting token map — computed async, falls back to plain text
  const [tokenMap, setTokenMap] = useState<TokenMap | undefined>(undefined)

  useEffect(() => {
    if (!language) {
      setTokenMap(undefined)
      return
    }
    let cancelled = false
    buildTokenMap(lines, language).then((map) => {
      if (!cancelled) setTokenMap(map)
    })
    return () => {
      cancelled = true
    }
    // Re-run whenever the source texts or language change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textA, textB, language])

  // Sections and expand state shared by both modes
  const sections = buildSections(lines)

  // Compute gutter width from max line number digit count
  const maxLineNum = Math.max(linesA, linesB, 1)
  const gutterWidth = String(maxLineNum).length + 1 // +1 for padding

  function getRevealed(si: number) {
    return revealed.get(si) ?? { top: 0, bottom: 0 }
  }

  function expandTop(si: number) {
    setRevealed((prev) => {
      const next = new Map(prev)
      const cur = next.get(si) ?? { top: 0, bottom: 0 }
      next.set(si, { ...cur, top: cur.top + EXPAND_SIZE })
      return next
    })
  }

  function expandBottom(si: number) {
    setRevealed((prev) => {
      const next = new Map(prev)
      const cur = next.get(si) ?? { top: 0, bottom: 0 }
      next.set(si, { ...cur, bottom: cur.bottom + EXPAND_SIZE })
      return next
    })
  }

  if (mode === "split") {
    return (
      <div
        style={{
          fontFamily: "inherit",
          fontSize: "0.75rem",
          lineHeight: "1rem",
          whiteSpace: "pre",
          border: "1px solid var(--terminal-text)",
          overflowX: "auto",
        }}
      >
        <FileSummaryHeader
          linesA={linesA}
          linesB={linesB}
          linesAdded={linesAdded}
          linesRemoved={linesRemoved}
        />
        <SplitView
          sections={sections}
          getRevealed={getRevealed}
          expandTop={expandTop}
          expandBottom={expandBottom}
          tokenMap={tokenMap}
          gutterWidth={gutterWidth}
        />
      </div>
    )
  }

  // Unified mode — track A and B counters as we iterate sections and lines
  let curA = 1
  let curB = 1

  return (
    <div
      style={{
        fontFamily: "inherit",
        fontSize: "0.75rem",
        lineHeight: "1rem",
        whiteSpace: "pre-wrap",
        border: "1px solid var(--terminal-text)",
        overflowX: "auto",
      }}
    >
      <FileSummaryHeader
        linesA={linesA}
        linesB={linesB}
        linesAdded={linesAdded}
        linesRemoved={linesRemoved}
      />
      {sections.map((section, si) => {
        if (section.kind === "change") {
          return section.lines.map((line, li) => {
            const lnA = line.type === "removed" ? curA : line.type === "context" ? curA : undefined
            const lnB = line.type === "added" ? curB : line.type === "context" ? curB : undefined
            if (line.type !== "no-eof") {
              if (line.type !== "added") curA++
              if (line.type !== "removed") curB++
            }
            return (
              <ChangeLine
                key={`${si}-${li}`}
                line={line}
                tokenMap={tokenMap}
                lineNumA={lnA}
                lineNumB={lnB}
                gutterWidth={gutterWidth}
              />
            )
          })
        }

        if (!section.collapsible) {
          return section.lines.map((line, li) => {
            const lnA = line.type !== "no-eof" ? curA : undefined
            const lnB = line.type !== "no-eof" ? curB : undefined
            if (line.type === "context") { curA++; curB++ }
            return (
              <ContextLine
                key={`${si}-${li}`}
                line={line}
                tokenMap={tokenMap}
                lineNumA={lnA}
                lineNumB={lnB}
                gutterWidth={gutterWidth}
              />
            )
          })
        }

        // Collapsible: show CONTEXT lines at top and bottom, collapse the middle
        const top = section.lines.slice(0, CONTEXT)
        const mid = section.lines.slice(CONTEXT, -CONTEXT)
        const bot = section.lines.slice(-CONTEXT)

        const { top: revealedTop, bottom: revealedBottom } = getRevealed(si)

        // Clamp so the two reveal windows don't overlap
        const clampedTop = Math.min(revealedTop, mid.length)
        const clampedBottom = Math.min(revealedBottom, mid.length - clampedTop)

        const visibleTop = top.concat(mid.slice(0, clampedTop))
        const visibleBot = mid.slice(mid.length - clampedBottom).concat(bot)
        const hiddenMid = mid.slice(clampedTop, mid.length - clampedBottom)

        // Starting line numbers for this section
        const sectionStartA = curA
        const sectionStartB = curB

        // Advance curA/curB by counting all lines in the section (top + mid + bot)
        for (const line of section.lines) {
          if (line.type === "context") { curA++; curB++ }
          // no-eof lines don't advance counters
        }

        const topStartA = sectionStartA
        const topStartB = sectionStartB
        const midStartA = topStartA + CONTEXT
        const midStartB = topStartB + CONTEXT
        // Bot starts after all mid lines
        const botStartA = midStartA + mid.length
        const botStartB = midStartB + mid.length
        const revealedTopStartA = midStartA
        const revealedTopStartB = midStartB
        const revealedBotStartA = botStartA - clampedBottom
        const revealedBotStartB = botStartB - clampedBottom

        // All lines revealed — render inline with no expand buttons
        if (hiddenMid.length === 0) {
          return (
            <div key={si}>
              {visibleTop.map((line, li) => (
                <ContextLine
                  key={li}
                  line={line}
                  tokenMap={tokenMap}
                  lineNumA={topStartA + li}
                  lineNumB={topStartB + li}
                  gutterWidth={gutterWidth}
                />
              ))}
              {visibleBot.map((line, li) => {
                // visibleBot = revealed-bot-lines + static bot lines
                const revealedBotCount = clampedBottom
                const isRevealedPart = li < revealedBotCount
                const lnA = isRevealedPart
                  ? revealedBotStartA + li
                  : botStartA + (li - revealedBotCount)
                const lnB = isRevealedPart
                  ? revealedBotStartB + li
                  : botStartB + (li - revealedBotCount)
                return (
                  <ContextLine
                    key={`b${li}`}
                    line={line}
                    tokenMap={tokenMap}
                    lineNumA={lnA}
                    lineNumB={lnB}
                    gutterWidth={gutterWidth}
                  />
                )
              })}
            </div>
          )
        }

        const hunkLabel = section.midHunk
          ? `@@ -${section.midHunk.a},${section.midHunk.aCount} +${section.midHunk.b},${section.midHunk.bCount} @@`
          : `${mid.length} unchanged lines`

        const staticTop = section.lines.slice(0, CONTEXT)
        const revealedTopLines = mid.slice(0, clampedTop)
        const revealedBotLines = mid.slice(mid.length - clampedBottom)
        const staticBot = section.lines.slice(-CONTEXT)

        return (
          <div key={si}>
            {staticTop.map((line, li) => (
              <ContextLine
                key={li}
                line={line}
                tokenMap={tokenMap}
                lineNumA={topStartA + li}
                lineNumB={topStartB + li}
                gutterWidth={gutterWidth}
              />
            ))}
            <RevealBlock
              lines={revealedTopLines}
              revealKey={clampedTop}
              tokenMap={tokenMap}
              startLineNumA={revealedTopStartA}
              startLineNumB={revealedTopStartB}
              gutterWidth={gutterWidth}
            />
            <ExpandRow
              label={hunkLabel}
              si={si}
              hiddenMid={hiddenMid.length}
              canExpandTop={clampedTop < mid.length - clampedBottom}
              canExpandBottom={clampedBottom < mid.length - clampedTop}
              onExpandTop={() => expandTop(si)}
              onExpandBottom={() => expandBottom(si)}
              gutterWidth={gutterWidth}
            />
            <RevealBlock
              lines={revealedBotLines}
              revealKey={clampedBottom}
              tokenMap={tokenMap}
              startLineNumA={revealedBotStartA}
              startLineNumB={revealedBotStartB}
              gutterWidth={gutterWidth}
            />
            {staticBot.map((line, li) => (
              <ContextLine
                key={`b${li}`}
                line={line}
                tokenMap={tokenMap}
                lineNumA={botStartA + li}
                lineNumB={botStartB + li}
                gutterWidth={gutterWidth}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
