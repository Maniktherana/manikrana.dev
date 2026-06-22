import { type ReactNode } from "react";

import {
  Code,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockSource,
} from "@/components/design/code";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";

const codeBlockPreviewTitles: Record<string, string> = {
  "code-block-demo": "Code Block Demo",
  "code-block-collapsible": "Code Block Collapsible",
  "code-block-header": "Code Block Header",
  "code-block-languages": "Code Block Languages",
  "code-inline": "Inline Code",
};

const demoCode = `import { Button } from "@/components/ui/button";

export function SaveButton() {
  return <Button type="button">Save changes</Button>;
}`;

const longCode = `import { Button } from "@/components/ui/button";
import { Group } from "@/components/ui/group";

export function ToolbarActions() {
  return (
    <Group>
      <Button variant="outline">Preview</Button>
      <Button variant="outline">Code</Button>
      <Button variant="outline">Share</Button>
      <Button variant="outline">Export</Button>
      <Button variant="outline">Settings</Button>
      <Button variant="outline">More</Button>
    </Group>
  );
}

export function ToolbarFooter() {
  return (
    <Group>
      <Button variant="ghost">Cancel</Button>
      <Button>Confirm</Button>
    </Group>
  );
}`;

const bashCode = `bun add @acme/ui
bun run build`;

const envCode = `DATABASE_URL="postgres://localhost:5432/app"
JWT_SECRET="supersecret"
STORE_CORS="http://localhost:8000"`;

function CodeBlockDemo() {
  return <CodeBlockSource code={demoCode} className="max-w-md" />;
}

function CodeBlockCollapsible() {
  return <CodeBlockSource code={longCode} collapsible className="max-w-md" />;
}

// The header is a plain slot — compose whatever you want inside it.
function CodeBlockHeaderDemo() {
  return (
    <CodeBlock className="max-w-md">
      <CodeBlockHeader>
        <Badge variant="secondary">TSX</Badge>
        <span className="text-xs text-[var(--muted-foreground)] dark:text-[rgb(255_255_255/56%)]">
          save-button.tsx
        </span>
        <CopyButton value={demoCode} className="ml-auto" />
      </CodeBlockHeader>
      <CodeBlockBody>
        <CodeBlockContent code={demoCode} language="tsx" />
      </CodeBlockBody>
    </CodeBlock>
  );
}

function CodeBlockLanguages() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <CodeBlockSource code={bashCode} language="bash" />
      <CodeBlockSource code={envCode} language="env" />
    </div>
  );
}

function CodeInline() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p>
        Run <Code>bun install</Code> and then import the <Code>Button</Code> component.
      </p>
      <p>
        Use the <Code>npm run dev</Code> script with a <Code>--port</Code> flag.
      </p>
    </div>
  );
}

const codeBlockPreviews: Record<string, () => ReactNode> = {
  "code-block-demo": CodeBlockDemo,
  "code-block-collapsible": CodeBlockCollapsible,
  "code-block-header": CodeBlockHeaderDemo,
  "code-block-languages": CodeBlockLanguages,
  "code-inline": CodeInline,
};

function renderCodeBlockPreview(name: string) {
  const Preview = codeBlockPreviews[name];

  return Preview ? <Preview /> : null;
}

export { codeBlockPreviewTitles, renderCodeBlockPreview };
