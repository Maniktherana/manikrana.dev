import { Code } from "@/components/design/code";
import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";

const metadataTokens = [
  { label: "Prop", value: "defaultValue" },
  { label: "Event", value: "onValueChange" },
  { label: "Slot", value: "data-slot" },
  { label: "State", value: "aria-invalid" },
] as const;

const commandRows = [
  { label: "Typecheck", value: "bun --cwd apps/design typecheck" },
  { label: "Status", value: "git status --short" },
  { label: "Install primitive", value: "bunx shadcn@latest add button" },
  { label: "Build", value: "bun run build" },
] as const;

const tokenValues = ["bg-muted", "text-foreground", "border", "--secondary-foreground"] as const;

function CodePage() {
  return (
    <ComponentPageShell title="Code">
      <ComponentDemoBand label="INLINE PROSE" className="mt-8 max-w-3xl">
        <div className="flex flex-col gap-4">
          <p className="medusa-small">
            Use <Code>Code</Code> for short fragments that belong inside prose, such as the{" "}
            <Code>variant=&quot;outline&quot;</Code> prop, a filter like <Code>status:ready</Code>,
            or a field path like <Code>order.total</Code>.
          </p>
          <p className="medusa-small">
            Keep longer examples in code blocks. Inline code should stay compact enough to scan
            beside table descriptions, labels, and form help text.
          </p>
        </div>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="LABELS AND METADATA"
        className="mt-8 grid w-full max-w-3xl gap-3 sm:grid-cols-2"
      >
        {metadataTokens.map((token) => (
          <div key={token.value} className="medusa-raised flex flex-col gap-2 p-3">
            <p className="medusa-code-label">{token.label}</p>
            <Code>{token.value}</Code>
            <p className="medusa-small">
              Tokenized fragments stay distinct without becoming a full code block.
            </p>
          </div>
        ))}
      </ComponentDemoBand>

      <ComponentDemoBand label="COMPACT VALUE ROWS" className="mt-8 w-full max-w-3xl">
        <div className="medusa-raised divide-y overflow-hidden">
          {commandRows.map((row) => (
            <div
              key={row.value}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-2"
            >
              <span className="medusa-small">{row.label}</span>
              <Code>{row.value}</Code>
            </div>
          ))}
        </div>
      </ComponentDemoBand>

      <ComponentDemoBand label="DESIGN TOKENS" className="mt-8 flex flex-wrap items-center gap-3">
        <span className="medusa-code-label">Surface</span>
        <Code>medusa-raised</Code>
        <span className="medusa-code-label">Classes</span>
        {tokenValues.map((token) => (
          <Code key={token}>{token}</Code>
        ))}
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { CodePage };
