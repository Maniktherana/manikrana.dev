import type * as React from "react";

import { Code } from "@/components/design/code";

const codePreviewTitles: Record<string, string> = {
  "code-demo": "Code",
  "code-inline": "Code Inline",
};

function CodeDemo() {
  return <Code>order.total</Code>;
}

function CodeInline() {
  return (
    <p className="max-w-md text-[13px] leading-[1.6] text-secondary-foreground">
      Use <Code>Code</Code> for prop names, file fragments, and compact inline tokens inside prose.
    </p>
  );
}

const codePreviews: Record<string, React.ComponentType> = {
  "code-demo": CodeDemo,
  "code-inline": CodeInline,
};

function renderCodePreview(name: string) {
  const Preview = codePreviews[name];

  return Preview ? <Preview /> : null;
}

export { codePreviewTitles, renderCodePreview };
