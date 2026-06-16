import { CodeBlock } from "@/components/design/code";
import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";

const tsxSnippet = `import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FulfillmentStatus = "pending" | "packed" | "shipped";

function OrderSummary({ status }: { status: FulfillmentStatus }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order #1088</CardTitle>
        <Badge variant="secondary">{status}</Badge>
      </CardHeader>
      <CardContent>
        <Button type="button" size="sm">
          Create shipment
        </Button>
      </CardContent>
    </Card>
  );
}`;

const shellSnippet = `bun --cwd apps/design install
bun --cwd apps/design typecheck
bun --cwd apps/design build`;

const compactSnippet = `await navigator.clipboard.writeText(order.id);`;

const envSnippet = `MEDUSA_ADMIN_API=http://localhost:9000`;

function CodeBlockPage() {
  return (
    <ComponentPageShell title="Code Block">
      <ComponentDemoBand label="TYPESCRIPT" className="mt-8 grid w-full max-w-4xl gap-6">
        <CodeBlock code={tsxSnippet} language="tsx" />
      </ComponentDemoBand>

      <ComponentDemoBand label="SHELL COMMANDS" className="mt-8 grid w-full max-w-3xl gap-6">
        <CodeBlock code={shellSnippet} language="bash" />
      </ComponentDemoBand>

      <ComponentDemoBand
        label="COMPACT COPY ACTIONS"
        className="mt-8 grid w-full max-w-4xl gap-4 md:grid-cols-2"
      >
        <CodeBlock code={compactSnippet} language="ts" className="min-w-0" />
        <CodeBlock code={envSnippet} language="env" className="min-w-0" />
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { CodeBlockPage };
